// @desc    Get a single need by ID
// @route   GET /api/needs/:id
// @access  Public
const Need =require('../../models/needsModel')
const asyncWrapper=require('../../middleware/asyncWrapper')
exports.getNeedById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new AppError("Invalid Need ID", 400));
  }

  const need = await Need.findById(id).populate(
    "NGO",
    "name email"
  );

  if (!need) {
    return next(new AppError("Need not found", 404));
  }

  res.status(200).json({
    success: true,
    data: need,
  });
});
