const User = require("../../models/User");
const socketActionTypes = require("../../consts/socketTypes");

module.exports = function searchByUsername(socket) {
  socket.on(socketActionTypes.SEARCH_USER_BY_USERNAME, async (payload, cb) => {
    try {
      const users = await User.find({
        username: { $regex: `${payload}`, $options: "i" },
      }).select(["-password", "-email", "-date"]);
      if (users) cb(users);
    } catch (error) {
      cb(null, error);
    }
  });
};
