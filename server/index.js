const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const io = require('socket.io');
let socketServer;

const PORT = 8080;

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/index.html'));
});

const server = app.listen(PORT);
console.log('Listening on port', PORT);
socketServer = io(server);

socketServer.on('connection', (socket) => {
  console.log('Socket connect', socket.id);
});
