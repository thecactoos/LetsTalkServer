const User = require("../models/User");
const convertArrayToObject = require("../utils/convertArrayToObject");

// @middlewares before controller action there are 2 middlewares:
// * auth (Checking authentication)
// * uploadAvatarProfile (upload image to s3, and add rest of properties to req)
// @params req - formData with structure {
//    file: avatar(image)
// }
// @response Object representing avatars || Object representing error

module.exports.updateAvatar = async (req, res) => {
  const { userId } = req;
  try {
    if (req?.file?.transforms) {
      const avatars = convertArrayToObject(
        req.file.transforms.map((avatar) => ({
          id: avatar.id,
          url: avatar.location,
        })),
        "id"
      );
      await User.findByIdAndUpdate(userId, {
        avatar50x50: avatars.avatar50x50.url,
        avatar300x300: avatars.avatar300x300.url,
        avatarOriginal: avatars.avatarOriginal.url,
      });
      res.json({
        avatars,
      });
    } else {
      throw new Error("Sth went wrong");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

// @params payload: String respresenting userId
// @response Callback function which takes two parameters
// (Object representing profile, Object representing error)
// @emit NO-EMIT
module.exports.getProfileById = async (payload, res) => {
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
};

// @params payload: String representing new bio
// @response Callback function which takes two parameters
// (Object representing updated profile, Object representing error)
// @emit NO-EMIT
module.exports.updateBio = (socket) => async (payload, res) => {
  const { userId } = socket;
  try {
    const user = await User.findByIdAndUpdate(userId, {
      bio: payload,
    });
    res(user);
  } catch (error) {
    console.log(error);
    res(null, error);
  }
};

// @params payload: String representing new username
// @response Callback function which takes two parameters
// (Object representing updated profile, Object representing error)
// @emit NO-EMIT
module.exports.updateUsername = (socket) => async (payload, res) => {
  const { userId } = socket;
  console.log("USER IDDDDDDDDD", userId);
  try {
    const user = await User.findByIdAndUpdate(userId, {
      username: payload,
    });
    res(user);
  } catch (error) {
    console.log(error);
    res(null, error);
  }
};

// @params payload: String representing search value
// @response Callback function which takes two parameters
// (Array representing found users, Object representing error)
// @emit NO-EMIT

module.exports.getUsersByString = async (payload, cb) => {
  try {
    const users = await User.find({
      username: { $regex: payload, $options: "i" },
    }).select(["-password", "-email", "-date"]);
    console.log(users);
    if (users) cb(users);
  } catch (error) {
    cb(null, error);
  }
};
