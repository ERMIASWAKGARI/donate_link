const User = require('../models/User');
const asyncWrapper = require('../middleware/asyncWrapper');
const AppError = require('../utils/appError');
const sendSuccessResponse = require('../utils/responseHelper');
const APIFeatures = require('../utils/apiFeatures');
const { sendNotification } = require('../utils/notificationService');

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
    throw new AppError('No users found', 404);
  }

  sendSuccessResponse(res, 200, 'Users retrieved successfully', {
    totalUsers,
    users,
  });
});

// Get user by ID
const getUserById = asyncWrapper(async (req, res) => {
  // Fetch user without APIFeatures first
  let user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Apply APIFeatures for additional filtering if needed
  const features = new APIFeatures(User.find({ _id: user._id }), req.query)
    .filter()
    .search()
    .sort()
    .limit()
    .paginate();

  user = await features.executeQuery();

  // If query modifications return an empty array, handle it
  if (Array.isArray(user) && user.length === 0) {
    throw new AppError('User not found', 404);
  }

  sendSuccessResponse(res, 200, 'User retrieved successfully', user);
});

const verifyUser = asyncWrapper(async (req, res) => {
  const userId = req.params.id;
  const adminId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  if (user.isVerified) {
    throw new AppError('User is already verified.', 400);
  }

  user.isVerified = true;
  await user.save();

  sendNotification(
    user._id,
    `Dear ${user.name} your account has been verified.`,
    'general'
  );

  sendSuccessResponse(res, 200, 'User verified successfully.');
});

const rejectUserVerification = asyncWrapper(async (req, res) => {
  const userId = req.params.id;
  const { rejectionReason } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found.', 404);

  user.isVerified = false;
  await user.save();

  sendNotification(
    user._id,
    `Dear ${user.name}, your account verification was rejected. Reason: ${rejectionReason}`,
    'general'
  );

  sendSuccessResponse(res, 200, 'User verification rejected.');
});

// Deactivate a user account
const banUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isBanned = true;
  await user.save();

  // await logAdminAction(req.user._id, 'Banned User', user._id); // Log action

  sendSuccessResponse(res, 200, 'User account banned successfully.');
});

const unbanUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isBanned) {
    throw new AppError('User is not banned.', 400);
  }

  user.isBanned = false;
  await user.save();

  sendSuccessResponse(res, 200, 'User account unbanned successfully');
});

const bulkBanUsers = asyncWrapper(async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError('Provide at least one user ID.', 400);
  }

  const result = await User.updateMany(
    { _id: { $in: userIds }, isBanned: false },
    { isBanned: true }
  );

  if (result.modifiedCount === 0) {
    throw new AppError(
      'No users were banned. Check if the IDs are valid and users are not banned.',
      400
    );
  }

  sendSuccessResponse(res, 200, 'Selected users have been banned.');
});

const bulkUnbanUsers = asyncWrapper(async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError('Provide at least one user ID.', 400);
  }

  const result = await User.updateMany(
    { _id: { $in: userIds }, isBanned: true }, // Ensure only banned users are updated
    { isBanned: false }
  );

  if (result.modifiedCount === 0) {
    throw new AppError(
      'No users were unbanned. Check if the IDs are valid and users are banned.',
      400
    );
  }

  sendSuccessResponse(
    res,
    200,
    `${result.modifiedCount} users have been unbanned.`
  );
});

// Delete a user
const deleteUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isDeleted) {
    throw new AppError('You cannot delete this user account.', 400);
  }

  // 🔹 Check if user is already soft-deleted
  if (user.isDeleted) {
    const deletionDate = new Date(user.deletedAt);
    const currentDate = new Date();
    const daysSinceDeletion = Math.floor(
      (currentDate - deletionDate) / (1000 * 60 * 60 * 24)
    ); // Convert milliseconds to days

    if (daysSinceDeletion >= 30) {
      // 🔹 If 30+ days have passed, permanently delete user
      await User.findByIdAndDelete(req.params.id);
      return sendSuccessResponse(
        res,
        200,
        'User permanently deleted after 30+ days.'
      );
    } else {
      // 🔹 If less than 30 days, prevent permanent deletion
      throw new AppError(
        `Cannot delete user yet. ${
          30 - daysSinceDeletion
        } days left until permanent deletion.`,
        400
      );
    }
  }
});

const logAdminAction = async (adminId, action, targetUserId) => {
  await AdminLog.create({
    admin: adminId,
    action,
    targetUser: targetUserId,
    timestamp: new Date(),
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  verifyUser,
  rejectUserVerification,
  banUser,
  bulkBanUsers,
  bulkUnbanUsers,
  unbanUser,
  deleteUser,
};
