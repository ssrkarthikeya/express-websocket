const express = require("express");
const path = require("path");
const https = require("https");
const socketio = require("socket.io");
const fs = require("fs");

const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  getRoomUsers,
  userLeave,
} = require("./utils/users");

const PORT = 3443 || process.env.PORT;

const app = express();
const sslServer = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname,'cert/key.pem')),
    cert: fs.readFileSync(path.join(__dirname,'cert/cert.pem')),
  },
  app
);
const io = socketio(sslServer);

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //   welcome current user
    socket.emit("message", formatMessage("IceBot", "Welcome to the chat room"));

    //   Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("IceBot", `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //   runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("IceBot", `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// Set static folder path
app.use(express.static(path.join(__dirname, "public")));

sslServer.listen(PORT, () => {});
