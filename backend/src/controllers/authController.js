const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your_refresh_secret";

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" } // Access token expires in 1 hour
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

// Login Function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if the email is verified
    if (!user.isEmailVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
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
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Refresh Token Function
const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Refresh token is required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token." });
    }

    const newAccessToken = generateToken(user);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token." });
  }
};

module.exports = { verifyEmail, login, refreshToken };
