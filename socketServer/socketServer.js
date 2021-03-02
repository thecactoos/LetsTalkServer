const authenticationHandler = require("./handlers/authenticationHandler");
const messageHandler = require("./handlers/messageHandler");
const conversationHandler = require("./handlers/conversationHandler");
const searchUserByStringHandler = require("./handlers/searchUserByStringHandler");
const profileHandler = require("./handlers/profileHandler");

const socket = (io) => {
  // All socket actions have private access
  authenticationHandler(io);
  io.on("connection", (socket) => {
    const { userId } = socket;

    console.log(`Connected to userId: ${userId} socket: ${socket.id}`);
    messageHandler(socket);
    profileHandler(socket);
    searchUserByStringHandler(socket);
    conversationHandler(socket, io);

    socket.on("disconnect", () => {
      console.log("User disconnect");
    });
  });
};

module.exports = socket;
