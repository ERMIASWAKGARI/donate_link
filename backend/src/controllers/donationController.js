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

const handleFileUploads = async (files, uploadPath) => {
  try {
    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    const fileUrls = await Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const newFilename = `donation-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}${path.extname(file.originalname)}`;
          const newPath = path.join(__dirname, uploadPath, newFilename);

          fs.rename(file.path, newPath, (err) => {
            if (err) return reject(err);
            resolve(`${uploadPath}/${newFilename}`);
          });
        });
      })
    );

    return fileUrls;
  } catch (error) {
    // Clean up any uploaded files on error
    if (files) {
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    throw error;
  }
};
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
    const fileUrls = await handleFileUploads(req.files, "../uploads/donations");
    console.log("7. Files processed successfully");

    // Parse the JSON data if it's sent as a string in FormData
    let donationData = {};
    if (req.body.data) {
      try {
        donationData = JSON.parse(req.body.data);
        console.log("7.2 Parsed donation data:", donationData);
      } catch (e) {
        console.error("7.3 Error parsing JSON data:", e);
        return next(new AppError("Invalid donation data format", 400));
      }
    }

    // Get location data from either direct body or parsed data
    const locationSource = req.body.location || donationData.location;
    console.log("7.4 Location source:", locationSource);

    if (!locationSource || !locationSource.coordinates) {
      console.log("7.5 Missing location coordinates");
      return next(new AppError("Location coordinates are required", 400));
    }

    // Parse coordinates
    const longitude = parseFloat(locationSource.coordinates[0]);
    const latitude = parseFloat(locationSource.coordinates[1]);

    if (isNaN(longitude) || isNaN(latitude)) {
      console.log("7.6 Invalid coordinates:", {
        longitude: locationSource.coordinates[0],
        latitude: locationSource.coordinates[1],
      });
      return next(new AppError("Valid location coordinates are required", 400));
    }

    const location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    console.log("7.7 Formatted location:", location);

    // Prepare the donation data with proper category handling
    const { materialDetails, description, title, ...otherData } = donationData;

    // Validate category and subcategory
    if (!materialDetails?.category) {
      return next(new AppError("Category is required", 400));
    }

    if (
      materialDetails.category === "other" &&
      !materialDetails.customCategory
    ) {
      return next(
        new AppError("Custom category is required when selecting 'other'", 400)
      );
    }

    if (!materialDetails?.subCategory) {
      return next(new AppError("Subcategory is required", 400));
    }

    if (
      materialDetails.subCategory === "Other" &&
      !materialDetails.customSubCategory
    ) {
      return next(
        new AppError(
          "Custom subcategory is required when selecting 'Other'",
          400
        )
      );
    }

    // Prepare the material details for database
    const dbMaterialDetails = {
      category:
        materialDetails.category === "other"
          ? "other"
          : materialDetails.category,
      ...(materialDetails.category === "other" && {
        customCategory: materialDetails.customCategory,
      }),
      subCategory:
        materialDetails.subCategory === "Other"
          ? "Other"
          : materialDetails.subCategory,
      ...(materialDetails.subCategory === "Other" && {
        customSubCategory: materialDetails.customSubCategory,
      }),
      quantity: materialDetails.quantity,
      unit: materialDetails.unit,
      condition: materialDetails.condition,
      ...(materialDetails.expirationDate && {
        expirationDate: new Date(materialDetails.expirationDate),
      }),
    };

    // Create donation
    const donation = await Donations.create({
      donor: donorId,
      ...otherData,
      description,
      title,
      materialDetails: dbMaterialDetails,
      location,
      images: fileUrls,
      trackingId: generateTrackingId(),
      donationType: "material",
      status: "pending",
    });

    console.log("8. Donation created successfully");
    sendSuccessResponse(res, 201, { donation });
  } catch (err) {
    console.error("9. Error in donation creation:", err);
    next(new AppError("Error processing donation: " + err.message, 500));
  }
});

const createOtherDonation = asyncWrapper(async (req, res, next) => {
  try {
    const donorId = req.user.id;

    // Verify user exists and is organization donor
    const user = await User.findById(donorId).select("+role").lean();
    if (!user || user.role !== "organization_donor") {
      return next(new AppError("Not authorized", 403));
    }

    const fileUrls = await handleFileUploads(req.files, "../uploads/donations");
    console.log("7. Files processed successfully");
    // Parse the JSON data if it's sent as a string in FormData
    let donationData = {};
    if (req.body.data) {
      try {
        donationData = JSON.parse(req.body.data);
      } catch (e) {
        return next(new AppError("Invalid donation data format", 400));
      }
    }

    // Required fields validation
    if (!donationData.title) {
      return next(new AppError("Title is required", 400));
    }

    if (!donationData.address) {
      return next(new AppError("Address is required", 400));
    }

    // Location validation
    if (!donationData.location || !donationData.location.coordinates) {
      return next(new AppError("Location coordinates are required", 400));
    }

    const [longitude, latitude] = donationData.location.coordinates.map(
      (coord) => parseFloat(coord)
    );
    if (isNaN(longitude) || isNaN(latitude)) {
      return next(new AppError("Valid location coordinates are required", 400));
    }

    // Prepare the donation data
    const donation = {
      donor: donorId,
      donationType: "other",
      title: donationData.title,
      description: donationData.description || "",
      address: donationData.address,
      images: fileUrls,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      trackingId: generateTrackingId(),
      status: donationData.status || "pending",
      notifications: donationData.notifications || [],
    };

    // Handle file uploads

    // Create the donation
    const createdDonation = await Donations.create(donation);

    res.status(201).json({
      status: "success",
      data: {
        donation: createdDonation,
      },
    });
  } catch (err) {
    next(new AppError("Error processing donation: " + err.message, 500));
  }
});
// Helper function to generate tracking ID

const getAllMaterialDonations = asyncWrapper(async (req, res, next) => {
  console.log("1. Getting all material donations");
  const donations = await Donations.find({
    donationType: "material",
    // status: "pending",
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
  console.log("donation", donation);
  const { ngoId } = req.body;

  if (!donation) {
    return next(new AppError("No donation found with that ID", 404));
  }

  if (donation.status !== "pending") {
    return next(
      new AppError("This donation is not available for request", 400)
    );
  }

  // Verify NGO user exists
  const ngoUser = await User.findById(ngoId);

  if (!ngoUser || ngoUser.role !== "ngo") {
    return next(new AppError("No valid NGO found with that ID", 404));
  }

  // Update donation status, add NGO to requests array, and save
  // donation.status = "requested";
  if (!donation.requests.includes(ngoId)) {
    donation.requests.push(ngoId);
  }
  await donation.save();
  console.log("donation", donation);

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

const deleteAllDonations = asyncWrapper(async (req, res, next) => {
  try {
    // For testing purposes - no password required
    console.warn(
      "WARNING: Running in test mode - any authenticated user can delete all donations"
    );

    await Promise.all([Donations.deleteMany({}), ,]);

    res.status(200).json({
      status: "success",
      message: "TEST MODE: All donations deleted",
      data: {},
    });
  } catch (err) {
    console.error("Error in test deletion:", err);
    next(new AppError("Test deletion failed: " + err.message, 500));
  }
});
module.exports = {
  createMaterialDonation,
  getAllMaterialDonations,
  requestMaterialDonation,
  respondToDonationRequest,
  completeDonation,
  getDonationByTrackingId,
  createOtherDonation,
  deleteAllDonations,
};
