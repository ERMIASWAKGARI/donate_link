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
    bankAccount: { type: String ,required:function (){
      return this.needType==='money'
    }},
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
    totalDonated: { type: Number, default: 0 },
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
    donors: [
      {
        donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        amount: Number,
        date: { type: Date, default: Date.now },
      },
    ],
    displayTime: {
      type: Number, // Duration in days
      default: 30, // Default to 30 days
      required: true,
    },
    expiryDate: { type: Date, required: true },
//add end date 
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ✅ Auto-calculate `expiryDate`
needsSchema.pre("save", function (next) {
  this.expiryDate = moment(this.createdAt)
    .add(this.displayTime, "days")
    .toDate();
  next();
});

module.exports = mongoose.model("Needs", needsSchema);
//allow the updation to description
//