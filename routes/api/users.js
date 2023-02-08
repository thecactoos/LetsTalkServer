/* eslint-disable consistent-return */
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const isDevelopment =
  process.env.NODE_ENV && process.env.NODE_ENV === "development";

const router = express.Router();
const User = require("../../models/User");

// @route POST api/users
// @desc Register user
// @access public

router.post(
  "/",
  [
    check("username", "Username is required").not().isEmpty(),
    check("email", "Please include a vaild email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    try {
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
        if (user.email === email) {
          return res
            .status(400)
            .json({ errors: [{ msg: "User with this email already exists" }] });
        }
        if (user.username === username) {
          return res.status(400).json({
            errors: [{ msg: "User with this username already exists" }],
          });
        }
      }

      user = new User({
        username,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      // Create token
      const token = jwt.sign(payload, process.env.AUTH_MAIN_SECRET, {
        expiresIn: "7d",
      });

      return res
        .cookie("letstalk_authMain", token, {
          secure: !isDevelopment,
          maxAge: 10000000,
          httpOnly: true,
          sameSite: isDevelopment ? false : "None",
        })
        .send();
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
