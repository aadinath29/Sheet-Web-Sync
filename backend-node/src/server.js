const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { PORT } = require('./config/env');
const apiRoutes = require('./routes/apiRoutes');
const socketService = require('./services/socketService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/', apiRoutes);

socketService.init(io);

server.listen(PORT, () => {
  console.log(`Node.js REST API & WebSocket server running on port ${PORT}`);
});
