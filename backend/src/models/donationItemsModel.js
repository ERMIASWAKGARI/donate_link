const donationItemsSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Donor who posted the donation
  donationType: { type: String, enum: ["Money", "Material"], required: true }, // Type of donation
  itemDetails: { type: String }, // Details about material donations
  amount: { type: Number }, // Amount for monetary donations
  status: {
    type: String,
    enum: ["Available", "Claimed", "Completed"],
    default: "Available",
  }, // Status of the donation
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model("DonationItems", donationItemsSchema);
