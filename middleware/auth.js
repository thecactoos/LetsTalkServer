const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  // Get token from header
  const token = req.cookies?.letstalk_authMain;

  // Check if token exists
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  console.log(process.env.AUTH_MAIN_SECRET);
  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.AUTH_MAIN_SECRET);

    req.userId = decoded.user.id;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ msg: "Token is not valid" });
  }

  return null;
}

module.exports = auth;
