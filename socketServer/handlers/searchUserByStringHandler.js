const User = require('../../models/User');
const socketActionTypes = require('../../consts/socketTypes');

module.exports = function searchUserByString(socket) {
  // @route SEARCH_USER_BY_USERNAME
  // @desc Get user matching to given string
  // @params payload: String representing search value
  // @response Callback function which takes two parameters
  // (Array representing found users, Object representing error)
  // @emit NO-EMIT

  socket.on(socketActionTypes.SEARCH_USER_BY_USERNAME, async (payload, cb) => {
    try {
      const users = await User.find({
        username: { $regex: payload, $options: 'i' },
      }).select(['-password', '-email', '-date']);
      console.log(users);
      if (users) cb(users);
    } catch (error) {
      cb(null, error);
    }
  });
};
