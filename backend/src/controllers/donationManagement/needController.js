const Need = require("../../models/needsModel");
const path = require("path");
const mongoose = require("mongoose");
const uploadNeedPictures = require("../../middleware/uploadNeedPictures");
const AppError = require("../../utils/appError");
const APIFeatures = require("../../utils/apiFeatures"); // Adjust path as needed
const socketIO = require("../../utils/socketConfig"); // Adjust path as needed
const Application = require("../../models/applicationModel");
const MaterialDonation = require("../../models/matterialDonation");
const onlineUsers = socketIO.onlineUsers; // Adjust path as needed
const io = socketIO.getIO; // Adjust path as needed
const User = require("../../models/User");
const fs = require("fs");
console.log("onlineUsers", onlineUsers, io);
const Report = require("../../models/Report");
const { sendNotification } = require("../../utils/notificationService");
const sendNotificationToGroup =
  require("../../utils/socketConfig").sendNotificationToGroup; // Adjust path as needed
// Helper function to handle the upload
const Payment = require("../../models/paymentModel");
const Donations = require("../../models/donationsModel");
const handleUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    uploadNeedPictures(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
const postNgosNeed = async (req, res, next) => {
  try {
    const uploadedFiles =
      req.files?.map((file) =>
        path.join("donations", path.basename(file.path))
      ) || [];

    // Parse and validate form data
    const {
      title,
      needTypes: needTypesStr,
      urgencyLevel,
      description,
      endDate,
      targetMoney,
      numberOfBeneficiaries,
      latitude,
      longitude,
      address,
      materialCategories: materialCategoriesStr,
      serviceCategories: serviceCategoriesStr,
    } = req.body;

    // Parse JSON fields
    const needTypes = JSON.parse(needTypesStr);
    const materialCategories = materialCategoriesStr
      ? JSON.parse(materialCategoriesStr)
      : [];
    const serviceCategories = serviceCategoriesStr
      ? JSON.parse(serviceCategoriesStr)
      : [];

    // Validate need types according to model
    if (
      !Array.isArray(needTypes) ||
      needTypes.length === 0 ||
      needTypes.length > 3
    ) {
      throw new AppError("Must specify 1-3 unique need types", 400);
    }
    if (new Set(needTypes).size !== needTypes.length) {
      throw new AppError("Need types must be unique", 400);
    }

    // Validate categories based on need types
    if (needTypes.includes("material") && materialCategories.length === 0) {
      throw new AppError(
        "Material categories required when need type includes material",
        400
      );
    }

    if (needTypes.includes("service") && serviceCategories.length === 0) {
      throw new AppError(
        "Service categories required when need type includes service",
        400
      );
    }

    // Validate location coordinates
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new AppError("Invalid location coordinates", 400);
    }

    // Create the new need document
    const need = new Need({
      NGO: req.user._id,
      title,
      needTypes,
      urgencyLevel,
      description,
      endDate,
      targetMoney: needTypes.includes("money") ? parseFloat(targetMoney) : null,
      beneficiaryInfo: {
        numberOfBeneficiaries: parseInt(numberOfBeneficiaries),
        pictures: uploadedFiles,
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address,
        },
      },
      categories: {
        material: materialCategories.map((cat) => ({
          categoryName: cat.categoryName,
          subCategoryName: cat.subCategoryName,
          targetAmountNeeded: cat.targetAmountNeeded,
          unit: cat.unit,
        })),
        service: serviceCategories.map((cat) => ({
          categoryName: cat.categoryName,
          subCategoryName: cat.subCategoryName,
          vacancy: cat.vacancy,
        })),
      },
    });

    const donors = await User.find({
      role: "individual_donor" || "organization_donor",
    });
    donors.forEach((donor) => {
      sendNotification(
        donor._id,
        `New need posted by ${req.user.name}`,
        "need",
        `/donor/dashboard`
      );
    });

    // Validate the document against the schema
    const validationError = need.validateSync();
    if (validationError) {
      throw new AppError(validationError.message, 400);
    }

    await need.save();

    res.status(201).json({
      success: true,
      message: "Need posted successfully",
      data: need,
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files?.length) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error("Failed to delete uploaded file:", file.path, err);
        }
      });
    }

    if (error instanceof SyntaxError) {
      return next(new AppError("Invalid JSON data in form fields", 400));
    }
    if (error.name === "ValidationError") {
      return next(new AppError(error.message, 400));
    }
    next(error);
  }
};
// Endpoint to make isReportGenerated false for all needs
// controllers/statisticsController.js

