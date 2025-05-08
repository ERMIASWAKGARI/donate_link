const mongoose = require("mongoose");
const User = require("./User");
const { sendNotification } = require("../utils/notificationService");

// Constants for scoring weights
const SCORE_WEIGHTS = {
  PREFERENCE: 60, // Highest priority
  ADDRESS: 35, // Secondary priority
  TIMING: 5, // Lowest priority
};

// Matching window (3 minutes for testing, 6 hours in production)
const MATCHING_WINDOW_MS = 3 * 60 * 1000;

const donationsSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    need: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Needs",
    },
    NGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Changed from "NGO" to "User" for consistency
      default: null,
    },
    donationType: {
      type: String,
      enum: ["money", "material", "service", "other"],
      required: true,
    },
    amount: {
      type: Number,
      required: function () {
        return this.donationType === "money";
      },
    },
    trackingId: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      default: "ETB",
      required: function () {
        return this.donationType === "money";
      },
    },
    description: {
      type: String,
      maxlength: 500,
    },
    title: {
      type: String,
    },
    materialDetails: {
      category: {
        type: String,

        required: function () {
          return this.donationType === "material";
        },
      },
      customCategory: {
        type: String,

        required: function () {
          return (
            this.donationType === "material" &&
            this.materialDetails.category === "other"
          );
        },
        maxlength: 100,
      },
      subCategory: {
        type: String,
        required: function () {
          return this.donationType === "material";
        },
      },
      customSubCategory: {
        type: String,
        required: function () {
          return (
            this.donationType === "material" &&
            this.materialDetails.subCategory === "other"
          );
        },
        maxlength: 100,
      },
      quantity: {
        type: Number,
        required: function () {
          return this.donationType === "material";
        },
      },
      unit: {
        type: String,
        required: function () {
          return this.donationType === "material";
        },
      },
      condition: {
        type: String,
        enum: ["new", "used", "refurbished"],
        required: function () {
          return this.donationType === "material";
        },
      },
      expirationDate: {
        type: Date,
        required: function () {
          return (
            this.donationType === "material" &&
            (this.materialDetails.category === "food" ||
              this.materialDetails.category === "medical")
          );
        },
      },
    },
    serviceDetails: {
      type: String,
      required: function () {
        return this.donationType === "service";
      },
    },
    address: {
      country: {
        type: String,
        required: function () {
          return this.donationType === "material";
        },
      },
      region: {
        type: String,
        required: function () {
          return this.donationType === "material";
        },
      },
      city: {
        type: String,
        required: function () {
          return this.donationType === "material";
        },
      },
      street: {
        type: String,
      },
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: [
        "pending",
        "posted",
        "requested",
        "accepted",
        "rejected",
        "completed",
      ],
      default: "posted",
    },
    // --- Image Uploads (Max 5) ---
    images: {
      type: [String], // Array of image URLs
      default: [],
    },

    matchingProcess: {
      startedAt: { type: Date },
      expiresAt: { type: Date },
      completedAt: { type: Date },
      matchedNGO: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      potentialMatches: [
        {
          ngo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          requestTime: { type: Date, default: Date.now },
          matchScore: { type: Number },
          preferenceMatched: { type: Boolean },
          addressMatchLevel: { type: String },
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
donationsSchema.index({ location: "2dsphere" });
donationsSchema.index({ "matchingProcess.expiresAt": 1 });

// Virtual for matching status
donationsSchema.virtual("isMatchingActive").get(function () {
  return (
    this.status === "posted" &&
    this.matchingProcess.startedAt &&
    !this.matchingProcess.completedAt &&
    new Date() < this.matchingProcess.expiresAt
  );
});

// Pre-save hook for request handling
donationsSchema.pre("save", async function (next) {
  if (this.isModified("requests")) {
    // Get the difference between old and new requests
    const originalDoc =
      this.$__.originalDoc || (await this.constructor.findById(this._id));
    const originalRequests = originalDoc ? originalDoc.requests : [];

    const addedRequests = this.requests.filter(
      (request) =>
        !originalRequests.some((r) => r.toString() === request.toString())
    );

    const removedRequests = originalRequests.filter(
      (request) =>
        !this.requests.some((r) => r.toString() === request.toString())
    );

    // Handle added requests
    if (addedRequests.length > 0 && this.status === "posted") {
      if (!this.matchingProcess.startedAt) {
        this.matchingProcess.startedAt = new Date();
        this.matchingProcess.expiresAt = new Date(
          Date.now() + MATCHING_WINDOW_MS
        );
      }

      for (const ngoId of addedRequests) {
        await this.scoreAndAddRequest(ngoId);
      }
    }

    // Handle removed requests (cancel request)
    if (removedRequests.length > 0) {
      this.matchingProcess.potentialMatches =
        this.matchingProcess.potentialMatches.filter(
          (match) =>
            !removedRequests.some((r) => r.toString() === match.ngo.toString())
        );
    }
  }
  next();
});

// Method to score and add a request
donationsSchema.methods.scoreAndAddRequest = async function (ngoId) {
  // Check if NGO already exists in potentialMatches
  const existingMatchIndex = this.matchingProcess.potentialMatches.findIndex(
    (match) => match.ngo.toString() === ngoId.toString()
  );

  const ngo = await User.findById(ngoId);
  if (!ngo || ngo.role !== "ngo") return;

  let matchScore = 0;
  let preferenceMatched = false;
  let addressMatchLevel = "none";

  // 1. PREFERENCE MATCH (60 points)
  if (ngo.preferences?.includes(this.materialDetails.category)) {
    matchScore += SCORE_WEIGHTS.PREFERENCE;
    preferenceMatched = true;
  }

  // 2. ADDRESS MATCH (35 points max)
  if (ngo.address && this.address) {
    if (ngo.address.country === this.address.country) {
      matchScore += 10;
      addressMatchLevel = "country";

      if (ngo.address.region === this.address.region) {
        matchScore += 10;
        addressMatchLevel = "region";

        if (ngo.address.city === this.address.city) {
          matchScore += 15;
          addressMatchLevel = "city";
        }
      }
    }
  }

  // 3. TIMING (5 points base)
  matchScore += SCORE_WEIGHTS.TIMING;

  const newMatch = {
    ngo: ngoId,
    requestTime: new Date(),
    matchScore,
    preferenceMatched,
    addressMatchLevel,
  };

  if (existingMatchIndex >= 0) {
    this.matchingProcess.potentialMatches[existingMatchIndex] = newMatch;
  } else {
    this.matchingProcess.potentialMatches.push(newMatch);
  }

  // Sort with clear priorities
  this.matchingProcess.potentialMatches.sort((a, b) => {
    // 1. NGOs with preference match first
    if (a.preferenceMatched !== b.preferenceMatched) {
      return b.preferenceMatched - a.preferenceMatched;
    }
    // 2. Higher score next
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    // 3. Better address match
    const addressPriority = { city: 3, region: 2, country: 1, none: 0 };
    if (
      addressPriority[b.addressMatchLevel] !==
      addressPriority[a.addressMatchLevel]
    ) {
      return (
        addressPriority[b.addressMatchLevel] -
        addressPriority[a.addressMatchLevel]
      );
    }
    // 4. Earlier request as tiebreaker
    return a.requestTime - b.requestTime;
  });
};

// Method to complete matching
donationsSchema.methods.completeMatching = async function () {
  if (this.matchingProcess.completedAt) return;

  // Get all NGOs that still have active requests
  const activeMatches = this.matchingProcess.potentialMatches.filter((match) =>
    this.requests.some((r) => r.toString() === match.ngo.toString())
  );

  // First try to find NGOs with preference match
  const preferredMatches = activeMatches.filter((m) => m.preferenceMatched);
  const bestMatch = preferredMatches[0] || activeMatches[0];

  if (bestMatch) {
    // Verify the NGO still exists and is valid
    const ngo = await User.findById(bestMatch.ngo);
    if (!ngo || ngo.role !== "ngo") {
      this.status = "posted";
      await this.save();
      return;
    }

    // Update the donation
    this.NGO = bestMatch.ngo;
    this.status = "accepted";
    this.matchingProcess.matchedNGO = bestMatch.ngo;
    this.matchingProcess.completedAt = new Date();

    const updatedDonation = await this.save();

    if (!updatedDonation.NGO || updatedDonation.status !== "accepted") {
      throw new Error("Failed to update donation status and NGO assignment");
    }

    await this.sendMatchNotifications();
  } else {
    this.status = "posted";
    await this.save();
  }
};

// Static method to process expired matches
donationsSchema.statics.processExpiredMatches = async function () {
  const now = new Date();
  const donations = await this.find({
    status: "posted",
    "matchingProcess.expiresAt": { $lte: now },
    "matchingProcess.completedAt": { $exists: false },
  });

  for (const donation of donations) {
    try {
      await donation.completeMatching();
    } catch (err) {
      console.error(`Error processing donation ${donation._id}:`, err);
      donation.status = "posted";
      await donation.save();
    }
  }
};

// Post-save hook for scheduling matching completion
donationsSchema.post("save", function (doc, next) {
  if (doc.isMatchingActive) {
    const timeRemaining = Math.max(
      0,
      doc.matchingProcess.expiresAt - new Date()
    );
    setTimeout(async () => {
      try {
        await doc.constructor.processExpiredMatches();
      } catch (err) {
        console.error("Error in matching expiration handler:", err);
      }
    }, timeRemaining);
  }
  next();
});

// Method to cancel a request
donationsSchema.methods.cancelRequest = async function (ngoId) {
  // Remove from requests array
  this.requests = this.requests.filter(
    (id) => id.toString() !== ngoId.toString()
  );

  // Remove from potential matches
  this.matchingProcess.potentialMatches =
    this.matchingProcess.potentialMatches.filter(
      (match) => match.ngo.toString() !== ngoId.toString()
    );

  await this.save();
};

// Method to send notifications (stub)
donationsSchema.methods.sendMatchNotifications = async function () {
  // Implementation would go here
  console.log(`Notification sent for donation ${this._id} to NGO ${this.NGO}`);
  await sendNotification(
    this.NGO,
    `your request for donation ${this.title} is accepted please track using id: ${this.trackingId}`,
    "request-accepted",
    `/#`
  );
};

module.exports = mongoose.model("Donations", donationsSchema);
