const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // User receiving the notification
  message: { type: String, required: true }, // Notification message
  type: {
    type: String,
    enum: [
      "donation",
      "application",
      "need",
      "payment",
      "verification_docs",
      "general",
    ],
    required: true,
  }, // Type of notification
  seen: { type: Boolean, default: false }, // Whether the notification has been seen
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model("Notification", notificationSchema);
