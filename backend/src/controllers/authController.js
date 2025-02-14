const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const sendSuccessResponse = require("../utils/responseHelper");
const AppError = require("../utils/appError");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "3h" } // Access token expires in 3 hour
  );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" } // Refresh token valid for 7 days
  );
};

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

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  // Check if the email is verified
  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email before logging in.", 403);
  }

  // Compare the hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  // Generate JWT and Refresh Token
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // Update last login time
  user.lastLogin = new Date();
  await user.save();

  res.status(200).json({
    message: "Login successful!",
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name:
        user.name ||
        user.organizationName ||
        user.ngoName ||
        user.volunteerName,
    },
    accessToken,
    refreshToken,
  });
});

// Refresh Token Function -> refresh access token with refresh token
const refreshToken = asyncWrapper(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError("Refresh token is required.", 401);
  }

  const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError("Invalid refresh token.", 401);
  }

  const newAccessToken = generateToken(user);
  res.status(200).json({ accessToken: newAccessToken });
});

module.exports = { verifyEmail, login, refreshToken };
