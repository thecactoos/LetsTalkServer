const socketTypes = require("../../consts/socketTypes");

const {
  getAllConversations,
  getConversationById,
  createDirectConversation,
  joinToConversationRooms,
  addMessageToConversation,
  getUsersByString,
} = require("../../controllers/Conversation.controller");

module.exports = function conversation(socket, io) {
  joinToConversationRooms(socket);
  socket.on(
    socketTypes.CREATE_CONVERSATION_REQUEST,
    createDirectConversation(socket, io)
  );
  socket.on(
    socketTypes.GET_ALL_CONVERSATIONS_REQUEST,
    getAllConversations(socket)
  );
  socket.on(socketTypes.GET_CONVERSATION_BY_ID, getConversationById(socket));
  socket.on(socketTypes.SEND_MESSAGE, addMessageToConversation(socket));
};