const getAllServiceNeeds = async (req, res) => {
  try {
    // 1. BASE QUERY - Only service needs
    let query = { needTypes: "service" };

    // 2. FILTERING - Status and Urgency with combined conditions
    const filterConditions = {};
    if (req.query.status) filterConditions.status = req.query.status;
    if (req.query.urgency) filterConditions.urgencyLevel = req.query.urgency;

    // Combine filters with AND condition
    if (Object.keys(filterConditions).length > 0) {
      query = { ...query, ...filterConditions };
    }

    // 3. SEARCH - Debounced search across multiple fields
    if (req.query.search && req.query.search.trim() !== "") {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { "NGO.name": searchRegex },
        { "beneficiaryInfo.location.address": searchRegex },
      ];
    }

    // 4. COUNT TOTAL (for pagination) - Before applying pagination
    const totalCount = await Need.countDocuments(query);

    // 5. SORTING
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (req.query.sortBy && req.query.order) {
      sortOption = {};
      sortOption[req.query.sortBy] = req.query.order === "asc" ? 1 : -1;
    }

    // 6. PAGINATION
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6; // Match frontend default
    const skip = (page - 1) * limit;

    // 7. EXECUTE QUERY
    const needs = await Need.find(query)
      .populate("NGO", "name profilePicture email phone")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select("-__v"); // Exclude version field

    res.status(200).json({
      success: true,
      count: needs.length,
      total: totalCount,
      data: needs,
    });
  } catch (error) {
    console.error("Error fetching service needs:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
//get all NGO service needs
const getAllNGOServiceNeeds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Find all service needs for the given NGO with pagination
    const [needs, totalCount] = await Promise.all([
      Need.find({
        NGO: req.user?._id,
        needTypes: ["service"],
      })
        .populate("NGO", "name email") // Populate NGO basic info
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit),
      Need.countDocuments({
        NGO: req.user?._id,
        needTypes: ["service"],
      }),
    ]);

    if (!needs || needs.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No service needs found for the specified NGO",
      });
    }

    res.status(200).json({
      success: true,
      data: needs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching NGO service needs:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid NGO ID",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
// Get all needs (with optional filtering)
// In your backend route file (e.g., donationRoutes.js)
const getAllNeeds = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category = "all" } = req.query;

    const query = {
      status: "Open",
      // isVerified: true,
    };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { needTypes: { $regex: search, $options: "i" } },
      ];
    }

    // Add category filter
    if (category !== "all") {
      query.needTypes = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalItems = await Need.countDocuments(query);

    const needs = await Need.find(query)
      .sort({ urgencyLevel: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("NGO", "name email")
      .then((needs) => {
        if (category === "service") {
          return needs.filter((need) => need.needTypes.includes("service"));
        } else if (category === "all") {
          return needs.filter((need) => !need.needTypes.includes("service"));
        }
        return needs;
      });

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: needs,
      currentPage: parseInt(page),
      totalPages,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHomeNeeds = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category = "all" } = req.query;

    const query = {
      status: "Open",
      // isVerified: true,
    };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { needTypes: { $regex: search, $options: "i" } },
      ];
    }

    // Add category filter
    if (category !== "all") {
      query.needTypes = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalItems = await Need.countDocuments(query);

    const needs = await Need.find(query)
      .sort({ urgencyLevel: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("NGO", "name email");

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: needs,
      currentPage: parseInt(page),
      totalPages,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get needs by NGO ID
const getNeedsByNgo = async (req, res) => {
  try {
    const ngoId = req.params.ngoId;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { NGO: ngoId, isReportGenerated: false };

    if (status) {
      filter.status = status;
    }

    // Convert page and limit to numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count of documents
    const total = await Need.countDocuments(filter);

    const needs = await Need.find(filter)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limitNumber);
    // .populate("application", "status donor") // Uncomment if you need to populate

    if (!needs || needs.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No needs found for this NGO",
      });
    }

    res.status(200).json({
      success: true,
      count: needs.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      data: needs,
    });
  } catch (error) {
    console.error("Error fetching NGO needs:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
const getNeedsReportShouldGeneratedFor = async (req, res) => {
  try {
    const ngoId = req.params.ngoId;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { NGO: ngoId, isReportGenerated: false, hasDonations: true };

    if (status) {
      filter.status = status;
    }

    // Convert page and limit to numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count of documents
    const total = await Need.countDocuments(filter);

    const needs = await Need.find(filter)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limitNumber);
    // .populate("application", "status donor") // Uncomment if you need to populate

    if (!needs || needs.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No needs found for this NGO",
      });
    }

    res.status(200).json({
      success: true,
      count: needs.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      data: needs,
    });
  } catch (error) {
    console.error("Error fetching NGO needs:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
const getReportPreview = async (req, res) => {
  try {
    const { needId, categories } = req.params;
    const { needTypes } = req.query;

    if (!needTypes || needTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: " and at least one need type are required",
      });
    }

    const validNeedTypes = ["material", "service", "money"];
    const invalidTypes = needTypes.filter(
      (type) => !validNeedTypes.includes(type)
    );

    if (invalidTypes.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid need types: ${invalidTypes.join(", ")}`,
      });
    }

    const need = await Need.findById(needId);
    if (!need) {
      return res.status(404).json({
        success: false,
        error: "Need not found",
      });
    }

    const [approvedApplications, materialDonations, monetaryDonations] =
      await Promise.all([
        needTypes.includes("service")
          ? await Application.find({
              need: needId,
              status: "Approved",
            }).populate("applicant", "name email phone")
          : Promise.resolve([]),

        needTypes.includes("material")
          ? await MaterialDonation.find({
              needId: needId,
            }).populate("donorId", "name email phone")
          : Promise.resolve([]),

        needTypes.includes("money")
          ? await Payment.find({
              needId: needId,
            }).populate("donorId", "name email phone")
          : Promise.resolve([]),
      ]);

    // Calculate material donations summary
    const materialsSummary = {};
    materialDonations.forEach((donation) => {
      donation.materials.forEach((material) => {
        const key = `${material.categoryName}-${material.subCategoryName}`;

        if (!materialsSummary[key]) {
          materialsSummary[key] = {
            category: material.categoryName,
            subCategory: material.subCategoryName,
            totalQuantity: 0,
            unit: material.unit || "",
          };
        }

        materialsSummary[key].totalQuantity += material.quantity;
      });
    });

    // Calculate money donations summary
    const moneySummary = {
      totalDonors: monetaryDonations.length,
      totalETB: monetaryDonations
        .filter((d) => d.currency === "ETB")
        .reduce((sum, donation) => sum + donation.amount, 0),
      totalUSD: monetaryDonations
        .filter((d) => d.currency === "USD")
        .reduce((sum, donation) => sum + donation.amount, 0),
    };

    // Transform data to match schema
    const transformedData = {
      services: approvedApplications.map((app) => ({
        applicant: app.applicant,
        category: app.category,
        subcategory: app.subCategory,
        startDate: app.startDate,
        endDate: app.endDate,
        hoursPerWeek: app.hoursPerWeek,
        motivation: app.motivation,
      })),

      materials: Object.values(materialsSummary),
      numberOfBeneficiaries: need.beneficiaryInfo.numberOfBeneficiaries,
      money: moneySummary,
    };

    const totals = {
      services: transformedData.services.length,
      materials: transformedData.materials.reduce(
        (sum, item) => sum + item.totalQuantity,
        0
      ),
      money: {
        totalDonors: moneySummary.totalDonors,
        totalETB: moneySummary.totalETB,
        totalUSD: moneySummary.totalUSD,
      },
    };

    const newReport = {
      need: needId,
      donations: transformedData,
      totals,
      status: "pending",
      NGO: req.user._id,
      createdBy: req.user._id,
    };

    res.status(201).json({
      success: true,
      message: "Report preview provided successfully",
      data: newReport,
      summary: totals,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Endpoint to identify the status of last need that created by the NGO

const getLastNeedStatus = async (req, res) => {
  try {
    const ngoId = req.user._id; // Get the NGO ID from the authenticated user
    const lastNeed = await Need.findOne({ NGO: ngoId })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .limit(1); // Get the most recent need

    if (!lastNeed) {
      return res.status(404).json({
        success: false,
        message: "No needs found for this NGO",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: lastNeed.status,
        createdAt: lastNeed.createdAt,
        title: lastNeed.title,
      },
    });
  } catch (error) {
    console.error("Error fetching last need status:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("need", "title")
      .populate("NGO", "name")
      .populate("createdBy", "name")
      .populate("donations.services.applicant", "name");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const generateReport = async (req, res) => {
  try {
    const pictures =
      req.files?.map((file) =>
        path.join("donations", path.basename(file.path))
      ) || [];
    console.log("body", req.query);

    const { needId } = req.body;
    let { needTypes } = req.body;

    needTypes = JSON.parse(needTypes);

    if (!needTypes || needTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: " and at least one need type are required",
      });
    }
    const validNeedTypes = ["material", "service", "money"];
    const invalidTypes = needTypes.filter(
      (type) => !validNeedTypes.includes(type)
    );
    if (invalidTypes.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid need types: ${invalidTypes.join(", ")}`,
      });
    }

    const need = await Need.findById(needId);
    if (!need) {
      return res.status(404).json({
        success: false,
        error: "Need not found",
      });
    }

    const [approvedApplications, materialDonations] = await Promise.all([
      needTypes.includes("service")
        ? await Application.find({
            need: needId,
            status: "Approved",
          }).populate("applicant", "name email phone")
        : Promise.resolve([]),

      needTypes.includes("material")
        ? await MaterialDonation.find({
            needId: needId,
          }).populate("donorId", "name email phone")
        : Promise.resolve([]),
    ]);
    const materialsSummary = {};

    materialDonations.forEach((donation) => {
      donation.materials.forEach((material) => {
        const key = `${material.categoryName}-${material.subCategoryName}`;

        if (!materialsSummary[key]) {
          materialsSummary[key] = {
            category: material.categoryName,
            subCategory: material.subCategoryName,
            totalQuantity: 0,
            unit: material.unit || "",
          };
        }

        materialsSummary[key].totalQuantity += material.quantity;
      });
    });

    // Convert object to array for report
    const summarizedMaterials = Object.values(materialsSummary);

    // Transform data to match schema
    const transformedData = {
      services: approvedApplications.map((app) => ({
        applicant: app.applicant,
        category: app.category,
        subcategory: app.subCategory,
        startDate: app.startDate,
        endDate: app.endDate,
        hoursPerWeek: app.hoursPerWeek,
        motivation: app.motivation,
      })),

      materials: summarizedMaterials,
    };
    const newReport = {
      need: needId,
      description: req.body.description,
      donations: transformedData,
      pictures,
      status: "pending",
      beneficiariesReached:need?.beneficiaryInfo?.numberOfBeneficiaries,
      NGO: req.user._id,
      createdBy: req.user._id,
    };

    const report = await Report.create(newReport);
    need.isReportGenerated = true;
    need.save();
    const donors = await User.find({
      role: "individual_donor" || "organization_donor",
    });
    donors.forEach((donor) => {
      sendNotification(
        donor._id,
        `New report posted by ${req.user.name}`,
        "report",
        `/report/${report._id}`
      );
    });
    const admins = await User.find({ role: "admin" });
    admins.forEach((admin) => {
      sendNotification(
        admin._id,
        `New report posted by ${req.user.name}`,
        "report",
        `/report/${report._id}`
      );
    });
    res.status(200).json({
      success: true,
      data: need,
    });
  } catch (error) {
    console.error("Error fetching need:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid need ID",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
const deleteNeed = async (req, res) => {
  try {
    const needId = req.params.id;
    const need = await Need.findById(needId);

    if (!need) {
      return res.status(404).json({
        success: false,
        error: "Need not found",
      });
    }

    // Check if the need has any associated applications, material donations, or payments
    const hasApplications = await Application.exists({ need: needId });
    const hasMaterialDonations = await MaterialDonation.exists({
      needId: needId,
    });
    const hasPayments = await Payment.exists({ need: needId });

    if (hasApplications || hasMaterialDonations || hasPayments) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete need as it has associated donations or applications",
      });
    }

    // If no associations exist, proceed with deletion
    await Need.findByIdAndDelete(needId);

    return res.status(200).json({
      success: true,
      message: "Need deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting need:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while deleting need",
    });
  }
};

