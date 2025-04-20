const Notification = require('../models/notificationModel');
const { getIO, onlineUsers } = require('../utils/socketConfig');

// Function to Create and Emit Notification
const sendNotification = async (recipientId, message, type, link) => {
  console.log('Sending notification to:', recipientId, message, type);
  // Store Notification in DB
  const notification = await Notification.create({
    recipient: recipientId,
    message,
    type,
    link,
  });

  // Emit Notification if the User is Online
  const socketId = onlineUsers.get(recipientId.toString());
  if (socketId) {
    getIO().to(socketId).emit('notification', {
      id: notification._id,
      message: notification.message,
      type: notification.type,
      seen: notification.seen,
      link: notification.link,
      createdAt: notification.createdAt,
    });
  }
};

module.exports = { sendNotification };
