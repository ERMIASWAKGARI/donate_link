const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");

const authMiddleware = (allowedRoles) => {
  return asyncWrapper(async (req, res, next) => {
    let token;

    // 1. Check if token exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      throw new AppError("Not authorized, no token provided.", 401);
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new AppError("Not authorized, invalid token.", 401);
    }

    // 3. Check if user still exists
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new AppError("User not found.", 401);
    }

    // 4. Check token version (for invalidation after password reset)
    if (decoded.resetTokenVersion !== user.resetTokenVersion) {
      throw new AppError("Token is no longer valid. Please log in again.", 401);
    }

    // 5. Check if user role is allowed
    if (allowedRoles) {
      const rolesArray = Array.isArray(allowedRoles)
        ? allowedRoles
        : [allowedRoles];
      if (!rolesArray.includes(user.role)) {
        throw new AppError(
          `Access denied. ${rolesArray.join(" or ")} role required.`,
          403
        );
      }
    }

    // 6. Grant access
    req.user = user;
    next();
  });
};

module.exports = authMiddleware;
