const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // For generating the token
const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const sendSuccessResponse = require("../utils/responseHelper");
const {
  sendVerificationEmail,
  sendEmailUpdateVerification,
} = require("../utils/emailService"); // Import email sender function

// Register User
const registerUser = asyncWrapper(async (req, res) => {
  const { role, email, phone, password } = req.body;

  // Check if the email is already registered
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("User already exists", 400);
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Use `let` instead of `const` since we will modify `userData`
  let userData = { role, email, phone, password: hashedPassword };

  switch (role) {
    case "individual_donor": {
      const { name } = req.body;
      if (!name) {
        throw new AppError("Name is required for individual donors.", 400);
      }

      userData = { ...userData, name, donorType: "individual" };
      break;
    }

    case "organization_donor": {
      const {
        organizationName,
        address: organizationAddress,
        location: organizationLocation,
        organizationVerificationDocs,
      } = req.body;

      if (!organizationName) {
        throw new AppError(
          "Organization name is required for organization donors.",
          400
        );
      }

      userData = {
        ...userData,
        organizationName,
        address: organizationAddress,
        location: organizationLocation,
        donorType: "organization",
        organizationVerificationDocs,
        isVerified: false,
      };
      break;
    }

    case "volunteer": {
      const {
        volunteerName,
        skills,
        address: volunteerAddress,
        volunteerVerificationDocs,
        availability,
      } = req.body;

      if (!volunteerName) {
        throw new AppError("Volunteer name is required.", 400);
      }

      userData = {
        ...userData,
        volunteerName,
        skills,
        address: volunteerAddress,
        availability,
        volunteerVerificationDocs,
      };
      break;
    }

    case "ngo": {
      const {
        ngoName,
        address: ngoAddress,
        location: ngoLocation,
        ngoVerificationDocs,
      } = req.body;

      if (!ngoName) {
        throw new AppError("NGO name is required.", 400);
      }

      userData = {
        ...userData,
        ngoName,
        address: ngoAddress,
        location: ngoLocation,
        ngoVerificationDocs,
        isVerified: false,
      };
      break;
    }

    default:
      throw new AppError("Invalid user role provided.", 400);
  }

  // Generate Email Verification Token
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  // Store the token in the user's record
  userData.isEmailVerified = false;
  userData.emailVerificationToken = emailVerificationToken;

  // Create & Save User
  const newUser = new User(userData);
  await newUser.save();

  await sendVerificationEmail(email, emailVerificationToken);

  // Send Success Response
  sendSuccessResponse(
    res,
    201,
    "Registration successful. Please verify your email.",
    newUser
  );
});

const getUserProfile = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  sendSuccessResponse(res, 200, "User profile retrieved successfully.", user);
});

const updateUserProfile = asyncWrapper(async (req, res) => {
  const { email, ...updates } = req.body; // Extract email separately

  const user = await User.findById(req.user._id).select("-password");
  if (!user) throw new AppError("User not found", 404);

  // ✅ Check if email is already taken
  if (email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError("Email is already in use.", 400);

    user.email = email;
    user.isEmailVerified = false; // Require re-verification after email change

    // Generate and send new email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = emailVerificationToken;
    await sendEmailUpdateVerification(user.email, emailVerificationToken);
  }

  // ✅ Allowed fields for each role
  const allowedFields = {
    individual_donor: ["name", "phone", "address", "location"],
    organization_donor: [
      "organizationName",
      "organizationVerificationDocs",
      "phone",
      "address",
      "location",
    ],
    ngo: ["ngoName", "ngoVerificationDocs", "phone", "address", "location"],
    volunteer: [
      "volunteerName",
      "skills",
      "availability",
      "volunteerVerificationDocs",
      "phone",
      "address",
      "location",
    ],
  };

  let isUpdated = false; // Track if at least one field is updated

  // ✅ Filter and update only allowed fields
  Object.keys(updates).forEach((key) => {
    if (allowedFields[user.role] && allowedFields[user.role].includes(key)) {
      user[key] = updates[key];
      isUpdated = true; // At least one field is updated
    }
  });

  if (!isUpdated) {
    throw new AppError("No valid fields to update or not allowed.", 400);
  }

  await user.save();
  sendSuccessResponse(res, 200, "Profile updated successfully.", user);
});

const deactivateAccount = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError("User not found", 404);

  // 🚨 Prevent already deactivated users from deactivating again
  if (!user.isActive)
    throw new AppError("Account is already deactivated.", 400);

  // 🚀 Set isActive to false
  user.isActive = false;
  user.tokenVersion += 1; // Invalidate old tokens (forces logout)
  await user.save();

  sendSuccessResponse(res, 200, "Your account has been deactivated.");
});

const reactivateAccount = asyncWrapper(async (req, res) => {
  const { reactivationToken } = req.body; // Get the temporary token

  // Verify the token
  try {
    const decoded = jwt.verify(reactivationToken, process.env.JWT_SECRET);
    if (decoded.type !== "reactivation") {
      throw new AppError("Invalid reactivation token.", 400);
    }

    const user = await User.findById(decoded.userId);
    if (!user) throw new AppError("User not found.", 404);

    if (user.isActive) {
      return sendSuccessResponse(res, 200, "Your account is already active.");
    }

    // Reactivate the account
    user.isActive = true;
    await user.save();

    sendSuccessResponse(
      res,
      200,
      "Your account has been reactivated. You can now log in."
    );
  } catch (error) {
    throw new AppError(
      `Invalid or expired reactivation token. ${error.message}`,
      400
    );
  }
});

module.exports = {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deactivateAccount,
  reactivateAccount,
};
