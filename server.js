const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const socketIO = require('socket.io');

const connectDb = require('./config/db');
const serverIO = require('./serverIO/serverIO');

const app = express();

const server = http.createServer(app);

// Connect to database
connectDb();

const PORT = process.env.PORT || 8000;

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
const io = socketIO(server, {
  path: '/socket',
  origins: '**',
});
serverIO(io);

app.set('socketio', io);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on Port ${PORT}`);
});

app.get('/', (req, res) => res.send(`Api running${process.env.ORIGIN}`));
