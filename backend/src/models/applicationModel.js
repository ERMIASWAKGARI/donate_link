const mongoose = require("mongoose");
const applicationSchema = new mongoose.Schema(
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
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
