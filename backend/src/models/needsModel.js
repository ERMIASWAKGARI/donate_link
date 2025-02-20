const mongoose = require("mongoose");

const needsSchema = new mongoose.Schema(
  {
    NGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // The NGO requesting the need

    needType: {
      type: String,
      enum: ["money", "material", "service"],
      required: true,
    }, // Type of need

    urgencyLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    }, // Urgency level

    description: {
      type: String,
      required: true,
      trim: true,
    }, // Description of the need

    amount: {
      type: Number,
      min: 0,
      required: function () {
        return this.needType === "money";
      },
    }, // Required amount (for money donations)

    quantity: {
      type: Number,
      min: 1,
      required: function () {
        return this.needType === "material";
      },
    }, // Quantity (for material needs)

    vacancy: {
      type: Number,
      min: 1,
      required: function () {
        return this.needType === "service";
      },
    }, // Number of volunteers needed (for service needs)

    status: {
      type: String,
      enum: ["Open", "Fulfilled", "Expired", "Closed"],
      default: "Open",
    }, // Current status

    beneficiary: {
      type: Number,
      min: 1,
      required: function () {
        return this.needType !== "service";
      },
    }, // Number of people benefiting from this need

    displayTime: {
      type: Number, // Duration in days
      default: 30, // Default to 30 days
      required: true,
    },

   

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
 
);

// ✅ Auto-calculate `expiryDate`


module.exports = mongoose.model("Needs", needsSchema);
