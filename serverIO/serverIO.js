const auth = require("./middlewares/auth");
const conversationHandler = require("./handlers/conversationHandler");
const profileHandler = require("./handlers/profileHandler");

const socket = (io) => {
  // All socket actions have private access
  auth(io);

  io.on("connection", (socket) => {
    const { userId } = socket;
    console.log(`Connected to userId: ${userId} socket: ${socket.id}`);

    profileHandler(socket);
    conversationHandler(socket, io);

    socket.on("disconnect", () => {
      console.log(`User disconnect ${userId}`);
    });
  });
};

module.exports = socket;
