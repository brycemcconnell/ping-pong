const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const random = (max, min) => {
  if (min == undefined) min = 0
  return Math.round(Math.random() * (max - min) + min);
};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static('public'));

const players = {};

const canvas = {
  canvasW: 400,
  canvasH: 400
}

io.on('connection', function(socket){
  socket.emit('init', canvas);
  players[socket.id] = {};
  players[socket.id].x = random(380);
  players[socket.id].y = random(380);
  players[socket.id].left = false;
  players[socket.id].right = false;
  players[socket.id].up = false;
  players[socket.id].down = false;
  players[socket.id].velX = 0;
  players[socket.id].velY = 0;
  players[socket.id].c = `hsl(${random(360)}, 100%, 50%)`;
  console.log(`${socket.id} joined the game.`);
  io.emit('setPlayerList', players);
  socket.on('disconnect', function(){
    console.log(`${socket.id} left the game.`);
    delete players[socket.id];
    io.emit('setPlayerList', players);
  });

  socket.on('moveClient', function(data){
    // players[socket.id].velX = data == "ArrowLeft" ? -6 : 6;
    switch (data) {
      case "ArrowLeft":
      case "a":
      case "A":
        players[socket.id].left = true;
      break;
      case "ArrowRight":
      case "d":
      case "D":
        players[socket.id].right = true;
      break;
      case "ArrowUp":
      case "w":
      case "W":
        players[socket.id].up = true;
      break;
      case "ArrowDown":
      case "s":
      case "S":
        players[socket.id].down = true;
      break;
    }
  });
  socket.on('stopClient', function(data){
    switch (data) {
      case "ArrowLeft":
      case "a":
      case "A":
        players[socket.id].left = false;
      break;
      case "ArrowRight":
      case "d":
      case "D":
        players[socket.id].right = false;
      break;
      case "ArrowUp":
      case "w":
      case "W":
        players[socket.id].up = false;
      break;
      case "ArrowDown":
      case "s":
      case "S":
        players[socket.id].down = false;
      break;
    }
    // players[socket.id].velX = 0;
  });
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

function loop() {
  Object.keys(players).forEach(key => {
    if (players[key].left) players[key].velX -= 6;
    if (players[key].right) players[key].velX += 6;
    if (players[key].up) players[key].velY -= 6;
    if (players[key].down) players[key].velY += 6;
    if (players[key].x + players[key].velX > 0 &&
        players[key].x + players[key].velX < 380) {
      players[key].x += players[key].velX;
    }
    if (players[key].y + players[key].velY > 0 &&
        players[key].y + players[key].velY < 380) {
      players[key].y += players[key].velY;
    }
    io.emit('move', [key,players[key]]);
    players[key].velX = 0;
    players[key].velY = 0;
  });
}
setInterval(loop, 16);