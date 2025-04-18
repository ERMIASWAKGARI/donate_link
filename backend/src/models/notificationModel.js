const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'donation-request',
      'application',
      'need',
      'payment',
      'verification_docs_upload',
      'verification_status_approved',
      'verification_status_rejected',
      'general',
    ],
    required: true,
  },
  seen: { type: Boolean, default: false },
  link: { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
