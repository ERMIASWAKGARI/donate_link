const Need = require("../../models/needsModel");
const path = require("path");
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
        `/admin/users/${req.user._id}`
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
    const totalMaterialItems = await MaterialDonation.aggregate([
      { $match: { NGO: ngoId } },
      { $unwind: "$materials" },
      {
        $group: {
          _id: null,
          total: { $sum: "$materials.quantity" },
        },
      },
    ]);

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

    const result = {
      monetaryDonations: monetaryDonations[0]?.total || 0, // Still placeholder
      materialDonations: totalMaterialItems[0]?.total || 0,
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

module.exports = {
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
};
