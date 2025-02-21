const asyncWrapper = require("../../middleware/asyncWrapper");
const Need = require("../../models/needsModel");
const User = require("../../models/User");
const Notification = require("../../models/notificationModel");
const AppError = require("../../utils/appError");
const { getIO, onlineUsers } = require("../../utils/socketConfig");

// @desc    Post a new need
// @route   POST /api/needs
// @access  Private (Only NGOs)
exports.postANeed = asyncWrapper(async (req, res, next) => {
  const {
    needType,
    beneficiary,
    description,
    amount,
    quantity,
    urgencyLevel,
    displayTime,
  } = req.body;

  // Ensure only NGOs can post needs
  if (req.user.role !== "ngo") {
    return next(new AppError("Only NGOs can post needs", 403));
  }

  // Create the new need with expiryDate
  const newNeed = await Need.create({
    NGO: req.user._id,
    needType,
    description,
    amount,
    quantity,
    urgencyLevel,
    beneficiary,
    displayTime,
  });

  // Find all donors
  const donors = await User.find({
    role: "individual_donor" || "organization_donor",
  });

  if (!donors.length) {
    return next(new AppError("No donors found", 404));
  }

  const io = getIO();
  const notificationsToSave = [];

  donors.forEach((donor) => {
    const notificationMessage = `A new need has been posted by ${req.user.name}: ${description}`;

    if (onlineUsers.has(donor._id.toString())) {
      // Send real-time notification if the donor is online
      io.to(onlineUsers.get(donor._id.toString())).emit("newNotification", {
        message: notificationMessage,
        type: "need",
        // expiryDate: newNeed.expiryDate,
      });
    } else {
      // Save notification to the database for offline donors
      notificationsToSave.push({
        recipient: donor._id,
        message: notificationMessage,
        type: "need",
        // expiryDate: newNeed.expiryDate,
      });
    }
  });

  // Insert notifications into the database
  if (notificationsToSave.length > 0) {
    await Notification.insertMany(notificationsToSave);
  }

  res.status(201).json({
    success: true,
    message: "Need posted successfully. Donors have been notified.",
    data: newNeed,
  });
});
