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
    title,
    needType,
    urgencyLevel,
    description,
    endDate,
    targetMoney,
    beneficiaryInfo,
    category,
  } = req.body;

  // ✅ Ensure only NGOs can post needs
  if (req.user.role.toLowerCase() !== "ngo") {
    return next(new AppError("Only NGOs can post needs", 403));
  }

  // ✅ Validate endDate
  const now = new Date();
  if (new Date(endDate) <= now) {
    return next(new AppError("End date must be in the future.", 400));
  }

  // ✅ Create new need
  const newNeed = await Need.create({
    NGO: req.user._id,
    title,
    needType,
    urgencyLevel,
    description,
    endDate,
    targetMoney: needType === "money" ? targetMoney : undefined,
    beneficiaryInfo,
    category,
  });

  // ✅ Find all donors interested in this type of need
  const donors = await User.find({
    role: { $in: ["individual_donor", "organization_donor"] },
  });

  if (!donors.length) {
    return next(new AppError("No donors found.", 404));
  }

  const io = getIO();
  const notificationsToSave = [];

  donors.forEach((donor) => {
    const notificationMessage = `A new ${needType} need has been posted by ${req.user.name}: ${title}`;

    if (onlineUsers.has(donor._id.toString())) {
      // ✅ Send real-time notification if donor is online
      io.to(onlineUsers.get(donor._id.toString())).emit("newNotification", {
        message: notificationMessage,
        type: "need",
      });
    } else {
      // ✅ Save notification for offline donors
      notificationsToSave.push({
        recipient: donor._id,
        message: notificationMessage,
        type: "need",
      });
    }
  });

  // ✅ Insert notifications into database
  if (notificationsToSave.length > 0) {
    await Notification.insertMany(notificationsToSave);
  }

  res.status(201).json({
    success: true,
    message: "Need posted successfully. Donors have been notified.",
    data: newNeed,
  });
});
