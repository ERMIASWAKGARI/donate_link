const asyncWrapper = require("../../middleware/asyncWrapper");
const Need = require("../../models/needsModel");
const AppError = require("../../utils/appError");

// @desc    Get all needs with aggregation, pagination, filtering, and sorting
// @route   GET /api/needs
// @access  Public
exports.getAllNeeds = asyncWrapper(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    needType,
    status,
    urgencyLevel,
    categoryName,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;

  // ✅ Filtering conditions
  let filter = {};
  if (needType) filter.needType = needType;
  if (status) filter.status = status;
  if (urgencyLevel) filter.urgencyLevel = urgencyLevel;
  if (categoryName) filter["category.categoryName"] = categoryName;
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // ✅ Sorting logic
  const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  // ✅ Aggregation Pipeline
  const needs = await Need.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "users",
        localField: "NGO",
        foreignField: "_id",
        as: "ngoDetails",
      },
    },
    { $unwind: "$ngoDetails" },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        needType: 1,
        urgencyLevel: 1,
        status: 1,
        targetMoney: 1,
        "beneficiaryInfo.numberOfBeneficiaries": 1,
        "beneficiaryInfo.location": 1,
        category: 1,
        endDate: 1,
        createdAt: 1,
        "ngoDetails._id": 1,
        "ngoDetails.name": 1,
        "ngoDetails.email": 1,
      },
    },
    { $sort: sortOptions },
    { $skip: skip },
    { $limit: parseInt(limit) },
  ]);

  // ✅ Count total documents for pagination metadata
  const totalDocuments = await Need.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: needs.length,
    totalPages: Math.ceil(totalDocuments / limit),
    currentPage: Number(page),
    data: needs,
  });
});
