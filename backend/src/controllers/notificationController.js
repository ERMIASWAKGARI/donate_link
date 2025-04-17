// const Application = require("../models/applicationModel");
const Notification = require("../models/notificationModel");
// const { getIO } = require("../utils/socketConfig");
const AppError = require("../utils/appError");
const sendSuccessResponse = require("../utils/responseHelper");
const asyncWrapper = require("../middleware/asyncWrapper");

// GET /api/notifications
exports.getNotifications = asyncWrapper(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    seen: false,
  });

  return res.status(200).json({
    status: "success",
    message: "Notifications fetched successfully",
    data: {
      notifications,
      unreadCount,
    },
  });
});

// PATCH /api/notifications/:id
exports.markNotificationAsRead = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByIdAndUpdate(id, { seen: true });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  return sendSuccessResponse(res, null, "Notification marked as read");
});

// PATCH /api/notifications
// Updated mark-all-as-read controller
exports.markAllAsRead = asyncWrapper(async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        seen: false,
      },
      { $set: { seen: true } }
    );

    if (result.modifiedCount === 0) {
      return res.status(200).json({
        status: "success",
        message: "No unread notifications to mark",
      });
    }

    return res.status(200).json({
      status: "success",
      message: `${result.modifiedCount} notifications marked as read`,
    });
  } catch (error) {
    console.error("Detailed Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      status: "error",
      message: "Database operation failed",
    });
  }
});

exports.clearNotifications = asyncWrapper(async () => {
  try {
    await Notification.deleteMany({}); // Deletes all documents
    console.log("All notifications deleted, collection remains.");
  } catch (error) {
    console.error("Error deleting notifications:", error);
  }
});
