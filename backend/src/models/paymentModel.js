const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    need: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needs",
      required: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    NGO: {
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
    paymentMethod: {
      type: String,
      enum: [
        "Bank Transfer",
        "Mobile Wallet",
        "International Transfer",
        "Credit Card",
        "Cash",
        "Check",
      ],
      required: true,
    },
    paymentDetails: {
      // Flexible field for method-specific details
      bankName: String,
      accountNumber: String,
      mobileProvider: String,
      phoneNumber: String,
      cardLastFour: String,
      checkNumber: String,
      swiftCode: String,
      iban: String,
    },
    recipientBankDetails: {
      bankCode: String,
      accountNumber: String,
      accountName: String,
    },
    transactionID: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reference: {
      type: String,
      index: true,
    },
    receiptURL: {
      type: String,
      validate: {
        validator: function (v) {
          return /^https?:\/\//.test(v);
        },
        message: "Receipt URL must be a valid HTTP/HTTPS link",
      },
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
    recurringDetails: {
      frequency: {
        type: String,
        enum: ["Weekly", "Monthly", "Quarterly", "Yearly"],
      },
      nextPaymentDate: Date,
      endDate: Date,
    },
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

module.exports = mongoose.model("Payment", paymentSchema);
