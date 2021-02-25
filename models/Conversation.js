const mongoose = require("mongoose");
const { MessageSchema } = require("./Message");

const ConversationSchema = new mongoose.Schema({
  members: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    validate: (v) => Array.isArray(v) && v.length > 0,
  },
  members: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    validate: (v) => Array.isArray(v) && v.length > 0,
  },
  messages: [MessageSchema],
  lastMessageDate: {
    type: Date,
    default: Date.now,
  },
  chatName: {
    type: String,
  },
  avatar50x50: {
    type: String,
    default: "https://lets-talk-bucket.s3.amazonaws.com/defaultGroup50x50.webp",
  },
  avatar300x300: {
    type: String,
    default:
      "https://lets-talk-bucket.s3.amazonaws.com/defaultGroup300x300.webp",
  },
  avatarOriginal: {
    type: String,
    default: "https://lets-talk-bucket.s3.amazonaws.com/defaultGroup.webp",
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("conversation", ConversationSchema);
