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
   // Number of volunteers needed (for service needs)
    totalDonated: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Open", "Fulfilled", "Expired", ],
      default: "Open",
    }, // Current status

    beneficiaryInfo: {
   amount:{type:Number,required:true},
   picture:{type:[String]},
location:{latitude:{type:Number,required:true},longitude:{type:Number,required:true}}
    }, // Number of people benefiting from this need
    donors: [
      {
        donor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
       
      },
    ],
   
    endDate: { type: Date, required: true },
//add end date 
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
  {timestamps:true}
);

module.exports = mongoose.model("Needs", needsSchema);
//allow the updation to description
//