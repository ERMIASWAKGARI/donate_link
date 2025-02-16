const mongoose = require("mongoose");

const USER_ROLES = [
  "individual_donor",
  "organization_donor",
  "volunteer",
  "ngo",
];

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    // COMMON FIELDS (Shared by all users)
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: USER_ROLES, required: true },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    emailVerificationToken: { type: String },
    lastLogin: { type: Date },
    tokenVersion: { type: Number, default: 0 },
    address: {
      country: { type: String, default: undefined },
      region: { type: String, default: undefined },
      city: { type: String, default: undefined },
    },
    location: {
      latitude: { type: Number, default: undefined },
      longitude: { type: Number, default: undefined },
    },
    profilePicture: { type: String, default: null },

    donorType: {
      type: String,
      enum: ["individual", "organization"],
      required: function () {
        return (
          this.role === "individual_donor" || this.role === "organization_donor"
        );
      },
    },

    // ORGANIZATION DONOR FIELDS
    organizationVerificationDocs: { type: [String], default: undefined },
    isVerified: { type: Boolean, default: undefined },

    // NGO FIELDS
    ngoVerificationDocs: { type: [String], default: undefined },

    // VOLUNTEER FIELDS
    skills: { type: [String], default: undefined },
    availability: {
      type: [
        {
          day: {
            type: String,
            enum: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            required: true,
          },
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
        },
      ],
      default: undefined,
    },
    volunteerVerificationDocs: { type: [String], default: undefined },
  },
  { timestamps: true, strict: "throw" }
);

module.exports = mongoose.model("User", userSchema);
