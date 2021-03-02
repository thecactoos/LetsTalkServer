const Conversation = require("../models/Conversation");
const { Message } = require("../models/Message");
const socketTypes = require("../consts/socketTypes.js");
const convertArrayToObject = require("../utils/convertArrayToObject");
const joinSocketsToConversationRoom = require("../utils/joinSocketsToConversationRoom");

// @desc Get all conversations related to logged user
// @access private
// @params There is no params
// @response Callback function which takes two parameters
// (Array of all conversations related to user, Object representing error)

module.exports.getAllConversations = (socket) => async (_, res) => {
  const { userId } = socket;
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
};

// @desc Get conversation by given id
// @params payload = {
//   conversationId: String
// }
// @response Callback function which takes two parameters
// (Object representing conversation , Object representing error)

module.exports.getConversationById = (socket) => async (payload, res) => {
  const { userId } = socket;
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
};

// @desc Creating new conversation DM
// @params payload = {
//   receiversIDs: Array of usersIDs
//   msgContent: String, Content of message
// }
// @response Object representing new created conversation || Object representing error

module.exports.createDirectConversation = (socket, io) => async (
  payload,
  res
) => {
  const { userId } = socket;
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
        admins: membersIds,
        messages: [newMessage],
        lastMessageDate: newMessage.date,
      });
      // Save it to db
      await newConversation.save();

      // Get a list of all connected sockets
      const listOfSockets = Object.values(io.sockets.sockets);

      // Get a list of connected sockets related to the conversation
      const connectedSocketsToTheConversation = listOfSockets.filter(
        (currentSocket) => membersIds.includes(currentSocket.userId)
      );

      // If there are any
      if (connectedSocketsToTheConversation.length !== 0) {
        connectedSocketsToTheConversation.forEach((currentSocket) => {
          // Join to conversation
          currentSocket.join(newConversation._id);
        });
      }
      const populatedConversation = await Conversation.findById(
        newConversation._id
      ).populate("members");

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
};

module.exports.joinToConversationRooms = async (socket) => {
  const { userId } = socket;
  // Find all conversation of the user
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

// @desc Creating new conversation Group with avatar
// @middlewares before controller action there are 2 middlewares:
// * auth (Checking authentication)
// * uploadAvatarGroup (upload image to s3, and add rest of properties to req)
// @params req - formData with structure {
//    receivers: receiversIds as a string,
//    chatName: string
//    file: avatar(image)
//    socketId: string representing from which socket is request
// }
// @response Object representing new created conversation || Object representing error

module.exports.createNewConversationGroup = async (req, res) => {
  try {
    let avatars = null;
    if (req?.file?.transforms) {
      avatars = convertArrayToObject(
        req.file.transforms.map((avatar) => ({
          id: avatar.id,
          url: avatar.location,
        })),
        "id"
      );
    }

    const { receivers: receiversString, chatName, socketId } = req.body;

    const receiversIds = JSON.parse(receiversString);

    const { userId } = req;

    // Check ReceiversIds
    if (receiversIds.length === 0) {
      throw new Error("You didn't set receivers");
    }

    // Create membersIds
    const membersIds = [...new Set([...receiversIds, userId])].sort();

    let newConversation;

    if (avatars) {
      newConversation = new Conversation({
        members: membersIds,
        admins: membersIds,
        chatName,
        isGroup: true,
        avatarOriginal: avatars.avatarOriginal.url,
        avatar50x50: avatars.avatar50x50.url,
        avatar300x300: avatars.avatar300x300.url,
      });
    } else {
      newConversation = new Conversation({
        isGroup: true,
        members: membersIds,
        admins: membersIds,
        chatName,
      });
    }

    await newConversation.save();

    const io = req.app.get("socketio");

    joinSocketsToConversationRoom(io, membersIds, newConversation._id);

    const populatedConversation = await Conversation.findById(
      newConversation._id
    ).populate("members", "username");

    const socket = io.sockets.sockets[socketId];

    socket
      .to(newConversation._id)
      .emit(socketTypes.NEW_CONVERSATION, populatedConversation);

    res.json(populatedConversation);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
};
