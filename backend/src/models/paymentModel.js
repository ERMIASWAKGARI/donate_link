const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
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
     enum: [ "Bank Transfer", "wallet", "international payment", "CreditCard"],
      required: true,
    }, // Payment method used

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
      enum: ["Pending", "Completed", "Failed", "Transferred"],
      default: "Pending",
    }, // Payment status

  
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

module.exports = mongoose.model("Payment", paymentSchema);
 