const mongoose = require("mongoose");
const applicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // The applicant (volunteer or NGO)

    category: {
      type: String,
      required: true,
    },

    subCategory: {
      type: String,
      required: true,
    },

    need: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needs",
      required: true,
    }, // The need being applied for
    motivation: {
      type: String,
      maxlength: 1000,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    hoursPerWeek: Number,
    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Review",
        "Interview Scheduled",
        "Approved",
        "Rejected",
        "On Hold",
        "Withdrawn",
      ],
      default: "Submitted",
    },
  },
  { timestamps: true }
);
const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
