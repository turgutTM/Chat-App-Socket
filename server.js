const express = require("express");
const http = require("http");
const next = require("next");
const socketIo = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = socketIo(httpServer);

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

    socket.on("send_message", (message) => {
      console.log("Send message event received:", message);
      io.emit("receive_message", message);

      io.emit("receive_message_time", {
        friendId: message.receiverId,
        messageTime: message.messageTime,
      });
    });

    socket.on("send_message_time", (messageTime) => {
      console.log("Send message time event received:", messageTime);
      io.emit("receive_message_time", messageTime);
    });
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
