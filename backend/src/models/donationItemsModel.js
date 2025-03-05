const mongoose = require("mongoose");
const donationsSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // The donor (individual or organization)
    need: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needs",
    }, // The need being fulfilled (optional, if donation is not tied to a specific need)
    NGO: {
      type: mongoose.Schema.Types.ObjectId,
    },

  
status:{
  type: String,
  enum: ["pending", "accepted", "rejected"],
  default: "pending",
},
   
    matterialDonated: [
      {
        category: {
          type: String,
          required: true,
        },
        subCategory: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Donations", donationsSchema);