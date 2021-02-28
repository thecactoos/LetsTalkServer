const socketTypes = require('../../consts/socketTypes');
const Conversation = require('../../models/Conversation');
const { Message } = require('../../models/Message');

module.exports = (socket) => {
  const { userId } = socket;

  // @route SEND_MESSAGE_REQUEST
  // @desc Send message to participants of conversation
  // @params payload = {
  //   conversationId: String,
  //   messagContent: String representing content of the message
  // }
  // @response Callback function which takes two parameters
  // (Object representing newly created message, Object representing error)
  // @emit Object = {
  //   newMessage: Object representing newly created message,
  //   conversationID: String
  // }
  socket.on(socketTypes.SEND_MESSAGE, async (payload, res) => {
    try {
      const { conversationId, messageContent } = payload;
      // Validate payload
      if (!(conversationId && messageContent)) {
        throw new Error('Wrong query');
      }
      // Find conversation with given conversationId
      const conversation = await Conversation.findById(conversationId);
      // If there is no any, Throw an error
      if (!conversation) {
        throw new Error('There is no conversation with given id');
      }
      // Check user permisson
      if (!conversation.members.includes(userId)) {
        throw new Error('No permisson');
      }
      // Create new message
      const newMessage = new Message({
        sender: userId,
        content: messageContent,
      });
      // Update conversation in db
      await conversation.updateOne({
        $push: { messages: newMessage },
        lastMessageDate: newMessage.date,
      });

      // Emit message to users
      socket
        .to(conversationId)
        .emit(socketTypes.RECEIVE_MESSAGE, { newMessage, conversationId });
      res(newMessage);
    } catch (error) {
      console.log(error);
      res(null, error);
    }
  });
};
