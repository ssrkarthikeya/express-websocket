const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  getRoomUsers,
  userLeave,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

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

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


