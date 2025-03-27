const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");

const protect = async (req, res, next) => {
  try {
    // 1. Get token
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new AppError("Not authorized, no token provided", 401);
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id).select("+role");
    if (!currentUser) {
      throw new AppError("User no longer exists", 401);
    }

    // 4. Check token version (for logout/all devices)
    if (decoded.tokenVersion !== currentUser.tokenVersion) {
      throw new AppError("Token expired, please log in again", 401);
    }

    // 5. Grant access
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

// ✅ Middleware to check if user is an admin
const adminProtect = asyncWrapper(async (req, res, next) => {
  if (!req.user) {
    throw new AppError("Not authorized, please log in", 401);
  }

  if (req.user.role !== "admin") {
    throw new AppError("Access denied. Admins only.", 403);
  }

  next();
});

// **RestrictTo Middleware (Role-Based Access Control)**
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

module.exports = { protect, adminProtect, restrictTo };
