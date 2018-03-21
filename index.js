const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  //[socket.id]
  socket.emit('message', `You joined the game`);
  socket.on('disconnect', function(){
    io.emit('message', `x left the game`);
  });
  socket.on('chat message', function(msg){
  	let ct = new Date();
  	socket.broadcast.emit('chat message', {user: users[socket.id].name, content: msg.content, time: `${ct.getHours()}:${ct.getMinutes()}`});
  	socket.emit('sent time', {id: msg.id, content:`${ct.getHours()}:${ct.getMinutes()}`});
  });
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});