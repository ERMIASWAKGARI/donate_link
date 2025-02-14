const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // For email verification token

// Allowed user roles
const USER_ROLES = [
  "individual_donor",
  "organization_donor",
  "volunteer",
  "ngo",
];

// Register User
const registerUser = async (req, res) => {
  try {
    const { role, email, phone, password } = req.body;

    // 1️⃣ **Validate role**
    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid user role." });
    }

    // 2️⃣ **Check common required fields**
    if (!email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Email, phone, and password are required." });
    }

    // 3️⃣ **Check if the email is already registered**
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 4️⃣ **Hash the password**
    const hashedPassword = await bcrypt.hash(password, 10);

    let userData = {
      email,
      phone,
      password: hashedPassword,
      role,
      isEmailVerified: false,
      emailVerificationToken: crypto.randomBytes(32).toString("hex"), // Generate verification token
    };

    switch (role) {
      case "individual_donor":
        const { name } = req.body;
        if (!name)
          return res
            .status(400)
            .json({ message: "Name is required for individual donors." });

        userData = { ...userData, name, donorType: "individual" };
        break;

      case "organization_donor":
        const {
          organizationName,
          address: organizationAddress,
          location: organizationLocation,
          organizationVerificationDocs,
        } = req.body;
        if (!organizationName)
          return res.status(400).json({
            message: "Organization name is required for organization donors.",
          });

        userData = {
          ...userData,
          organizationName: organizationName,
          address: organizationAddress,
          location: organizationLocation,
          donorType: "organization",
          organizationVerificationDocs: organizationVerificationDocs,
          isVerified: false,
        };
        break;

      case "volunteer":
        const {
          name: volunteerName,
          skills,
          address: volunteerAddress,
          volunteerVerificationDocs,
          availability,
        } = req.body;

        userData = {
          ...userData,
          volunteerName: volunteerName || "",
          skills: skills || [],
          address: volunteerAddress,
          availability: availability || [],
          volunteerVerificationDocs: volunteerVerificationDocs || [],
        };
        break;

      case "ngo":
        const {
          ngoName,
          address: ngoAddress,
          location: ngoLocation,
          ngoVerificationDocs,
        } = req.body;
        if (!ngoName)
          return res.status(400).json({ message: "NGO name is required." });

        userData = {
          ...userData,
          ngoName: ngoName,
          address: ngoAddress,
          location: ngoLocation,
          ngoVerificationDocs: ngoVerificationDocs,
          isVerified: false,
        };
        break;

      default:
        return res.status(400).json({ message: "Invalid user role provided." });
    }

    // 6️⃣ **Create and Save Only Relevant Fields**
    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

module.exports = { registerUser };
