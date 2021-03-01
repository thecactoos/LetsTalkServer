const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const User = require("../../models/User");

const isDevelopment =
  process.env.NODE_ENV && process.env.NODE_ENV === "development";

// @route GET api/auth
// @desc Get registered user
// @access Public

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route POST api/users
// @desc Authenticate user & get token
// @access Public

router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if the user exists
      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.AUTH_MAIN_SECRET,
        { expiresIn: "5 days" },
        (err, token) => {
          if (err) throw err;
          return res
            .cookie("letstalk_authMain", token, {
              // Disabled for development
              secure: !isDevelopment,
              maxAge: 10000000,
              httpOnly: true,
              sameSite: isDevelopment ? false : "None",
            })
            .json();
        }
      );
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server error");
    }
    return null;
  }
);

router.put("/", auth, (req, res) => {
  res
    .clearCookie("letstalk_authMain", {
      sameSite: isDevelopment ? false : "None",
      secure: !isDevelopment,
    })
    .json();
});

module.exports = router;
