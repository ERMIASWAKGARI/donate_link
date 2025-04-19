const Notification = require('../models/notificationModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getNotifications = asyncWrapper(async (req, res) => {
  const { seen, page = 1, limit = 5 } = req.query;
  // console.log('Fetching notifications:', req.query);

  const baseQuery = { recipient: req.user.id };
  if (seen === 'false') {
    baseQuery.seen = false;
  }

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Get paginated notifications
  const notifications = await Notification.find(baseQuery)
    .sort({ createdAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit);

  // console.log('Notifications:', notifications);

  // Count total matching notifications
  const total = await Notification.countDocuments(baseQuery);

  // Count unread notifications (for the badge)
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    seen: false,
  });

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
      unreadCount,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
});

exports.markAsRead = asyncWrapper(async (req, res) => {
  // console.log('Marking notification as read:', req.params.id);
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { seen: true },
    { new: true }
  );
  res.status(200).json(notification);
});

// Mark all as read
exports.markAllAsRead = asyncWrapper(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, seen: false },
    { seen: true }
  );
  res.status(200).json({ message: 'All notifications marked as read' });
});
