

const socket = io();

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
// canvas.width = 400;
// canvas.height = 400;
document.body.appendChild(canvas);

let playerList = {};
let gameBall = {};
socket.on('init', function(data) {
	canvas.width = data.canvasW;
	canvas.height = data.canvasH;
	animate();
});

socket.on('setPlayerList', function(list) {
	playerList = list;
});
socket.on('move', function(socket) {
	playerList[socket[0]] = socket[1];
});

socket.on('updateBall', function(ball) {
	gameBall = ball;
});

function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (Object.entries(playerList).length > 0) {
		Object.entries(playerList).forEach(p => {
			let q = p[1];
			ctx.fillStyle = q.c;
			ctx.fillRect(q.x, q.y, q.w, q.h);
		});
	}
	ctx.fillStyle = gameBall.c;
	ctx.fillRect(gameBall.x, gameBall.y, gameBall.s, gameBall.s);
	requestAnimationFrame(animate);
}

window.addEventListener('keydown', (e) => {
	// if (e.key == "ArrowLeft") {
		socket.emit('moveClient', e.key)
	// }
	// if (e.key == "ArrowRight") {

	// }
});
window.addEventListener('keyup', (e) => {
	// if (e.key == "ArrowLeft") {
		socket.emit('stopClient', e.key)
	// }
	// if (e.key == "ArrowRight") {

	// }
});