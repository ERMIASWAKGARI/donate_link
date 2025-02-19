const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const sendSuccessResponse = require("../utils/responseHelper");

const {
  sendVerificationEmail,
  sendEmailUpdateVerification,
} = require("../utils/emailService");

// Register User
const registerUser = asyncWrapper(async (req, res) => {
  const { role, name, email, phone, password } = req.body;

  // Check if the email is already registered
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("User already exists", 400);
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  let userData = { role, name, email, phone, password: hashedPassword };

  switch (role) {
    case "individual_donor": {
      userData = { ...userData, donorType: "individual" };
      break;
    }

    case "organization_donor": {
      const {
        address: organizationAddress,
        location: organizationLocation,
        organizationVerificationDocs,
      } = req.body;

      userData = {
        ...userData,
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
        skills,
        address: volunteerAddress,
        volunteerVerificationDocs,
        availability,
      } = req.body;

      userData = {
        ...userData,
        skills,
        address: volunteerAddress,
        availability,
        volunteerVerificationDocs,
        isVerified: false,
      };
      break;
    }

    case "ngo": {
      const {
        address: ngoAddress,
        location: ngoLocation,
        ngoVerificationDocs,
      } = req.body;

      userData = {
        ...userData,
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

  sendSuccessResponse(
    res,
    201,
    "Registration successful. Please verify your email.",
    {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    }
  );
});

const uploadProfilePicture = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (!req.file) {
    throw new AppError("No file uploaded.", 400);
  }

  // Store the profile picture filename in the user model
  user.profilePicture = req.file.filename;
  await user.save();

  sendSuccessResponse(res, 200, "Profile picture updated successfully!", {
    profilePicture: req.file.filename,
  });
});

const uploadVerificationDocs = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (!req.files || req.files.length === 0) {
    throw new AppError("No files uploaded.", 400);
  }

  // Extract uploaded file paths
  const filePaths = req.files.map((file) => file.filename);

  let updatedDocs = [];

  // Append new files to the existing ones
  if (user.role === "organization_donor") {
    user.organizationVerificationDocs = [
      ...(user.organizationVerificationDocs || []),
      ...filePaths,
    ];
    updatedDocs = user.organizationVerificationDocs;
  } else if (user.role === "ngo") {
    user.ngoVerificationDocs = [
      ...(user.ngoVerificationDocs || []),
      ...filePaths,
    ];
    updatedDocs = user.ngoVerificationDocs;
  } else if (user.role === "volunteer") {
    user.volunteerVerificationDocs = [
      ...(user.volunteerVerificationDocs || []),
      ...filePaths,
    ];
    updatedDocs = user.volunteerVerificationDocs;
  } else {
    throw new AppError(
      "This user role does not require verification documents.",
      400
    );
  }

  await user.save();

  sendSuccessResponse(res, 200, "Documents uploaded successfully!", {
    uploadedFiles: updatedDocs,
  });
});

const getUserProfile = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -emailVerificationToken -tokenVersion -isActive -isEmailVerified -lastLogin -__v"
  );
  if (!user) {
    throw new AppError("User not found", 404);
  }

  sendSuccessResponse(res, 200, "User profile retrieved successfully.", user);
});

const updateUserProfile = asyncWrapper(async (req, res) => {
  const { email, ...updates } = req.body;

  const user = await User.findById(req.user._id).select(
    "-password -emailVerificationToken -tokenVersion -isActive -isEmailVerified -lastLogin -__v"
  );
  if (!user) throw new AppError("User not found", 404);

  // Check if email is already taken
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

  // Allowed fields for each role
  const allowedFields = {
    individual_donor: ["name", "phone", "address", "location"],
    organization_donor: [
      "name",
      "organizationVerificationDocs",
      "phone",
      "address",
      "location",
    ],
    ngo: ["name", "ngoVerificationDocs", "phone", "address", "location"],
    volunteer: [
      "name",
      "skills",
      "availability",
      "volunteerVerificationDocs",
      "phone",
      "address",
      "location",
    ],
  };

  let isUpdated = false; // Track if at least one field is updated

  // Filter and update only allowed fields
  Object.keys(updates).forEach((key) => {
    if (allowedFields[user.role] && allowedFields[user.role].includes(key)) {
      user[key] = updates[key];
      isUpdated = true;
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

  // Prevent already deactivated users from deactivating again
  if (!user.isActive)
    throw new AppError("Account is already deactivated.", 400);

  // Set isActive to false
  user.isActive = false;
  user.tokenVersion += 1; // Invalidate old tokens (ti force logout)
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

const deleteUserAccount = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  // Check if the user is active (only active users can delete their accounts)
  if (!user.isActive) {
    throw new AppError(
      "Your account is deactivated, you cannot delete it.",
      400
    );
  }

  // Delete user permanently
  await User.findByIdAndDelete(req.user._id);

  sendSuccessResponse(res, 200, "Your account has been permanently deleted.");
});

module.exports = {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deactivateAccount,
  reactivateAccount,
  deleteUserAccount,
  uploadVerificationDocs,
  uploadProfilePicture,
};
