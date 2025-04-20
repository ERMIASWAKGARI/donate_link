const mongoose = require("mongoose");

const donationItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
 
    },
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    hoursPerWeek: Number,
  
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    need: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needs",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    pictures: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: "Cannot upload more than 10 pictures",
      },
    },
    impactMetrics: {
      beneficiariesReached: Number,
      communitiesServed: [String],
      successStories: [String],
    },
    donations: {
      services: [serviceSchema],
      materials: [donationItemSchema],
    },
  
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  NGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
