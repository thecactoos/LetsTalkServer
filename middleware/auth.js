const jwt = require("jsonwebtoken");
const config = require("config");

function auth(req, res, next) {
  // Get token from header
  const token = req.cookies?.letstalk_authMain;

  // Check if token exists
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get("auth_main_secret"));

    req.userId = decoded.user.id;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ msg: "Token is not valid" });
  }

  return null;
}

module.exports = auth;
