const mongoose = require("mongoose");

const donationItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
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
    subcategory: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    hoursPerWeek: Number,
    motivation: String,
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    need: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Need",
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
    donations: {
      services: [serviceSchema],
      materials: [donationItemSchema],
    },
    totals: {
      services: {
        type: Number,
        default: 0,
      },
      materials: {
        type: Number,
        default: 0,
      },
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
