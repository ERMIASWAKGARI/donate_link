const Need = require("../../models/needsModel");
const path=require('path')
const uploadNeedPictures = require("../../middleware/uploadNeedPictures");
const AppError = require("../../utils/appError");

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




// Get all needs (with optional filtering)
// In your backend route file (e.g., donationRoutes.js)
const getAllNeeds = async (req, res) => {
  try {
    console.log("here the request comes", req.query);
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

// Get single need by ID
getNeedById = async (req, res) => {
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
module.exports={getNeedById,getNeedsByNgo,getAllNeeds ,postNgosNeed}