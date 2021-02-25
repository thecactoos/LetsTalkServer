/* eslint-disable no-console */
const socketTypes = require("../../consts/socketTypes");
const Conversation = require("../../models/Conversation");
const { Message } = require("../../models/Message");

module.exports = function conversation(socket, io) {
  const { userId } = socket;
  const joinToConversation = async (socket) => {
    // Finding all conversation of the user
    const conversations = await Conversation.find({
      members: { $in: [userId] },
    });

    // Join to rooms, for each conversation there is created room
    if (conversations.length !== 0) {
      const conversationsIds = conversations.map(
        (conversation) => conversation._id
      );
      conversationsIds.forEach((convId) => socket.join(convId));
    }
  };
  joinToConversation(socket);

  // @route CREATE_CONVERSATION_REQUEST
  // @desc Creating new conversation
  // @access private
  // @params payload = {
  //   receiversIDs: Array of usersIDs
  //   msgContent: String, Content of message
  // }
  // @response Object representing new created conversation || Object representing error
  socket.on(socketTypes.CREATE_CONVERSATION_REQUEST, async (payload, res) => {
    console.log(payload);
    const { receiversIds, messageContent } = payload;

    if (receiversIds.length === 0 || messageContent.length === 0) {
      return res(null, { msg: "Wrong query" });
    }
    const membersIds = [...new Set([...receiversIds, userId])].sort();

    try {
      // Check if conversation already exists
      const conversation = await Conversation.findOne({
        members: {
          $eq: membersIds,
        },
      });
      if (conversation) {
        res(null, { msg: "Conversation already exists" });
      } else {
        // Create new Message
        const newMessage = new Message({
          sender: userId,
          content: messageContent,
        });

        // Create new Conversation
        const newConversation = new Conversation({
          members: membersIds,
          admin: membersIds,
          messages: [newMessage],
          lastMessageDate: newMessage.date,
        });
        // Save it to db
        await newConversation.save();

        // Get a list of all connected sockets
        const listOfSockets = Object.values(io.sockets.sockets);
        console.log(io);

        // Get a list of connected sockets related to the conversation
        const connectedSocketsToTheConversation = listOfSockets.filter(
          (socketItem2) => {
            return membersIds.includes(socketItem2.userId);
          }
        );

        // If there are any
        if (connectedSocketsToTheConversation.length !== 0) {
          connectedSocketsToTheConversation.forEach((socketItem) => {
            // Join to conversation
            socketItem.join(newConversation._id);
          });
        }
        const populatedConversation = await Conversation.findById(
          newConversation._id
        ).populate("members");

        console.log(populatedConversation);

        // Emit message to conversation room
        socket
          .to(populatedConversation._id)
          .emit(socketTypes.NEW_CONVERSATION, populatedConversation);
        res(populatedConversation, null);
      }
    } catch (error) {
      console.log(error);
      res(null, { msg: error });
    }
  });

  // @route GET_ALL_CONVERSATIONS_REQUEST
  // @desc Get all conversations related to logged users
  // @access private
  // @params There is no params
  // @response Array of all conversation related to user || Object representing error

  socket.on(socketTypes.GET_ALL_CONVERSATIONS_REQUEST, async (_, res) => {
    try {
      const conversations = await Conversation.find({
        members: { $in: [userId] },
      }).populate("members", "username avatar50x50");
      // .limit(10);
      res(conversations);
    } catch (error) {
      console.log(error);
      res(null, error);
    }
  });

  // @route GET_CONVERSATION_BY_ID_REQUEST
  // @desc Get conversation by given id
  // @access private
  // @params payload = {
  //   conversationId: String
  // }
  // @response Object representing conversation || Object representing error
  socket.on(socketTypes.GET_CONVERSATION_BY_ID, async (payload, res) => {
    const { conversationId } = payload;
    try {
      const conversation = await Conversation.findById(conversationId).populate(
        "members",
        "username"
      );
      if (!conversation) {
        throw new Error("There is no conversation with given id");
      }
      // Check user permisson
      if (!conversation.members.map((member) => member._id).includes(userId)) {
        throw new Error("No permisson");
      }
      res(conversation);
    } catch (error) {
      console.log(error);
      res(null, error);
    }
  });
};
