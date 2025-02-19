const needsSchema = new mongoose.Schema({
  NGO: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The NGO requesting the need
  needType: { type: String, enum: ["Money", "Material"], required: true }, // Type of need
  description: { type: String, required: true }, // Description of the need
  amount: { type: Number }, // Required amount (for money donations)
  quantity: { type: Number }, // Quantity (for material needs)
  urgencyLevel: {
    type: String,
    enum: ["Low", "Medium", "High"],
    required: true,
  }, // Priority of the need
  status: {
    type: String,
    enum: ["Open", "Fulfilled", "Closed"],
    default: "Open",
  }, // Current status
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model("Needs", needsSchema);
