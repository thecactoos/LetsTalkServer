const socketTypes = require("../../consts/socketTypes");
const User = require("../../models/User");

const sendAuthenticatedProfile = async (socket) => {
  const { userId } = socket;
  const user = await User.findById(userId).select("-password");
  socket.emit(socketTypes.GET_AUTHENTICATED_USER, {
    user,
  });
};

module.exports = function profile(socket) {
  socket.on(socketTypes.GET_USER_PROFILE, async (_, res) => {
    const { userId } = socket;
    try {
      const user = await User.findById(userId).select(["-password"]);
      res(user);
    } catch (error) {
      console.log(error);
      res(null, error);
    }
  });

  // @route GET_PROFILE_BY_ID
  // @desc Get profile of the user
  // @access private
  // @params payload = {
  //        userID: String ;
  //   }
  // @response Object user profile || Object representing error
  // @emit NO-EMIT
  socket.on(socketTypes.GET_PROFILE_BY_ID, async (payload, res) => {
    try {
      const user = await User.findById(payload).select([
        "-password",
        "-email",
        "-date",
      ]);
      res(user);
    } catch (error) {
      console.log(error);
      res(null, error);
    }
  });

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
