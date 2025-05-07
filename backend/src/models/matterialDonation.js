const mongoose = require("mongoose");

const matteriaDonationSchema = new mongoose.Schema(
  {
    NGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    needId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needs",
      required: true,
    },
    pictures: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: "Cannot upload more than 10 pictures",
      },
    },
    donationType: {
      type: String,
      enum: ["money", "material", "service", "other" ],
      default: "material",
      required: true,
    },
    trackingId: {
      type: String,
      unique: true,
      required: function () {
        return this.donationType === "material";
      },
    },
    location: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
      address: {
        type: String,
        required: true,
      },
    },
    materials: [
      {
        categoryName: {
          type: String,
          required: true,
          maxlength: 50,
        },
        subCategoryName: {
          type: String,
          required: true,
          maxlength: 50,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unit: {
          type: String,
        },
      },
    ],
    status:{
      type:String,
      enum:["pending","completed"],
      default:"pending",
    }

   
  },
  {
    timestamps: true,
  }
);

matteriaDonationSchema.post("save", async function (doc) {
  const { checkCertificates } = require("../controllers/certificateController");
  console.log(
    `📦 Material donation ${doc._id} recorded - checking certificates`
  );
  await checkCertificates(doc.donorId);
});

module.exports = mongoose.model("MaterialDonation", matteriaDonationSchema);
