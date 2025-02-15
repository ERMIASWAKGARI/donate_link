const mongoose = require("mongoose");

// allowed user roles
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
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: USER_ROLES, required: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    lastLogin: { type: Date },
    tokenVersion: { type: Number, default: 0 },

    // INDIVIDUAL DONOR FIELDS
    name: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "individual_donor";
      },
    },
    donorType: {
      type: String,
      enum: ["individual", "organization"],
      required: function () {
        return this.role === "individual_donor";
      },
    },

    // ORGANIZATION DONOR FIELDS
    organizationName: {
      type: String,
      required: function () {
        return this.role === "organization_donor";
      },
    },
    organizationVerificationDocs: { type: [String], default: undefined }, // Avoids storing empty array
    isVerified: { type: Boolean, default: undefined }, // Avoids storing unnecessary boolean

    // NGO FIELDS
    ngoName: {
      type: String,
      required: function () {
        return this.role === "ngo";
      },
    },
    ngoVerificationDocs: { type: [String], default: undefined },

    // VOLUNTEER FIELDS
    volunteerName: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "volunteer";
      },
    },
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
          startTime: { type: String, required: true }, // e.g., "09:00 AM"
          endTime: { type: String, required: true }, // e.g., "05:00 PM"
        },
      ],
      default: undefined, // 🚀 This ensures it's only stored when provided
    },

    volunteerVerificationDocs: { type: [String], default: undefined },

    // ADDRESS & LOCATION (For Organization Donors, NGOs, Volunteers)
    address: {
      country: { type: String, default: undefined },
      region: { type: String, default: undefined },
      city: { type: String, default: undefined },
    },
    location: {
      latitude: { type: Number, default: undefined },
      longitude: { type: Number, default: undefined },
    },
  },
  { timestamps: true, strict: "throw" } // 🚀 Prevents saving unknown fields!
);

module.exports = mongoose.model("User", userSchema);
