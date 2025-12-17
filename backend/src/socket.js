const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a specific post room for targeted updates
    socket.on("join-post", (postId) => {
      socket.join(`post-${postId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined post-${postId}`);
    });

    // Leave a specific post room
    socket.on("leave-post", (postId) => {
      socket.leave(`post-${postId}`);
      console.log(`[Socket.IO] Client ${socket.id} left post-${postId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

module.exports = { initSocket, getIO };

