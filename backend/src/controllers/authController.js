const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const sendSuccessResponse = require("../utils/responseHelper");
const AppError = require("../utils/appError");

const verifyEmail = asyncWrapper(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new AppError("Invalid or missing token.", 400);
  }

  // Find user with matching token
  const user = await User.findOne({ emailVerificationToken: token });

  if (!user) {
    throw new AppError("Invalid or expired token.", 400);
  }

  // Update user record
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  sendSuccessResponse(res, 200, "Email verified successfully.");
});

module.exports = { verifyEmail };
