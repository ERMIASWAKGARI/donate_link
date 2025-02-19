const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The donor making the payment
  NGO: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The NGO receiving the donation
  amount: { type: Number, required: true }, // Amount donated
  currency: { type: String, default: "ETB" }, // Currency (default: Ethiopian Birr)
  description: { type: String, required: true }, // Purpose or details of the payment
  paymentMethod: {
    type: String,
    enum: ["Telebirr", "Bank Transfer", "Chappa", "PayPal", "CreditCard"],
    required: true,
  }, // Payment method used
  transactionID: { type: String, required: true, unique: true }, // Unique ID for the transaction
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  }, // Payment status
  paymentDate: { type: Date, default: Date.now }, // Timestamp of payment
});

module.exports = mongoose.model("Payment", paymentSchema);
