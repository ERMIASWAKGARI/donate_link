const mongoose = require("mongoose");

const donationsSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    need: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needs",
    },
    NGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
    },
    donationType: {
      type: String,
      enum: ["money", "material", "service"],
      required: true,
    },

    // --- Monetary Donation Fields ---
    amount: {
      type: Number,
      required: function () {
        return this.donationType === "money";
      },
    },
    currency: {
      type: String,
      default: "ETB",
      required: function () {
        return this.donationType === "money";
      },
    },

    description: {
      type: String,
      maxlength: 500,
    },

    title: {
      type: String,
    },

    // --- Material Donation Fields ---
    materialDetails: {
      category: {
        type: String,
        // enum: ["food", "medical", "learning", "drinking", "clothing", "other"],
        required: function () {
          return this.donationType === "material";
        },
      },
      customCategory: {
        type: String,
        required: function () {
          return (
            this.donationType === "material" &&
            this.materialDetails.category === "other"
          );
        },
        maxlength: 100,
      },
      // In schema
      subCategory: {
        type: String,
        required: function () {
          return this.donationType === "material";
        },
      },
      customSubCategory: {
        type: String,
        required: function () {
          return (
            this.donationType === "material" &&
            this.materialDetails.subCategory === "other"
          );
        },
        maxlength: 100,
      },

      quantity: {
        type: Number,
        required: function () {
          return this.donationType === "material";
        },
      },
      unit: {
        type: String,
        required: function () {
          return this.donationType === "material";
        },
      },
      condition: {
        type: String,
        enum: ["new", "used", "refurbished"],
        required: function () {
          return this.donationType === "material";
        },
      },
      expirationDate: {
        type: Date,
        required: function () {
          return (
            this.donationType === "material" &&
            (this.materialDetails.category === "food" ||
              this.materialDetails.category === "medical")
          );
        },
      },
    },

    // --- Service Donation Fields ---
    serviceDetails: {
      type: String,
      required: function () {
        return this.donationType === "service";
      },
    },

    // --- Location & Address ---
    address: {
      type: String,
      required: function () {
        return this.donationType === "material";
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // --- Image Uploads (Max 5) ---
    images: {
      type: [String], // Array of image URLs
      default: [],
    },

    // --- Tracking & Status ---
    trackingId: {
      type: String,
      unique: true,
      required: function () {
        return this.donationType === "material";
      },
    },
    status: {
      type: String,
      enum: ["pending", "requested", "accepted", "rejected", "completed"],
      default: "posted",
    },

    // --- Notifications ---
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Geospatial Indexing for Location
donationsSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Donations", donationsSchema);
