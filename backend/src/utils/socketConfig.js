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

    // User authentication middleware
    socket.use(([event, ...args], next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Unauthorized"));
      next();
    });

    // Handle user online status
    socket.on("userOnline", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId); // Join user's personal room
      console.log(`User ${userId} is online`);
    });

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

module.exports = { initializeSocket, getIO, onlineUsers };
