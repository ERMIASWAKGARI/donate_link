const Donations = require("../models/donationsModel");
const Notification = require("../models/notificationModel");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");
const { generateTrackingId } = require("../utils/helpers");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const sendSuccessResponse = require("../utils/responseHelper");

// @desc    Create a new material donation post
// @route   POST /api/donations/material
// @access  Private (Organization Donor)
const moveFilesToPermanentLocation = (files) => {
  const fileUrls = [];
  const uploadPath = path.join(__dirname, "../uploads/donations");

  // Create upload directory if it doesn't exist
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  files.forEach((file) => {
    const newFilename = `donation-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    const newPath = path.join(uploadPath, newFilename);

    fs.renameSync(file.path, newPath);
    fileUrls.push(`/uploads/donations/${newFilename}`);
  });

  return fileUrls;
};

// @desc    Create a new material donation post
// @route   POST /api/donations/material
// @access  Private (Organization Donor)
const createMaterialDonation = asyncWrapper(async (req, res, next) => {
  try {
    console.log("1. Starting donation creation");

    const donorId = req.user.id;
    console.log("2. Using donorId:", donorId);

    // Verify user exists and is organization donor
    const user = await User.findById(donorId).select("+role").lean();
    if (!user || user.role !== "organization_donor") {
      console.log("3. User verification failed");
      return next(new AppError("Not authorized", 403));
    }

    console.log("4. User verified successfully");

    // File handling
    if (!req.files || req.files.length === 0) {
      console.log("5. No files uploaded");
      return next(new AppError("Please upload at least one file", 400));
    }

    console.log("6. Processing", req.files.length, "files");

    // Process files
    const fileUrls = await Promise.all(
      req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const newFilename = `donation-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}${path.extname(file.originalname)}`;
          const newPath = path.join(
            __dirname,
            "../uploads/donations",
            newFilename
          );

          fs.rename(file.path, newPath, (err) => {
            if (err) return reject(err);
            resolve(`/uploads/donations/${newFilename}`);
          });
        });
      })
    );

    console.log("7. Files processed successfully");

    // Validate and format location data
    if (!req.body.location || !req.body.location.coordinates) {
      return next(new AppError("Location coordinates are required", 400));
    }

    const location = {
      type: "Point", // Ensure correct case
      coordinates: [
        parseFloat(req.body.location.coordinates[0]), // longitude
        parseFloat(req.body.location.coordinates[1]), // latitude
      ],
    };

    // Create donation
    const donation = await Donations.create({
      donor: donorId,
      ...req.body,
      images: fileUrls,
      trackingId: generateTrackingId(),
      donationType: "material",
      status: "pending",
    });

    console.log("8. Donation created successfully");

    sendSuccessResponse(res, 201, { donation });
  } catch (err) {
    console.error("9. Error in donation creation:", err);

    // Clean up any uploaded files
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    next(new AppError("Error processing donation: " + err.message, 500));
  }
});
// @desc    Get all material donations (for NGOs to browse)
// @route   GET /api/donations/material
// @access  Private (NGOs)
const getAllMaterialDonations = asyncWrapper(async (req, res, next) => {
  const donations = await Donations.find({
    donationType: "material",
    status: "posted",
  }).populate("donor", "name email phone");

  sendSuccessResponse(res, 200, {
    results: donations.length,
    donations,
  });
});

// @desc    Request a material donation (NGO sends request)
// @route   POST /api/donations/material/:id/request
// @access  Private (NGO)
const requestMaterialDonation = asyncWrapper(async (req, res, next) => {
  const donation = await Donations.findById(req.params.id);
  const { ngoId } = req.body;

  if (!donation) {
    return next(new AppError("No donation found with that ID", 404));
  }

  if (donation.status !== "posted") {
    return next(
      new AppError("This donation is not available for request", 400)
    );
  }

  // Verify NGO user exists
  const ngoUser = await User.findById(ngoId);
  if (!ngoUser || ngoUser.role !== "ngo") {
    return next(new AppError("No valid NGO found with that ID", 404));
  }

  // Update donation status and add NGO
  donation.NGO = ngoId;
  donation.status = "requested";
  await donation.save();

  // Create notification for donor
  const notification = await Notification.create({
    recipient: donation.donor,
    sender: ngoId,
    type: "donation-request",
    title: "New Donation Request",
    message: `${ngoUser.name} has requested your donation (Tracking ID: ${donation.trackingId})`,
    data: {
      donationId: donation._id,
      trackingId: donation.trackingId,
      actionRequired: true,
    },
  });

  sendSuccessResponse(res, 200, { donation, notification });
});

// @desc    Respond to donation request (Accept/Reject)
// @route   PATCH /api/donations/material/:id/respond
// @access  Private (Organization Donor)
const respondToDonationRequest = asyncWrapper(async (req, res, next) => {
  const { response } = req.body; // 'accept' or 'reject'
  const donation = await Donations.findById(req.params.id);

  if (!donation) {
    return next(new AppError("No donation found with that ID", 404));
  }

  if (donation.status !== "requested") {
    return next(new AppError("This donation is not in requested state", 400));
  }

  // Verify the requester is the donor
  if (donation.donor.toString() !== req.user.id) {
    return next(
      new AppError("You are not authorized to respond to this request", 403)
    );
  }

  if (!["accept", "reject"].includes(response)) {
    return next(
      new AppError("Invalid response type. Use 'accept' or 'reject'", 400)
    );
  }

  // Update donation status based on response
  donation.status = response === "accept" ? "accepted" : "rejected";
  await donation.save();

  // Create appropriate notification for NGO
  const notificationMessage =
    response === "accept"
      ? `Your request for donation (Tracking ID: ${donation.trackingId}) has been accepted. You can now collect the items.`
      : `Your request for donation (Tracking ID: ${donation.trackingId}) has been rejected.`;

  const notification = await Notification.create({
    recipient: donation.NGO,
    sender: donation.donor,
    type: `donation-${response}`,
    title: `Donation Request ${
      response === "accept" ? "Accepted" : "Rejected"
    }`,
    message: notificationMessage,
    data: {
      donationId: donation._id,
      trackingId: donation.trackingId,
      status: donation.status,
    },
  });

  sendSuccessResponse(res, 200, { donation, notification });
});

// @desc    Mark donation as completed (after pickup)
// @route   PATCH /api/donations/material/:id/complete
// @access  Private (Organization Donor or NGO)
const completeDonation = asyncWrapper(async (req, res, next) => {
  const donation = await Donations.findById(req.params.id);

  if (!donation) {
    return next(new AppError("No donation found with that ID", 404));
  }

  if (donation.status !== "accepted") {
    return next(
      new AppError("Only accepted donations can be marked as completed", 400)
    );
  }

  // Verify the requester is either the donor or the NGO
  if (
    donation.donor.toString() !== req.user.id &&
    donation.NGO.toString() !== req.user.id
  ) {
    return next(
      new AppError("You are not authorized to complete this donation", 403)
    );
  }

  donation.status = "completed";
  await donation.save();

  // Create notification for both parties
  const donorNotification = await Notification.create({
    recipient: donation.donor,
    sender: donation.NGO,
    type: "donation-completed",
    title: "Donation Completed",
    message: `Your donation (Tracking ID: ${
      donation.trackingId
    }) has been successfully collected by ${
      req.user.role === "ngo" ? "your organization" : "the NGO"
    }.`,
    data: {
      donationId: donation._id,
      trackingId: donation.trackingId,
    },
  });

  const ngoNotification = await Notification.create({
    recipient: donation.NGO,
    sender: donation.donor,
    type: "donation-completed",
    title: "Donation Completed",
    message: `You have successfully collected the donation (Tracking ID: ${donation.trackingId}).`,
    data: {
      donationId: donation._id,
      trackingId: donation.trackingId,
    },
  });

  sendSuccessResponse(res, 200, {
    donation,
    notifications: [donorNotification, ngoNotification],
  });
});

// @desc    Get donation by tracking ID
// @route   GET /api/donations/tracking/:trackingId
// @access  Private (Related parties)
const getDonationByTrackingId = asyncWrapper(async (req, res, next) => {
  const donation = await Donations.findOne({
    trackingId: req.params.trackingId,
  })
    .populate("donor", "name email phone")
    .populate("NGO", "name email phone");

  if (!donation) {
    return next(new AppError("No donation found with that tracking ID", 404));
  }

  // Verify the requester is either the donor or the NGO
  if (
    donation.donor._id.toString() !== req.user.id &&
    donation.NGO &&
    donation.NGO._id.toString() !== req.user.id
  ) {
    return next(
      new AppError("You are not authorized to view this donation", 403)
    );
  }

  sendSuccessResponse(res, 200, { donation });
});

module.exports = {
  createMaterialDonation,
  getAllMaterialDonations,
  requestMaterialDonation,
  respondToDonationRequest,
  completeDonation,
  getDonationByTrackingId,
};
