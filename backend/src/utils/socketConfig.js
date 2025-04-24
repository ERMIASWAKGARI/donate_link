const { Server } = require("socket.io");

const onlineUsers = new Map();
let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoleRoom", (role) => {
      if (!role) {
        console.error("No role provided");
        return;
      }
      console.log("Joining role room:", role);
      const roleRoom = `role_${role.toLowerCase()}`; // normalize role name
      socket.join(roleRoom);
      console.log(`Socket ${socket.id} joined ${roleRoom}`);
    });
    // User authentication middleware
    socket.use(([event, ...args], next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Unauthorized"));
      next();
    });

    socket.on("userOnline", (userId) => {
      console.log("User online:", userId);
     // Ensure userId is a string
      onlineUsers.set(userId, userId);
      socket.join(userId);
      console.log(`User ${userId} is online`);
    });

    // Handle role room joining
    // Handle conversation joining
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Handle typing events
    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit("typing", {
        userId: socket.userId,
        isTyping,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      onlineUsers.forEach((value, key) => {
        if (value === socket.id) onlineUsers.delete(key);
      });
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};
//send notification to the group of users based on their role
const sendNotificationToGroup = (room, event, data) => {
  //from the role of the user send only to the those online users
  
  io.to(room).emit(event, data);
  console.log(`Notification sent to room ${room}: ${event}`, data);
};
module.exports = {sendNotificationToGroup, initializeSocket, getIO, onlineUsers };
