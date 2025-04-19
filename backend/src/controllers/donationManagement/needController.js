const Need = require("../../models/needsModel");
const path = require("path");
const uploadNeedPictures = require("../../middleware/uploadNeedPictures");
const AppError = require("../../utils/appError");
const APIFeatures = require("../../utils/apiFeatures"); // Adjust path as needed
const socketIO = require("../../utils/socketConfig"); // Adjust path as needed
const Application = require("../../models/applicationModel");
const MaterialDonation = require("../../models/matterialDonation");
const onlineUsers = socketIO.onlineUsers; // Adjust path as needed
const io=socketIO.getIO; // Adjust path as needed
console.log("onlineUsers", onlineUsers,io);
const Report = require("../../models/Report");
const sendNotificationToGroup=require("../../utils/socketConfig").sendNotificationToGroup; // Adjust path as needed
// Helper function to handle the upload
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
        })),
        service: serviceCategories.map((cat) => ({
          categoryName: cat.categoryName,
          subCategoryName: cat.subCategoryName,
          vacancy: cat.vacancy,
        })),
      },
    });
    
    sendNotificationToGroup("role_ngo", "newNeed", need);
             
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


getAllServiceNeeds = async (req, res) => {
  try {
    // 1. BASE QUERY - Only service needs
    let query = { needTypes: "service" };

    // 2. FILTERING - Status and Urgency
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.urgency) {
      query.urgencyLevel = req.query.urgency;
    }

    // 3. SEARCH - Across multiple fields
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { "NGO.name": searchRegex },
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
      .populate("NGO", "name email phone")
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
   



    // Find the specific need for the given NGO
    const need = await Need.find({ NGO: req.user?._id, needTypes: ["service"] })
      .populate("NGO", "name email"); // Populate NGO basic info

    if (!need || need.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Service need not found for the specified NGO",
      });
    }

    res.status(200).json({
      success: true,
      data: need,
    });
  } catch (error) {
    console.error("Error fetching NGO service need:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: "Invalid NGO ID or Need ID",
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
      .then(needs => {
        if (category === "service") {
          return needs.filter(need => need.needTypes.includes("service"));
        } else if (category === "all") {
          return needs.filter(need => !need.needTypes.includes("service")); 
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
getNeedsByNgo = async (req, res) => {
  try {
    const ngoId = req.params.ngoId;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { NGO: ngoId };

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
       const { needId } = req.params;
       const { needTypes } = req.query;
console.log("needId", needId);
    if ( !needTypes || needTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: " and at least one need type are required",
      });
    }
    const validNeedTypes = ["material", "service","money"];
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
        ?await  Application.find({
            need: needId,
            status: "Approved",
          }).populate("applicant", "name email phone")
        : Promise.resolve([]),

      needTypes.includes("material")
        ?await MaterialDonation.find({
            needId: needId,
           
          }).populate("donorId", "name email phone")
        : Promise.resolve([]),
    ]);
    console.log("materialdonations", materialDonations);
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

      materials: materialDonations.flatMap((donation) =>
        donation.materials.map((material) => ({
          category: material.categoryName,
          subcategory: material.subCategoryName,
          quantity: material.quantity,
        }))
      ),
    };

    const totals = {
      services: transformedData.services.length,
      materials: transformedData.materials.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    };

    const newReport ={
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
  }
const generateReport = async (req, res) => {
  try {
  const pictures =
    req.files?.map((file) =>
      path.join("donations", path.basename(file.path))
    ) || [];

    const { needId } = req.params;
    const { description, needTypes } = req.body;

    if (!description || !needTypes || needTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Description and at least one need type are required",
      });
    }

    // Validate need types
    const validNeedTypes = ["material", "service"];
    const invalidTypes = needTypes.filter(type => !validNeedTypes.includes(type));
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
      needTypes.includes("service") ? 
        Application.find({
          need: needId,
          status: "Approved"
        }).populate("applicant", "name email phone") : 
        Promise.resolve([]),
      
      needTypes.includes("material") ? 
        MaterialDonation.find({
          needId: needId,
          status: "Approved"
        }).populate("donorId", "name email phone") : 
        Promise.resolve([])
    ]);

    // Transform data to match schema
    const transformedData = {
      services: approvedApplications.map(app => ({
        applicant: app.applicant._id,
        category: app.category,
        subcategory: app.subCategory,
        startDate: app.startDate,
        endDate: app.endDate,
        hoursPerWeek: app.hoursPerWeek,
        motivation: app.motivation
      })),
      
      materials: materialDonations.flatMap(donation => 
        donation.materials.map(material => ({
          category: material.categoryName,
          subcategory: material.subCategoryName,
          quantity: material.quantity
        })))
    };

    const totals = {
      services: transformedData.services.length,
      materials: transformedData.materials.reduce((sum, item) => sum + item.quantity, 0)
    };

    const newReport = await Report.create({
      need: needId,
      description,
      pictures,
      donations: transformedData,
      totals,
      status: "pending",
      NGO: req.user._id,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Report generated successfully",
      data: newReport,
      summary: totals
    });

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get single need by ID
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
module.exports = {
  getNeedById,
  getNeedsByNgo,
  getAllServiceNeeds,
  getAllNGOServiceNeeds,
  getReportPreview,
  generateReport,
  getAllNeeds,
  postNgosNeed,
};
