const jwt = require("jsonwebtoken");
const { InvalidCredentials } = require("../../errors");

const convertCookiesStringToObject = (cookiesString) =>
  Object.fromEntries(
    cookiesString.split("; ").map((cookie) => {
      const [key, ...value] = cookie.split("=");
      return [key, value.join("=")];
    })
  );

module.exports = (io) => {
  io.use((socket, next) => {
    try {
      // Get authentication token from cookies
      const { letstalk_authMain: token } = convertCookiesStringToObject(
        socket.handshake.headers.cookie
      );

      if (!token) {
        throw new InvalidCredentials("Invalid credentials");
      }

      const decoded = jwt.verify(token, process.env.AUTH_MAIN_SECRET);

      // Assing param userId to socket instance
      // eslint-disable-next-line no-param-reassign
      socket.userId = decoded.user.id;
      next();
    } catch (error) {
      console.log(error);
      if (error.name === "JsonWebTokenError") {
        const WebTokenError = InvalidCredentials("Invalid credentials");
        return next(WebTokenError);
      }
      next(error);
    }
  });
};
