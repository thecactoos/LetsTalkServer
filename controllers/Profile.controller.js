const User = require("../models/User");
const convertArrayToObject = require("../utils/convertArrayToObject");

// @desc Update avatar
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
      await User.findOneAndUpdate(userId, {
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
