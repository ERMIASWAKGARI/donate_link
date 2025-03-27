const Need = require("../../models/needsModel");

postNgosNeed = async (req, res) => {
  try {
    const {
      title,
      needTypes,
      urgencyLevel,
      description,
      endDate,
      targetMoney,
      beneficiaryInfo,
      categories,
    } = req.body;

    // Get NGO ID from authenticated user
    const NGO = req.user._id;

    // Validate need types
    if (!Array.isArray(needTypes)) {
      return res.status(400).json({
        success: false,
        error: "Need types must be an array",
      });
    }

    // Validate categories based on need types
    if (
      needTypes.includes("material") &&
      (!categories.material || categories.material.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        error: "Material categories required when need type includes material",
      });
    }

    if (
      needTypes.includes("service") &&
      (!categories.service || categories.service.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        error: "Service categories required when need type includes service",
      });
    }

    // Validate target money for money needs
    if (needTypes.includes("money") && (!targetMoney || targetMoney <= 0)) {
      return res.status(400).json({
        success: false,
        error: "Valid target money amount required for money needs",
      });
    }

   

    // Validate pictures array length
    if (beneficiaryInfo.pictures && beneficiaryInfo.pictures.length > 10) {
      return res.status(400).json({
        success: false,
        error: "Cannot upload more than 10 pictures",
      });
    }

    // Create the new need
    const need = new Need({
      NGO,
      title,
      needTypes,
      urgencyLevel,
      description,
      endDate,
      targetMoney: needTypes.includes("money") ? targetMoney : null,
      beneficiaryInfo,
      categories,
    });

    await need.save();

    res.status(201).json({
      success: true,
      message: "Need posted successfully",
      data: need,
    });
  } catch (error) {
    console.error("Error posting need:", error);

    // Handle Mongoose validation errors specifically
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${errors.join(", ")}`,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};


// Get all needs (with optional filtering)
getAllNeeds = async (req, res) => {
  try {
    const { status, needType } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }
    if (needType) {
      filter.needTypes = needType;
    }

    const needs = await Need.find(filter)
      .populate("NGO", "name email") // Populate NGO basic info
       // Populate application info
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: needs.length,
      data: needs,
    });
  } catch (error) {
    console.error("Error fetching needs:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Get needs by NGO ID
getNeedsByNgo = async (req, res) => {
  try {
    const ngoId = req.params.ngoId;
    const { status } = req.query;
    const filter = { NGO: ngoId };

    if (status) {
      filter.status = status;
    }

    const needs = await Need.find(filter)
      .populate("application", "status donor") // Populate application info
      .sort({ createdAt: -1 });

    if (!needs || needs.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No needs found for this NGO",
      });
    }

    res.status(200).json({
      success: true,
      count: needs.length,
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