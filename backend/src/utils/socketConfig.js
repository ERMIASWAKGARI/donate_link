const { Server } = require("socket.io");
const onlineUsers = new Map();
let io;
const initializeSocket = (server) => {
  io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });
  // io.onlineUsers = onlineUsers;
  io.on("connection", (socket) => {
    console.log("user connected");
    socket.on("userOnline", (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
      onlineUsers.forEach((value, key) => {
        if (value === socket.id) {
          onlineUsers.delete(key);
        }
      });
    });
  });
};

const getIO = () => io;

module.exports = { initializeSocket, getIO, onlineUsers };
