const Donations = require("../../models/donationItemsModel");
const Needs = require("../../models/needsModel");

const donateItems = async (req, res) => {
  try {
    const { needId, NGOId, matterialDonated } = req.body;
console.log(req.user)
    // Ensure the authenticated user is a donor (either individual or organization)
    if (
      !req.user ||
      !["individual_donor", "organization_donor"].includes(req.user.role)
    ) {
      return res
        .status(403)
        .json({ message: "Access denied. Only donors can donate." });
    }

    // Validate that at least one of needId or NGOId is provided
    if (!needId && !NGOId) {
      return res
        .status(400)
        .json({ message: "Either needId or NGOId is required." });
    }

    // If needId is provided, check if it exists
    let needExists = null;
    if (needId) {
      needExists = await Needs.findById(needId);
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

    // Create a new donation entry
    const newDonation = new Donations({
      donor: req.user._id,
      need: needExists ? needId : undefined,
      NGO: NGOId || undefined,
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
