const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema(
  {
    user: {
      // Changed from userId to user for population
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["donation", "volunteering"],
      required: true,
    },
    title: {
      type: String,
      default: "Certificate of Appreciation",
    },
    description: {
      type: String,
      default: "For outstanding contributions to our community",
    },
    participationCount: {
      type: Number,
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    pdfData: {
      type: Buffer,
      required: true,
    },
    metadata: {
      designVersion: String,
      issuer: {
        type: String,
        default: "NGO Platform",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add population to all queries
CertificateSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email role profilePicture",
  });
  next();
});

module.exports = mongoose.model("Certificate", CertificateSchema);
