const socketActionTypes = require("../../consts/socketTypes");
const { getUsersByString } = require("../../controllers/Profile.controller");

module.exports = function searchUserByString(socket) {
  // @route SEARCH_USER_BY_USERNAME
  // @desc Get user matching to given string
  // @params payload: String representing search value
  // @response Callback function which takes two parameters
  // (Array representing found users, Object representing error)
  // @emit NO-EMIT

  socket.on(socketActionTypes.SEARCH_USER_BY_USERNAME, getUsersByString);
};
