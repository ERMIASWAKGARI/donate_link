
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

    donationType: {
      type: String,
      enum: ["money", "material", "service"],
      required: true,
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
          required: function () {
            this.parent().donationType === "matterial";
          },
        },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Donations", needsSchema);