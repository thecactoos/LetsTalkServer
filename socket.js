const auth = require("./routes/socket/auth");
const searchByUsername = require("./routes/socket/searchByUsername");
const conversation = require("./routes/socket/conversation");
const profile = require("./routes/socket/profile");
const message = require("./routes/socket/message");

const socket = (io) => {
  auth(io);

  io.on("connection", async (socket) => {
    const { userId } = socket;
    console.log(userId);

    console.log(`Connected to userId: ${userId} socket: ${socket.id}`);

    profile(socket);
    conversation(socket, io);
    searchByUsername(socket);
    message(socket);

    socket.on("disconnect", () => {
      console.log(`User disconnect`);
    });
  });
};

module.exports = socket;
