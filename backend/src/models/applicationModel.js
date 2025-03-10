const applicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // The applicant (volunteer or NGO)

    category: {
      type: String,
      required: true,
    },

    subCategory: {
      type: String,
      required: true,
    },

    need: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needs",
      required: true,
    }, // The need being applied for
    skills: {
      type: [String],
    },
    yearsOfExperience: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["accepted", "rejected"],
    },
    importantDocuments: {
      type: [String],
    },
  },
  { timestamps: true }
);
