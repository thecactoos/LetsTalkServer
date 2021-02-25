/* eslint-disable consistent-return */
const express = require("express");
const router = express.Router();
const aws = require("aws-sdk");
const config = require("config");
const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const sharp = require("sharp");
const { v4: uuid } = require("uuid");
const auth = require("../../middleware/auth");
const socketTypes = require("../../consts/socketTypes");

const Conversation = require("../../models/Conversation");

const joinSocketsToConversationRoom = (io, membersIds, conversationId) => {
  const listOfSockets = Object.values(io.sockets.sockets);

  // Get a list of connected sockets related to the conversation
  const connectedSocketsToTheConversation = listOfSockets.filter((socket) => {
    return membersIds.includes(socket.userId);
  });

  // If there are any
  if (connectedSocketsToTheConversation.length !== 0) {
    connectedSocketsToTheConversation.forEach((socket) => {
      // Join socket to conversation
      socket.join(conversationId);
    });
  }
};

const convertArrayToObject = (array, key) =>
  array.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});

const s3 = new aws.S3({
  accessKeyId: config.get("s3accessKeyId"),
  secretAccessKey: config.get("s3secretAccessKey"),
  Bucket: config.get("s3Bucket"),
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: s3.config.Bucket,
    acl: "public-read",
    shouldTransform: function (req, file, cb) {
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: "avatarOriginal",
        key: function (req, file, cb) {
          cb(null, `${req.uniqueFilename}.webp`);
        },
        transform: function (req, file, cb) {
          cb(null, sharp({ failOnError: false }).rotate().webp());
        },
      },
      {
        id: "avatar300x300",
        key: function (req, file, cb) {
          cb(null, `${req.uniqueFilename}300x300.webp`);
        },
        transform: function (req, file, cb) {
          cb(
            null,
            sharp({ failOnError: false }).rotate().resize(300, 300).webp()
          );
        },
      },
      {
        id: "avatar50x50",
        key: function (req, file, cb) {
          cb(null, `${req.uniqueFilename}50x50.webp`);
        },
        transform: function (req, file, cb) {
          cb(
            null,
            sharp({ failOnError: false }).rotate().resize(50, 50).webp()
          );
        },
      },
    ],
  }),
  // Check before upload
  fileFilter: function fileFilter(req, file, cb) {
    const { receivers: receiversString } = req.body;
    const receivers = JSON.parse(receiversString);
    req.uniqueFilename = uuid();
    if (receivers && receivers.length === 0) {
      return cb(new Error(`You didn't set receivers`), false);
    }
    cb(null, true);
  },
});

router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    let avatars = null;
    if (req?.file?.transforms) {
      avatars = convertArrayToObject(
        req.file.transforms.map((avatar) => ({
          id: avatar.id,
          url: avatar.location,
        })),
        "id"
      );
    }

    const { receivers: receiversString, chatName, socketId } = req.body;

    const receiversIds = JSON.parse(receiversString);

    const { userId } = req;

    // Check ReceiversIds
    if (receiversIds.length === 0) {
      throw new Error(`You didn't set receivers`);
    }

    // Create membersIds
    const membersIds = [...new Set([...receiversIds, userId])].sort();

    let newConversation;

    if (avatars) {
      newConversation = new Conversation({
        members: membersIds,
        admin: membersIds,
        chatName,
        isGroup: true,
        avatarOriginal: avatars.avatarOriginal.url,
        avatar50x50: avatars.avatar50x50.url,
        avatar300x300: avatars.avatar300x300.url,
      });
    } else {
      newConversation = new Conversation({
        isGroup: true,
        members: membersIds,
        admin: membersIds,
        chatName,
      });
    }

    await newConversation.save();

    const io = req.app.get("socketio");

    joinSocketsToConversationRoom(io, membersIds, newConversation._id);

    const populatedConversation = await Conversation.findById(
      newConversation._id
    ).populate("members", "username");

    const socket = io.sockets.sockets[socketId];

    socket
      .to(newConversation._id)
      .emit(socketTypes.NEW_CONVERSATION, populatedConversation);

    res.json(populatedConversation);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
