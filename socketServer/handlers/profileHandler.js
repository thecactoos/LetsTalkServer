const socketTypes = require("../../consts/socketTypes");
const {
  getProfileById,
  updateBio,
  updateUsername,
} = require("../../controllers/Profile.controller");

module.exports = (socket) => {
  socket.on(socketTypes.GET_PROFILE_BY_ID, getProfileById);
  socket.on(socketTypes.UPDATE_BIO, updateBio(socket));
  socket.on(socketTypes.UPDATE_USERNAME, updateUsername(socket));
};
