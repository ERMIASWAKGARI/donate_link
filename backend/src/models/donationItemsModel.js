const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    need: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needs",
      required: true,
    },
    contributionType: {
      type: String,
      enum: ["money", "material", "service"],
      required: true,
      validate: {
        validator: async function (v) {
          const need = await mongoose.model("Needs").findById(this.need);
          return need.needTypes.includes(v);
        },
        message: "Contribution type must match one of the need's types",
      },
    },

    // For material donations
    materialDetails:[ {
      categoryName: String,
      subCategoryName: String,
      quantity: Number,
      unit: String,
      description: String,
      deliveryMethod: String,
    }],

    // For service donations
    serviceDetails:[ {
      categoryName: String,
      subCategoryName: String,
      hoursCommitted: Number,
      skills: [String],
      availability: String,
    }],

    // Payment reference (for monetary donations)
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: function () {
        return this.contributionType === "money";
      },
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Completed",
        "Partially Completed",
        "Cancelled",
      ],
      default: "Pending",
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    proofOfDelivery: [String],
    adminNotes: [
      {
        note: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
    discriminatorKey: "contributionType",
  }
);

// Update Need status when donation status changes
donationSchema.post("save", async function (doc) {
  if (["Approved", "Completed", "Cancelled"].includes(doc.status)) {
    await updateNeedStatus(doc.need);
  }
});

async function updateNeedStatus(needId) {
  // Implementation from previous example
  // This would calculate fulfillment based on approved donations
}

module.exports = mongoose.model("Donation", donationSchema);
