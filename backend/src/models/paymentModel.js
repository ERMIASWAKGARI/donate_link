const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // The donor making the payment

    NGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // The NGO receiving the donation

    need: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needs",
      required: true,
    }, // The specific need being funded

    amount: {
      type: Number,
      required: true,
    }, // Amount donated

    currency: {
      type: String,
      default: "ETB",
    }, // Currency (default: Ethiopian Birr)

    description: {
      type: String,
      required: true,
    }, // Purpose or details of the payment

    paymentMethod: {
      type: String,
      enum: ["Telebirr", "Bank Transfer", "Chappa", "PayPal", "CreditCard"],
      required: true,
    }, // Payment method used

    bankAccount: {
      type: String,
      required: function () {
        return this.paymentMethod === "Bank Transfer";
      },
    }, // Bank account where funds are transferred (for bank transfers)

    transactionID: {
      type: String,
      required: true,
      unique: true,
    }, // Unique ID for the transaction

    reference: {
      type: String,
    }, // Additional reference from payment gateway

    receiptURL: {
      type: String,
    }, // URL for digital receipt from the payment gateway

    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    }, // Payment status

    paymentDate: {
      type: Date,
      default: Date.now,
    }, // Timestamp of payment

    updatedAt: {
      type: Date,
      default: Date.now,
    }, // Timestamp when status changes
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

module.exports = mongoose.model("Payment", paymentSchema);
