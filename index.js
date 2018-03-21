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

const ball = {
  x: canvas.canvasW / 2,
  y: canvas.canvasH / 2 - 4,
  s: 8,
  c: `#f00`,
  velX: 3,
  velY: 0
}

let gameStart = false;

io.on('connection', function(socket){
  socket.emit('updateBall', ball);
  socket.emit('init', canvas);
  if (Object.keys(players).length < 2) {
    players[socket.id] = {};
    players[socket.id].x = Object.keys(players).length == 1 ? 20 : 360;
    players[socket.id].y = canvas.canvasH / 2 - 30;
    players[socket.id].w = 10;
    players[socket.id].h = 60;
    players[socket.id].left = false;
    players[socket.id].right = false;
    players[socket.id].up = false;
    players[socket.id].down = false;
    players[socket.id].velY = 0;
    players[socket.id].c = `hsl(${random(360)}, 100%, 50%)`;
    console.log(`${socket.id} joined the game.`);
  } else {
    console.log(`${socket.id} joined the game as a spectator.`);
  }
  if (Object.keys(players).length == 2) {
    gameStart = true;
  }
  
  io.emit('setPlayerList', players);
  socket.on('disconnect', function(){
    console.log(`${socket.id} left the game.`);
    delete players[socket.id];
    io.emit('setPlayerList', players);
    if (Object.keys(players).length < 2) {
      gameStart = false;
    }
  });

  socket.on('moveClient', function(data){
    // players[socket.id].velX = data == "ArrowLeft" ? -6 : 6;
    switch (data) {
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
  if (gameStart) {
    let colDist = 0;
    let colliding = false;
    Object.keys(players).forEach(key => {
      let colX = 0;
      let colY = 0;
      if (players[key].up) players[key].velY -= 6;
      if (players[key].down) players[key].velY += 6;
      if (players[key].y + players[key].velY > 0 &&
          players[key].y + players[key].velY < canvas.canvasH - players[key].h) {
        players[key].y += players[key].velY;
      }
      io.emit('move', [key,players[key]]);
      players[key].velX = 0;
      players[key].velY = 0;

      if (ball.x + ball.s > players[key].x && ball.x < players[key].x + players[key].w ) {
        colX++;
      }
      if (ball.y > players[key].y && ball.y < players[key].y + players[key].h) {
        colY++;
      }
      if (colX > 0 && colY > 0) {
        colliding = true;
        colDist = (ball.y + ball.s / 2) - (players[key].y + players[key].h / 2);
      }
    });
    if (colliding) {
      ball.velX *= -1;
      console.log(colDist);
      ball.velY = colDist*.1;
      ball.velX += ball.velX > 0 ? .1 : -.1;
    }
    if (ball.y < 0) ball.velY *= -1; 
    if (ball.y > canvas.canvasH - ball.s) ball.velY *= -1; 
    ball.x += ball.velX;
    ball.y += ball.velY;
    if (ball.x < -ball.s || ball.x > canvas.canvasW) {
        ball.x = canvas.canvasW / 2;
        ball.y = canvas.canvasH / 2 - 4;
        ball.velX = 3;
        ball.velY = 0;
        Object.keys(players).forEach(key => {
          players[key].y = canvas.canvasH / 2 - 30;
        });
    }
    io.emit('updateBall', ball);
  }
}
setInterval(loop, 16);