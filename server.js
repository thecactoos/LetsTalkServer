const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
// const socketIO = require('socket.io');

const connectDb = require('./config/db');
const serverIO = require('./serverIO/serverIO');

const app = express();

const server = http.createServer(app);

// Connect to database
connectDb();

// Determine PORT
const PORT = process.env.PORT || 8000;

// Determine enviroment
const isDevelopment =
  process.env.NODE_ENV && process.env.NODE_ENV === 'development';

// Init middlewares
app.use(
  cors({
    origin: isDevelopment ? process.env.ORIGIN_DEV : process.env.ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ extended: false }));
// Define router
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/conversation', require('./routes/api/conversation'));
app.use('/api/profile', require('./routes/api/profile'));

// Initiate socket server
const io = new Server(server, {
  path: '/api/socket',
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

serverIO(io);

app.set('socketio', io);

// Determine ip Adress
const ipAdress = isDevelopment ? 'localhost' : '0.0.0.0';

server.listen(PORT, ipAdress, () => {
  console.log(`Listening on Port ${PORT} on ${ipAdress}`);
});

app.get('/', (req, res) => res.send(`Api running${process.env.ORIGIN}`));