const getNeedById = async (req, res) => {
  try {
    const need = await Need.findById(req.params.id)
      .populate("NGO", "name email") // Populate NGO basic info
      .populate("application", "status donor createdAt"); // Populate application info

    if (!need) {
      return res.status(404).json({
        success: false,
        error: "Need not found",
      });
    }

    res.status(200).json({
      success: true,
      data: need,
    });
  } catch (error) {
    console.error("Error fetching need:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid need ID",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

//get report by NGO means of user._id
const getReportByNgo = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const filter = { NGO: req.user._id };

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Report.countDocuments(filter);

    const reports = await Report.find(filter)
      .populate("need", "title description")
      .populate("NGO", "name email")
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limitNumber);

    if (!reports || reports.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No reports found for this NGO",
      });
    }

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching NGO reports:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
const getNGOStatistics = async (req, res) => {
  try {
    const ngoId = req.user._id;
    console.log("ngo is:", ngoId);
    const totalNeedsPosted = await Need.countDocuments({ NGO: ngoId });

    const beneficiariesReached = await Need.aggregate([
      { $match: { NGO: ngoId } },
      {
        $group: {
          _id: null,
          total: { $sum: "$beneficiaryInfo.numberOfBeneficiaries" },
        },
      },
    ]);
    const monetaryDonations = await Payment.aggregate([
      { $match: { NGOId: ngoId } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const totalMaterialItems =
      (await MaterialDonation.countDocuments({
        NGO: ngoId,
      })) + (await Donations.countDocuments({ NGO: ngoId }));

    const volunteerHours = await Application.aggregate([
      { $match: { status: "Approved", NGO: ngoId } },
      {
        $group: {
          _id: null,
          total: { $sum: "$hoursPerWeek" },
        },
      },
    ]);

    // 👇 NEW: Group material donations by month
    const monthlyDonations = await MaterialDonation.aggregate([
      { $match: { NGO: ngoId } },
      { $unwind: "$materials" },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalQuantity: { $sum: "$materials.quantity" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Format monthly donations nicely for frontend
    const formattedMonthlyDonations = monthlyDonations.map((entry) => {
      const month = entry._id.month.toString().padStart(2, "0");
      const year = entry._id.year;
      return {
        month: `${year}-${month}`, // e.g., "2025-04"
        quantity: entry.totalQuantity,
      };
    });
    const monetaryDonationsByCurrency = await Payment.aggregate([
      {
        $match: {
          NGOId: new mongoose.Types.ObjectId(ngoId),
          // status: "Completed", // Only count completed payments
        },
      },
      {
        $group: {
          _id: "$currency",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
        },
      },
      {
        $project: {
          currency: "$_id",
          total: 1,
          count: 1,
          avgAmount: 1,
          _id: 0,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Enhanced Service Applications Query
    console.log("ngoId", ngoId);
    const serviceApplicationsByStatus = await Application.aggregate([
      {
        $match: {
          NGO: ngoId,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgHours: { $avg: "$hoursPerWeek" },
        },
      },
      {
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", "Submitted"] }, then: 1 },
                { case: { $eq: ["$_id", "Under Review"] }, then: 2 },
                { case: { $eq: ["$_id", "Interview Scheduled"] }, then: 3 },
                { case: { $eq: ["$_id", "Approved"] }, then: 4 },
                { case: { $eq: ["$_id", "Accepted"] }, then: 5 },
                { case: { $eq: ["$_id", "Completed"] }, then: 6 },
                { case: { $eq: ["$_id", "On Hold"] }, then: 7 },
                { case: { $eq: ["$_id", "Rejected"] }, then: 8 },
                { case: { $eq: ["$_id", "Withdrawn"] }, then: 9 },
              ],
              default: 10,
            },
          },
        },
      },
      { $sort: { statusOrder: 1 } },
      {
        $project: {
          status: "$_id",
          count: 1,
          avgHours: 1,
          _id: 0,
        },
      },
    ]);
    console.log("service application", serviceApplicationsByStatus);
    const result = {
      monetaryDonations: monetaryDonations[0]?.total || 0, // Still placeholder
      materialDonations: totalMaterialItems,
      monetaryDonationsByCurrency,
      serviceApplicationsByStatus,
      volunteerServiceHours: volunteerHours[0]?.total || 0,
      beneficiariesReached: beneficiariesReached[0]?.total || 0,
      totalNeedsPosted,
      donationTrends: formattedMonthlyDonations, // 👈 Add this to the result
    };

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching NGO statistics:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};
const getAmountDonated = async (req, res) => {
  try {
    const { need } = req.params;

    // Validate the need ID
    if (!mongoose.Types.ObjectId.isValid(need)) {
      return res.status(400).json({ message: "Invalid need ID" });
    }

    // Find the need to get its target amounts and categories
    const needDoc = await mongoose
      .model("Needs")
      .findById(need)
      .select("needTypes targetMoney categories.material categories.service");

    if (!needDoc) {
      return res.status(404).json({ message: "Need not found" });
    }

    // Prepare response object
    const response = {
      success: true,
      needId: need,
      needTypes: needDoc.needTypes,
      donations: {},
    };

    // 1. Calculate for money need type
    if (needDoc.needTypes.includes("money")) {
      const moneyData = await calculateMoneyDonations(
        need,
        needDoc.targetMoney
      );
      response.donations.money = moneyData;
    }

    // 2. Calculate for material need type
    if (needDoc.needTypes.includes("material")) {
      const materialData = await calculateMaterialDonations(
        need,
        needDoc.categories.material
      );
      response.donations.material = materialData;
    }

    // 3. Calculate for service need type
    if (needDoc.needTypes.includes("service")) {
      const serviceData = await calculateServiceDonations(
        need,
        needDoc.categories.service
      );
      response.donations.service = serviceData;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting donated amount:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching donated amount",
      error: error.message,
    });
  }
};

// Helper function to calculate money donations
async function calculateMoneyDonations(needId, targetMoney) {
  const result = await mongoose.model("Payment").aggregate([
    {
      $match: {
        needId: new mongoose.Types.ObjectId(needId),
        status: "Completed",
      },
    },
    {
      $group: {
        _id: null,
        totalDonated: { $sum: "$amount" },
      },
    },
  ]);

  const totalDonated = result.length > 0 ? result[0].totalDonated : 0;
  const target = targetMoney || 0;
  let percentage = 0;

  if (target > 0) {
    percentage = (totalDonated / target) * 100;
    percentage = Math.round(percentage * 100) / 100;
  }

  return {
    donated: totalDonated,
    target: target,
    percentage: percentage,
    currency: "ETB", // Default currency, you can modify this based on your payment records
  };
}

// Helper function to calculate material donations
async function calculateMaterialDonations(needId, materialCategories) {
  const result = {};

  if (!materialCategories || materialCategories.length === 0) {
    return result;
  }

  // Get all completed material donations for this need
  const donations = await mongoose
    .model("MaterialDonation")
    .find({
      needId: needId,
      status: "completed",
    })
    .select("materials");

  // Initialize result structure with all categories
  materialCategories.forEach((item) => {
    const key = `${item.categoryName}-${item.subCategoryName}`;
    result[key] = {
      donated: 0,
      target: parseInt(item.targetAmountNeeded) || 0,
      percentage: 0,
      unit: item.unit || "",
    };
  });

  // Sum up all donated quantities
  donations.forEach((donation) => {
    donation.materials.forEach((item) => {
      const key = `${item.categoryName}-${item.subCategoryName}`;
      if (result[key]) {
        result[key].donated += item.quantity;
      }
    });
  });

  // Calculate percentages
  for (const key in result) {
    if (result[key].target > 0) {
      result[key].percentage =
        Math.round((result[key].donated / result[key].target) * 100 * 100) /
        100;
    }
  }

  return result;
}

// Helper function to calculate service donations
async function calculateServiceDonations(needId, serviceCategories) {
  const result = {
    totalApplications: 0,
    categories: {},
  };

  if (!serviceCategories || serviceCategories.length === 0) {
    return result;
  }

  // Get count of all applications for this need (regardless of status)
  const applications = await mongoose
    .model("Application")
    .find({ need: needId })
    .select("category subCategory");

  // Initialize result structure with all categories
  serviceCategories.forEach((item) => {
    const key = `${item.categoryName}-${item.subCategoryName}`;
    result.categories[key] = {
      target: parseInt(item.vacancy) || 0,
      applications: 0,
      percentageFilled: 0,
      remaining: parseInt(item.vacancy) || 0,
    };
  });

  // Count applications per category
  applications.forEach((app) => {
    const key = `${app.category}-${app.subCategory}`;
    if (result.categories[key]) {
      result.categories[key].applications += 1;
      result.totalApplications += 1;
    }
  });

  // Calculate percentages and remaining spots
  for (const key in result.categories) {
    const category = result.categories[key];

    // Calculate percentage filled (applications vs target)
    if (category.target > 0) {
      category.percentageFilled = Math.min(
        Math.round((category.applications / category.target) * 100 * 100) / 100,
        100
      );
      category.remaining = Math.max(0, category.target - category.applications);
    }
  }

  return result;
}




// Helper function to calculate material donations
// async function calculateMaterialDonations(needId, materialCategories) {
//   const result = {};

//   if (!materialCategories || materialCategories.length === 0) {
//     return result;
//   }

//   // Get all completed material donations for this need
//   const donations = await mongoose.model("MaterialDonation").aggregate([
//     {
//       $match: {
//         needId: new mongoose.Types.ObjectId(needId),
//         status: "completed",
//       },
//     },
//     {
//       $unwind: "$materials", // Split each material item into separate documents
//     },
//     {
//       $group: {
//         _id: {
//           categoryName: "$materials.categoryName",
//           subCategoryName: "$materials.subCategoryName",
//         },
//         totalDonated: { $sum: "$materials.quantity" },
//         // Get the unit from the first donation (assuming it's consistent)
//         unit: { $first: "$materials.unit" },
//       },
//     },
//   ]);

//   // Initialize result structure with all categories from the Need
//   materialCategories.forEach((item) => {
//     const key = `${item.categoryName}-${item.subCategoryName}`;
//     result[key] = {
//       donated: 0, // Initialize to 0, will be updated if donations exist
//       target: parseInt(item.targetAmountNeeded) || 0,
//       percentage: 0,
//       unit: item.unit || "",
//     };
//   });

//   // Update with actual donated quantities
//   donations.forEach((donation) => {
//     const key = `${donation._id.categoryName}-${donation._id.subCategoryName}`;
//     if (result[key]) {
//       result[key].donated = donation.totalDonated;
//       // Use the unit from donations if available, otherwise keep the one from Need
//       result[key].unit = donation.unit || result[key].unit;

//       // Calculate percentage
//       if (result[key].target > 0) {
//         result[key].percentage =
//           Math.round((result[key].donated / result[key].target) * 100 * 100) /
//           100;
//       }
//     }
//   });

//   return result;
// }

// Helper function to calculate service donations




module.exports = {
  getAmountDonated,
  getNeedsReportShouldGeneratedFor,
  getNeedById,
  deleteNeed,
  getNGOStatistics,
  getReportByNgo,
  getNeedsByNgo,
  getAllServiceNeeds,
  getAllNGOServiceNeeds,
  getReportPreview,
  generateReport,
  getAllNeeds,
  getReportById,
  postNgosNeed,
  getHomeNeeds,
};
