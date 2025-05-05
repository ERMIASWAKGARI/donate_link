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
        "Accepted",
        "Completed",
      ],
      default: "Submitted",
    },
  },
  { timestamps: true }
);
applicationSchema.post("save", async function (doc) {
  if (doc.status === "Accepted") {
    console.log(
      `\n🏆 Application ${doc._id} Accepted - Starting Certificate Check`
    );

    try {
      const {
        checkCertificates,
      } = require("../controllers/certificateController");
      await checkCertificates(doc.applicant, "volunteer");

      console.log(`✓ Certificate check completed for ${doc.applicant}`);
    } catch (error) {
      console.error("❌ Certificate check failed:", error.message);
      // Consider adding error notification here
    }
  }
});

// Add this to applicationModel.js
applicationSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    console.log(
      `🔄 Status changing from ${this._originalStatus || "[none]"} to ${
        this.status
      }`
    );
    this._originalStatus = this.status; // Store for reference
  }
  next();
});
const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
