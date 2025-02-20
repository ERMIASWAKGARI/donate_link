const {Server} =require("socket.io");
const onlineUsers = new Map();
let io
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

    socket.on("join room", ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`${userId} joined room ${roomId}`);
    });
    socket.on("send message", async (data) => {
      try {
        const { senderId, receiverId, message, roomId } = data;
        if (result) {
          io.to(roomId).emit("receive message", data);
        }
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("new comment", (data) => {
      console.log(data);
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

module.exports= { initializeSocket, getIO, onlineUsers };
