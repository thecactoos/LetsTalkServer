const jwt = require("jsonwebtoken");
const config = require("config");

const convertCookiesStringToObject = (cookiesString) => {
  return Object.fromEntries(
    cookiesString.split("; ").map((cookie) => {
      const [key, ...value] = cookie.split("=");
      return [key, value.join("=")];
    })
  );
};

module.exports = function auth(io) {
  io.use((socket, next) => {
    try {
      const { letstalk_authMain: token } = convertCookiesStringToObject(
        socket.handshake.headers.cookie
      );

      if (!token) {
        throw new Error("Authentication error");
      }
      const decoded = jwt.verify(token, config.get("auth_main_secret"));
      // eslint-disable-next-line no-param-reassign
      socket.userId = decoded.user.id;
      next();
    } catch (error) {
      console.log(error);
      next(new Error("Authentication error"));
    }
  });
};
