const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

// get username and room
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on("message", (message) => {
  outputMessage(message);
  // Scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// message submitter
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  // Emit to server
  socket.emit("chatMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const { userName, text, time } = message;
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
  <p class="meta">${userName}<span>&nbsp;${time}</span></p>
  <p class="text">
    ${text}
</p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = `${users.map((user) =>`<li>${user.username}</li>`).join("")}`;
}
