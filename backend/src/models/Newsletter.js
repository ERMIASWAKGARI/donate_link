const mongoose = require("mongoose");

const NewsletterSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sent"],
      default: "draft",
    },
    scheduledAt: {
      type: Date,
      validate: {
        validator: function (v) {
          // Only allow future dates for scheduling
          return !v || v > new Date();
        },
        message: "Scheduled date must be in the future",
      },
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscriber",
      },
    ],
    sentAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Newsletter", NewsletterSchema);
