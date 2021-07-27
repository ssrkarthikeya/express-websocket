const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  //   welcome current user
  socket.emit("message", "welcome to chat rool");

  //   Broadcast when a user connects
  socket.broadcast.emit("message", "A user has joined the chat");

  //   runs when client disconnects
  socket.on("disconnect", () => {
    io.emit("message", "A user has left the chat");
  });

  socket.on("chatMessage", (msg) => {
    io.emit("message",msg);
  })
});

// Set static folder path
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
