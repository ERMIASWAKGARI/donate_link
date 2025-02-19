const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // NGO or Volunteer applying
  applicationType: {
    type: String,
    enum: ["donationRequest", "volunteerRequest"],
    required: true,
  }, // Type of application
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to DonationItem or Opportunity
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  }, // Status of the application
  message: { type: String }, // Additional message
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model("Application", applicationSchema);
