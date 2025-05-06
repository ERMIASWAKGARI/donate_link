const Application = require("../../models/applicationModel");
const Need = require("../../models/needsModel");
const createServiceApplication = async (req, res) => {
  try {
    console.log("createServiceApplication", req.body);
    const {
      // Changed from donorId to match model
      need, // Changed from needId to match model
      category,
      subCategory,
      motivation,
      startDate,
      endDate,
      hoursPerWeek,
      status = "Submitted", // Default status matches model enum
    } = req.body;
    const needBeingApplied = await Need.findById(need);

    // Validate required fields according to model schema
    if (!need || !category || !subCategory || !startDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate dates
    if (endDate && new Date(endDate) <= new Date(startDate)) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    // Create new application according to model structure
    const newApplication = new Application({
      applicant: req?.user?._id, // Assuming req.user contains the authenticated user's info
      need,
      category,
      subCategory,
      motivation,
      startDate,
      endDate,
      hoursPerWeek,
      status,
      NGO:needBeingApplied?.NGO
    });

    await newApplication.save();
    needBeingApplied.hasDonations = true;
    needBeingApplied.save();
    res.status(201).json({
      message: "Application submitted successfully",
      application: newApplication,
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({
      message: "Failed to submit application",
      error: error.message,
    });
  }
};

const updateApplcationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating application ${id} to status: ${status}`);

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedApplication) {
      console.log(`Application ${id} not found`);
      return res.status(404).json({ message: "Application not found" });
    }

    if (status === "Completed") {
      console.log(`Application ${id} completed, checking certificates...`);
      try {
        const {
          checkCertificates,
        } = require("../../controllers/certificateController");
        await checkCertificates(updatedApplication.applicant, "volunteer");
        console.log(
          `✓ Certificate generated for ${updatedApplication.applicant}`
        );
      } catch (certError) {
        console.error("Certificate generation failed:", certError.message);
        // Consider adding notification to admins here
      }
    }

    res.status(200).json({
      message: "Application status updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error(`Status update failed for application ${id}:`, error.message);
    res.status(500).json({
      message: "Failed to update application status",
      error: error.message,
    });
  }
};
const getServiceDonations = async (req, res) => {
  try {
    const { need } = req.params;
    const donations = await Application.find({ need }).populate({
      path: "applicant",
      select: "name email",
    });
    res.status(200).json({ donations });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get service donations",
      error: error.message,
    });
  }
};

module.exports = {
  createServiceApplication,
  getServiceDonations,
  updateApplcationStatus,
};
