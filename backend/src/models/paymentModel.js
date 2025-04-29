const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    needId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needs",
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    NGOId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currency: {
      type: String,
      default: "ETB",
      enum: ["ETB", "USD", "EUR", "GBP"], // Common currencies
    },

    description: {
      type: String,
      maxlength: 500,
    },

    reference: {
      type: String,
    },

    tx_ref: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "Initiated",
        "Pending",
        "Processing",
        "Completed",
        "Failed",
        "Refunded",
        "On Hold",
      ],
      default: "Initiated",
    },

    isRecurring: {
      type: Boolean,
      default: false,
    },

    receiptUrl: { type: String },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add status to history when status changes
paymentSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory = this.statusHistory || [];
    this.statusHistory.push({
      status: this.status,
      changedBy: this._updatedBy, // You'd set this in your controller
    });
  }
  next();
});

paymentSchema.post("save", async function (doc) {
  if (doc.status === "Completed") {
    const {
      checkCertificates,
    } = require("../controllers/certificateController");
    console.log(`💰 Payment ${doc._id} completed - checking certificates`);
    await checkCertificates(doc.donorId);
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
