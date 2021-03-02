const express = require("express");
const router = express.Router();
const {
  createNewConversationGroup,
} = require("../../controllers/Conversation.controller");
const auth = require("../../middleware/auth");
const uploadAvatarGroup = require("../../middleware/uploadAvatarGroup");

router.post("/", auth, uploadAvatarGroup, createNewConversationGroup);

module.exports = router;
