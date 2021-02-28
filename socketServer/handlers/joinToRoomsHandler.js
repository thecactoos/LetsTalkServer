const Conversation = require('../../models/Conversation');

module.exports = async (socket) => {
  const { userId } = socket;
  // Find all conversation of the user
  const conversations = await Conversation.find({
    members: { $in: [userId] },
  });

  // Join to rooms, for each conversation there is created room
  if (conversations.length !== 0) {
    const conversationsIds = conversations.map(
      (conversation) => conversation._id,
    );
    conversationsIds.forEach((convId) => socket.join(convId));
  }
};
