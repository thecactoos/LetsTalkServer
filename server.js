const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketIO = require("socket.io");

const connectDb = require("./config/db");
const socketServer = require("./socket");

const app = express();

const server = http.createServer(app);

// Connect to database
connectDb();

const PORT = process.env.PORT || 8000;

// Init middlewares
app.use(
  cors({
    origin: `http://localhost:${PORT}`,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ extended: false }));
// Define router
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/conversation", require("./routes/api/conversation"));
app.use("/api/profile", require("./routes/api/profile"));

// Initiate socket server
const io = socketIO(server, {
  path: "/socket",
  origins: "*:*",
  forceNew: "true",
});
socketServer(io);

app.set("socketio", io);

server.listen(PORT, "localhost", () => {
  console.log(`Listening on Port ${PORT}`);
});

app.get("/", (req, res) => res.send("Api running"));
