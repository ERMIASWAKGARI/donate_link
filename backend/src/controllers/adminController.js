const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const sendSuccessResponse = require("../utils/responseHelper");
const APIFeatures = require("../utils/apiFeatures");

// Get all users
const getAllUsers = asyncWrapper(async (req, res) => {
  // Apply filtering, sorting, pagination, and search
  // console.log(req.query);
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .search()
    .sort()
    .limit()
    .paginate();
  // console.log(features);

  const users = await features.executeQuery();
  // console.log(users);
  const totalUsers = users.length;
  if (!totalUsers) {
    throw new AppError("No users found", 404);
  }

  sendSuccessResponse(res, 200, "Users retrieved successfully", {
    totalUsers,
    users,
  });
});

// Get user by ID
const getUserById = asyncWrapper(async (req, res) => {
  const features = new APIFeatures(User.findById(req.params.id), req.query)
    .filter()
    .search()
    .sort()
    .limit()
    .paginate();

  const user = await features.executeQuery();

  if (!user) {
    throw new AppError("User not found", 404);
  }
  sendSuccessResponse(res, 200, "User retrieved successfully", user);
});

// Deactivate a user account
const banUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.isBanned = true;
  await user.save();

  sendSuccessResponse(res, 200, "User account banned successfully");
});

// Delete a user
const deleteUser = asyncWrapper(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  sendSuccessResponse(res, 200, "User deleted successfully");
});

module.exports = {
  getAllUsers,
  getUserById,
  banUser,
  deleteUser,
};
