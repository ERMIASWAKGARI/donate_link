const Notification = require('../models/notificationModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getNotifications = asyncWrapper(async (req, res) => {
  const baseQuery = { recipient: req.user.id };

  if (req.query.seen === 'false') {
    baseQuery.seen = false;
  }

  const features = new APIFeatures(Notification.find(baseQuery), req.query)
    .filter()
    .sort()
    .limit()
    .paginate();

  const notifications = await features.executeQuery();

  const total = await Notification.countDocuments(baseQuery);
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 5;

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    page,
    limit,
    total,
    hasMore: page * limit < total,
    data: {
      notifications,
      unreadCount: await Notification.countDocuments({
        recipient: req.user.id,
        seen: false,
      }),
    },
  });
});

exports.markAsRead = asyncWrapper(async (req, res) => {
  console.log('Marking notification as read:', req.params.id);
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
