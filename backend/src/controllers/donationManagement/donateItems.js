const Donations = require("../../models/donationItemsModel"); 
const Needs = require("../../models/needsModel"); 

const donateItems = async (req, res) => {
  try {
    const { needId, NGOId, matterialDonated } = req.body;

    // Ensure the authenticated user is a donor
    if (
      !req.user ||
      req.user.role !== "individualDonor" ||
      req.user.role !== "organization"
    ) {
      return res
        .status(403)
        .json({ message: "Access denied. Only donors can donate." });
    }

    // Validate at least one of needId or NGOId is provided
    if (!needId && !NGOId) {
      return res
        .status(400)
        .json({ message: "Either needId or NGOId is required." });
    }

    // If needId is provided, check if it exists
    if (needId) {
      const needExists = await Needs.findById(needId);
      if (!needExists) {
        return res.status(404).json({ message: "Specified need not found." });
      }
    }

    // Ensure materials are provided
    if (!matterialDonated || matterialDonated.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one material must be donated." });
    }

    // Create new donation entry
    const newDonation = new Donations({
      donor: req.user.userId,
      need: needId || undefined,
      NGO: NGOId || undefined,
      donationType: "material",
      matterialDonated,
    });

    // Save to database
    await newDonation.save();

    res
      .status(201)
      .json({ message: "Donation successful", donation: newDonation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
module.exports = donateItems;
// Register the endpoint
