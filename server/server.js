const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const rooms = {};

app.use(express.static(__dirname + "/build"));

io.on("connection", function (socket) {
  const roomId = socket.handshake.query.spaceId;
  socket.join(roomId);
  console.log(`(backend) user ${socket.id} connected`);

  // create a new player and add it to our players object
  if (rooms[roomId] === undefined) {
    rooms[roomId] = {
      [socket.id]: {
        rotation: 0,
        x: Math.floor(Math.random() * 100) + 50,
        y: Math.floor(Math.random() * 100) + 50,
        playerId: socket.id,
      },
    };
  } else {
    rooms[roomId][socket.id] = {
      rotation: 0,
      x: Math.floor(Math.random() * 100) + 50,
      y: Math.floor(Math.random() * 100) + 50,
      playerId: socket.id,
    };
  }

  const players = rooms[roomId];

  // send the players object to the new player
  socket.emit("currentPlayers", players);
  // update all other players of the new player
  socket.to(roomId).emit("newPlayer", players[socket.id]);

  socket.on("disconnect", function () {
    console.log(`(backend) user ${socket.id} disconnected`);

    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit("userDisconnected", socket.id);
  });

  // when a player moves, update the player data
  socket.on("playerMovement", function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    // emit a message to all players about the player that moved
    socket.to(roomId).emit("playerMoved", players[socket.id]);
  });

    // Video chat features
    // User attempts to join a room
    socket.on('join', function (roomName) {
      let rooms = io.sockets.adapter.rooms;
      let room = rooms.get(roomName);

      if (!room) {
        socket.join(roomName);
        socket.emit('created');
      } else if (room.size === 1) {
        //room.size === 1 when one person is inside the room.
        socket.join(roomName);
        socket.emit('joined');
      } else {
        //when there are already two people inside the room.
        socket.emit('full');
      }
    });

    //Triggered when the person who joined the room is ready to communicate.
    socket.on('ready', function (roomName) {
      socket.broadcast.to(roomName).emit('ready'); //Informs the other peer in the room.
    });

    //Triggered when server gets an icecandidate from a peer in the room.

    socket.on('candidate', function (candidate, roomName) {
      socket.broadcast.to(roomName).emit('candidate', candidate); //Sends Candidate to the other peer in the room.
    });

    //Triggered when server gets an offer from a peer in the room.

    socket.on('offer', function (offer, roomName) {
      socket.broadcast.to(roomName).emit('offer', offer); //Sends Offer to the other peer in the room.
    });

    //Triggered when server gets an answer from a peer in the room.

    socket.on('answer', function (answer, roomName) {
      socket.broadcast.to(roomName).emit('answer', answer); //Sends Answer to the other peer in the room.
    });
});



server.listen(3001, function () {
  console.log(`Listening on ${server.address().port}`);
});
