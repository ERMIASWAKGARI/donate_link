const mongoose = require("mongoose");

const needsSchema = new mongoose.Schema(
  {
    NGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // The NGO requesting the need

    title: {
      type: String,
      required: true,
      trim: true,
    }, // Title of the need (e.g., "Urgent Food Supplies for 100 Families")

    needType: {
      type: String,
      enum: ["money", "material", "service"],
      required: true,
    }, // Type of need (money, material, or service)

    urgencyLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    }, // Urgency level of the need

    description: {
      type: String,
      required: true,
      trim: true,
    }, // Detailed description of the need

    status: {
      type: String,
      enum: ["Open", "Fulfilled", "Expired"],
      default: "Open",
    }, // Current status of the need
endDate:{
  type:Date,
  required:true
},
  targetMoney: {
          type: Number,
          required: function () {
            return this.parent().needType === "money";
          }, // Required only for money needs
          min: 0, // Ensure the amount is non-negative
        },
    beneficiaryInfo: {
      numberOfBeneficiaries: { type: Number, required: true }, // Number of people benefiting
      pictures: [{ type: String }], // Images of beneficiaries or the situation
      location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String }, // Human-readable address
      }, // Location of the need
    },

    category: [
      {
        categoryName: {
          type: String,
          required: true,
        },
        subCategoryName: {
          type: String,
          required: true,
        },
        targetAmountNeeded: {
          type: String,
          required: function () {
            return this.parent().needType === "matterial";
          },
          min: 1,
        },
        vacancy: {
          type: String,
          required: function () {
            return this.parent().needType === "service";
          },
          min: 1,
        },
        targetMoney: {
          type: Number,
          required: function () {
            return this.parent().needType === "money";
          }, // Required only for money needs
          min: 0, // Ensure the amount is non-negative
        },
      },
    ],
    donors: [
      {
        donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Donor who contributed
      },
    ], // List of donors and their contributions

    endDate: { type: Date, required: true }, // Deadline for the need
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt fields
);

module.exports = mongoose.model("Needs", needsSchema);
//allow the updation to description

 