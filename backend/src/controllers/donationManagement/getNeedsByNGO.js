// @desc    Get all needs by a specific NGO
// @route   GET /api/needs/ngo/:ngoId
// @access  Public
const Need = require("../../models/needsModel");
const asyncWrapper = require("../../middleware/asyncWrapper");
const AppError=require('../../utils/appError')
exports.getNeedsByNGO = asyncWrapper(async (req, res, next) => {
  const { ngoId } = req.params;
  const { page = 1, limit = 10, status, urgencyLevel } = req.query;
  const skip = (page - 1) * limit;

  if (!ngoId.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError("Invalid NGO ID", 400));
  }

  // Filtering conditions
  let filter = { NGO: ngoId };
  if (status) filter.status = status;
  if (urgencyLevel) filter.urgencyLevel = urgencyLevel;

  // Get needs by NGO with pagination
  const needs = await Need.find(filter)
    .populate("NGO", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalDocuments = await Need.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: needs.length,
    totalPages: Math.ceil(totalDocuments / limit),
    currentPage: Number(page),
    data: needs,
  });
});
