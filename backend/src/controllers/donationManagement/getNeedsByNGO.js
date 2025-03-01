const mongoose = require("mongoose");
const Need = require("../../models/needsModel");
const asyncWrapper = require("../../middleware/asyncWrapper");
const AppError = require("../../utils/appError");

// @desc    Get all needs by a specific NGO
// @route   GET /api/needs/ngo/:ngoId
// @access  Public
exports.getNeedsByNGO = asyncWrapper(async (req, res, next) => {
  const { ngoId } = req.params;
  const { page = 1, limit = 10, status, urgencyLevel, needType } = req.query;
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  // ✅ Validate ObjectId before querying MongoDB
  if (!mongoose.Types.ObjectId.isValid(ngoId)) {
    return next(new AppError("Invalid NGO ID", 400));
  }

  // ✅ Filtering Conditions
  let filter = { NGO: ngoId };
  if (status) filter.status = status;
  if (urgencyLevel) filter.urgencyLevel = urgencyLevel;
  if (needType) filter.needType = needType;

  // ✅ Get needs by NGO with pagination & structured response
  const needs = await Need.find(filter)
    .populate("NGO", "name email phone organizationName") // Get NGO details
    .sort({ createdAt: -1 }) // Sort by latest needs first
    .skip(skip)
    .limit(parsedLimit)
    .lean(); // Optimize performance by returning a plain object

  // ✅ Count total documents for pagination metadata
  const totalDocuments = await Need.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: needs.length,
    totalPages: Math.ceil(totalDocuments / parsedLimit),
    currentPage: parsedPage,
    data: needs.map((need) => ({
      _id: need._id,
      title: need.title,
      needType: need.needType,
      urgencyLevel: need.urgencyLevel,
      description: need.description,
      status: need.status,
      endDate: need.endDate,
      targetMoney: need.needType === "money" ? need.targetMoney : undefined,
      category: need.category,
      beneficiaryInfo: need.beneficiaryInfo,
      totalDonated: need.totalDonated,
      NGO: {
        id: need.NGO._id,
        name: need.NGO.name,
        email: need.NGO.email,
        phone: need.NGO.phone || "N/A",
        organizationName: need.NGO.organizationName || "N/A",
      },
      createdAt: need.createdAt,
    })),
  });
});
