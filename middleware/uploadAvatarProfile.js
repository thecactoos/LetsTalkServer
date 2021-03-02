const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3-transform");
const sharp = require("sharp");
const { v4: uuid } = require("uuid");

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  Bucket: process.env.S3_BUCKET,
});

const uploadAvatarProfile = multer({
  storage: multerS3({
    s3,
    bucket: s3.config.Bucket,
    acl: "public-read",
    shouldTransform(req, file, cb) {
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: "avatarOriginal",
        key(req, file, cb) {
          cb(null, `${req.uniqueFilename}.webp`);
        },
        transform(req, file, cb) {
          cb(null, sharp({ failOnError: false }).rotate().webp());
        },
      },
      {
        id: "avatar300x300",
        key(req, file, cb) {
          cb(null, `${req.uniqueFilename}300x300.webp`);
        },
        transform(req, file, cb) {
          cb(
            null,
            sharp({ failOnError: false }).rotate().resize(300, 300).webp()
          );
        },
      },
      {
        id: "avatar50x50",
        key(req, file, cb) {
          cb(null, `${req.uniqueFilename}50x50.webp`);
        },
        transform(req, file, cb) {
          cb(
            null,
            sharp({ failOnError: false }).rotate().resize(50, 50).webp()
          );
        },
      },
    ],
  }),
  fileFilter: function fileFilter(req, file, cb) {
    req.uniqueFilename = uuid();
    cb(null, true);
  },
});

module.exports = uploadAvatarProfile.single("file");
