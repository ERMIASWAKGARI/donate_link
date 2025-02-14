const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // For generating the token
const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const sendSuccessResponse = require("../utils/responseHelper");
const { sendVerificationEmail } = require("../utils/emailService"); // Import email sender function

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

  // // Send Email Verification
  // const verificationUrl = `${process.env.CLIENT_URL}/api/users/verify-email?token=${emailVerificationToken}`;
  // const emailMessage = `
  //   <h3>Hello,</h3>
  //   <p>Thank you for registering. Please verify your email by clicking the link below:</p>
  //   <a href="${verificationUrl}">Verify Email</a>
  //   <p>If you didn't request this, please ignore this email.</p>
  // `;

  await sendVerificationEmail(email, emailVerificationToken);

  // Send Success Response
  sendSuccessResponse(
    res,
    201,
    "Registration successful. Please verify your email.",
    newUser
  );
});

module.exports = { registerUser };
