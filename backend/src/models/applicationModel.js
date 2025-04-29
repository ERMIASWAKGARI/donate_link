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
    NGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, // The NGO that posted the need
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
        "accepted",
      ],
      default: "Submitted",
    },
  },
  { timestamps: true }
);
applicationSchema.post("save", async function (doc) {
  if (doc.status === "accepted") {
    const {
      checkCertificates,
    } = require("../controllers/certificateController");
    console.log(
      `🙋 Volunteer application ${doc._id} approved - checking certificates`
    );
    await checkCertificates(doc.applicant, "volunteer");
  }
});
const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
