// models/ServiceDonation.js
const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    NGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    needId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needs",
      required: true,
    },
    donationType: {
      type: String,
      enum: ["service"],
      default: "service",
      required: true,
    },
    services: [
      {
        categoryName: {
          type: String,
          required: true,
          maxlength: 50,
        },
        subCategoryName: {
          type: String,
          required: true,
          maxlength: 50,
        },
      
    
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
          validate: {
            validator: function (v) {
              return v > this.startDate;
            },
            message: "End date must be after start date",
          },
        },
        hoursPerWeek: {
          type: Number,
          required: true,
          min: 1,
          max: 168, // 24*7
        },
      },
    ],
    message: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Application", ApplicationSchema);
