module.exports = joinSocketsToConversationRoom = (
  io,
  membersIds,
  conversationId
) => {
  const listOfSockets = Object.values(io.sockets.sockets);

  // Get a list of connected sockets related to the conversation
  const connectedSocketsToTheConversation = listOfSockets.filter((socket) =>
    membersIds.includes(socket.userId)
  );

  // If there are any
  if (connectedSocketsToTheConversation.length !== 0) {
    connectedSocketsToTheConversation.forEach((socket) => {
      // Join socket to conversation
      socket.join(conversationId);
    });
  }
};
