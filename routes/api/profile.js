const express = require("express");
const { updateAvatar } = require("../../controllers/Profile.controller");
const router = express.Router();

const auth = require("../../middleware/auth");
const uploadAvatarProfile = require("../../middleware/uploadAvatarProfile");

router.put("/", auth, uploadAvatarProfile, updateAvatar);

module.exports = router;
