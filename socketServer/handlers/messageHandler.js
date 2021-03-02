const socketTypes = require("../../consts/socketTypes");
const {
  addMessageToConversation,
} = require("../../controllers/Conversation.controller");

module.exports = (socket) => {
  socket.on(socketTypes.SEND_MESSAGE, addMessageToConversation(socket));
};
