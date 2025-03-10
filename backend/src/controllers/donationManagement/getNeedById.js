const mongoose = require("mongoose");
const Need = require("../../models/needsModel");
const asyncWrapper = require("../../middleware/asyncWrapper");
const AppError = require("../../utils/appError");

// @desc    Get a single need by ID
// @route   GET /api/needs/:id
// @access  Public
exports.getNeedById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  // ✅ Validate ObjectId before querying MongoDB
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid Need ID", 400));
  }

  // ✅ Find the need and populate related fields
  const need = await Need.findById(id)
    .populate("NGO", "name email phone organizationName") // Get NGO details
    .populate("donors.donor", "name email") // Get donor names
    .lean(); // Optimize performance by returning a plain object

  if (!need) {
    return next(new AppError("Need not found", 404));
  }

  res.status(200).json({
    success: true,
    data: {
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
      donors: need.donors.map((d) => ({
        donorId: d.donor?._id || null,
        donorName: d.donor?.name || "Anonymous",
        donorEmail: d.donor?.email || "N/A",
        amount: d.amount || 0,
      })),
      NGO: {
        id: need.NGO._id,
        name: need.NGO.name,
        email: need.NGO.email,
        phone: need.NGO.phone || "N/A",
        organizationName: need.NGO.organizationName || "N/A",
      },
      createdAt: need.createdAt,
    },
  });
});
