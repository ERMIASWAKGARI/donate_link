const bcrypt = require("bcryptjs");
const User = require("../models/User");
const asyncWrapper = require("../middleware/asyncWrapper");

// Register User
const registerUser = asyncWrapper(async (req, res) => {
  const { role, email, phone, password } = req.body;

  // Check if the email is already registered
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Use `let` instead of `const` since we will modify `userData`
  let userData = { role, email, phone, password: hashedPassword };

  switch (role) {
    case "individual_donor": {
      const { name } = req.body;
      if (!name) {
        return res
          .status(400)
          .json({ message: "Name is required for individual donors." });
      }

      userData = { ...userData, name, donorType: "individual" };
      break;
    }

    case "organization_donor": {
      const {
        organizationName,
        address: organizationAddress = {},
        location: organizationLocation = {},
        organizationVerificationDocs = [],
      } = req.body;

      if (!organizationName) {
        return res.status(400).json({
          message: "Organization name is required for organization donors.",
        });
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
        skills = [],
        address: volunteerAddress = {},
        volunteerVerificationDocs = [],
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
        address: ngoAddress = {},
        location: ngoLocation = {},
        ngoVerificationDocs = [],
      } = req.body;

      if (!ngoName) {
        return res.status(400).json({ message: "NGO name is required." });
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
      return res.status(400).json({ message: "Invalid user role provided." });
  }

  // Create & Save User
  const newUser = new User(userData);
  await newUser.save();

  res.status(201).json({
    message: "Registration successful. Please verify your email.",
  });
});

module.exports = { registerUser };
