const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  bio: {
    type: String,
  },
  avatar50x50: {
    type: String,
    default: "https://lets-talk-bucket.s3.amazonaws.com/default50x50.webp",
  },
  avatar300x300: {
    type: String,
    default: "https://lets-talk-bucket.s3.amazonaws.com/default300x300.webp",
  },
  avatarOriginal: {
    type: String,
    default: "https://lets-talk-bucket.s3.amazonaws.com/default.webp",
  },
  bio: {
    type: String,
    default: "No description",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("user", UserSchema);
