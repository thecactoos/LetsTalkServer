const express = require('express');

const router = express.Router();
/* eslint-disable consistent-return */
const config = require('config');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3-transform');
const sharp = require('sharp');
const { v4: uuid } = require('uuid');

const User = require('../../models/User');
const auth = require('../../middleware/auth');

const convertArrayToObject = (array, key) => array.reduce((acc, item) => {
  acc[item[key]] = item;
  return acc;
}, {});

const s3 = new aws.S3({
  accessKeyId: config.get('s3accessKeyId'),
  secretAccessKey: config.get('s3secretAccessKey'),
  Bucket: config.get('s3Bucket'),
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: s3.config.Bucket,
    acl: 'public-read',
    shouldTransform(req, file, cb) {
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: 'avatarOriginal',
        key(req, file, cb) {
          cb(null, `${req.uniqueFilename}.webp`);
        },
        transform(req, file, cb) {
          cb(null, sharp({ failOnError: false }).rotate().webp());
        },
      },
      {
        id: 'avatar300x300',
        key(req, file, cb) {
          cb(null, `${req.uniqueFilename}300x300.webp`);
        },
        transform(req, file, cb) {
          cb(
            null,
            sharp({ failOnError: false }).rotate().resize(300, 300).webp(),
          );
        },
      },
      {
        id: 'avatar50x50',
        key(req, file, cb) {
          cb(null, `${req.uniqueFilename}50x50.webp`);
        },
        transform(req, file, cb) {
          cb(
            null,
            sharp({ failOnError: false }).rotate().resize(50, 50).webp(),
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

router.put('/', auth, upload.single('file'), async (req, res) => {
  let avatars = null;
  const { userId } = req;
  console.log(userId);
  try {
    if (req?.file?.transforms) {
      avatars = convertArrayToObject(
        req.file.transforms.map((avatar) => ({
          id: avatar.id,
          url: avatar.location,
        })),
        'id',
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
      throw new Error('Sth went wrong');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
});

const upload2 = multer({
  storage: multerS3({
    s3,
    bucket: s3.config.Bucket,
    acl: 'public-read',
    shouldTransform(req, file, cb) {
      cb(null, /^image/i.test(file.mimetype));
    },
    transforms: [
      {
        id: 'avatarOriginal',
        key(req, file, cb) {
          cb(null, `${req.uniqueFilename}.webp`);
        },
        transform(req, file, cb) {
          cb(null, sharp({ failOnError: false }).rotate().webp());
        },
      },
      {
        id: 'avatar300x300',
        key(req, file, cb) {
          cb(null, `${req.uniqueFilename}300x300.webp`);
        },
        transform(req, file, cb) {
          cb(
            null,
            sharp({ failOnError: false }).rotate().resize(300, 300).webp(),
          );
        },
      },
      {
        id: 'avatar50x50',
        key(req, file, cb) {
          cb(null, `${req.uniqueFilename}50x50.webp`);
        },
        transform(req, file, cb) {
          cb(
            null,
            sharp({ failOnError: false }).rotate().resize(50, 50).webp(),
          );
        },
      },
    ],
  }),
  fileFilter: function fileFilter(req, file, cb) {
    req.uniqueFilename = 'default';
    cb(null, true);
  },
});

router.put('/nana', upload2.single('file'), async (req, res) => {
  let avatars = null;
  const { userId } = req;
  console.log(userId);
  try {
    if (req?.file?.transforms) {
      avatars = convertArrayToObject(
        req.file.transforms.map((avatar) => ({
          id: avatar.id,
          url: avatar.location,
        })),
        'id',
      );
      console.log(avatars);
      res.json({
        avatars,
      });
    } else {
      throw new Error('Sth went wrong');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
