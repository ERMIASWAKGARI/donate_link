const Notification = require('../models/notificationModel');
const { getIO, onlineUsers } = require('../utils/socketConfig');
console.log("onlineUsers", onlineUsers);
// Function to Create and Emit Notification
const sendNotification = async (recipientId, message, type) => {
  console.log('Sending notification to:', recipientId, message, type);
  // Store Notification in DB
  const notification = await Notification.create({
    recipient: recipientId,
    message,
    type,
  });

  // Emit Notification if the User is Online
  const socketId = onlineUsers.get(recipientId.toString());
  if (socketId) {
    getIO().to(socketId).emit('notification', {
      id: notification._id,
      message: notification.message,
      type: notification.type,
      seen: notification.seen,
      createdAt: notification.createdAt,
    });
  }
};

module.exports = { sendNotification };
