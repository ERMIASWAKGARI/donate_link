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
    material: [
      {
        categoryName: {
          type: String,
          required:true,
          maxlength: 50,
        },
        subCategoryName: {
          type: String,
          required:true,
          maxlength: 50,
        },
        targetAmountNeeded: {
          type: String,
          required:true,
          min: 1,
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
         
        },
      },
    ],
    description: {
      type: String,
      enum: ["money", "material", "service", "others"],
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
    },
    currency: {
      type: String,
      default: "ETB",
      required: function () {
        return this.donationType === "money";
      },
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    // --- Material Donation Fields ---
    materialDetails: {
      category: {
        type: String,
        enum: ["food", "medical", "learning", "drinking", "clothing", "other"],
        required: function () {
          return this.donationType === "material";
        },
      },
      subCategory: {
        type: String,
        required: function () {
          return this.donationType === "material";
        },
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
      description: {
        type: String,
        maxlength: 500,
      },
    },

    // --- Service Donation Fields ---
    // serviceDetails: {
    //   type: String,
    //   required: function () {
    //     return this.donationType === "service";
    //   },
    // },

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

    // trackingId: {
    //   type: String,
    //   unique: true,
    //   required: function () {
    //     return this.donationType === "material";
    //   },
    // },
    status: {
      type: String,
      enum: ["pending", "requested", "accepted", "rejected", "completed"],
      default: "posted",
    },

    // --- Notifications ---
    // notifications: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Notification",
    //   },
    // ],
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
