const socketTypes = require('../../consts/socketTypes');
const User = require('../../models/User');

module.exports = (socket) => {
  socket.on(socketTypes.GET_USER_PROFILE, async (_, res) => {
    const { userId } = socket;
    try {
      const user = await User.findById(userId).select(['-password']);
      res(user);
    } catch (error) {
      console.log(error);
      res(null, error);
    }
  });

  // @route GET_PROFILE_BY_ID
  // @desc Get profile of the user by given id
  // @params payload = {
  //        userID: String ;
  //   }
  // @response Callback function which takes two parameters
  // (Object representing profile, Object representing error)
  // @emit NO-EMIT
  socket.on(socketTypes.GET_PROFILE_BY_ID, async (payload, res) => {
    try {
      const user = await User.findById(payload).select([
        '-password',
        '-email',
        '-date',
      ]);
      res(user);
    } catch (error) {
      console.log(error);
      res(null, error);
    }
  });

  // @route UPDATE_BIO
  // @desc Update bio
  // @params payload: String representing new bio
  // @response Callback function which takes two parameters
  // (Object representing updated profile, Object representing error)
  // @emit NO-EMIT
  socket.on(socketTypes.UPDATE_BIO, async (payload, res) => {
    const { userId } = socket;
    try {
      const user = await User.findOneAndUpdate(userId, {
        bio: payload,
      });
      res(user);
    } catch (error) {
      console.log(error);
      res(null, error);
    }
  });

  // @route UPDATE_USERNAME
  // @desc Update username
  // @params payload: String representing new username
  // @response Callback function which takes two parameters
  // (Object representing updated profile, Object representing error)
  // @emit NO-EMIT
  socket.on(socketTypes.UPDATE_USERNAME, async (payload, res) => {
    const { userId } = socket;
    try {
      const user = await User.findOneAndUpdate(userId, {
        username: payload,
      });
      res(user);
    } catch (error) {
      console.log(error);
      res(null, error);
    }
  });
};
