const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let boardState = [];

io.on('connection', (socket) => {
  socket.emit('init', boardState);

  socket.on('draw', (stroke) => {
    boardState.push(stroke);
    io.emit('draw', stroke);
  });

  socket.on('clear', () => {
    boardState = [];
    io.emit('clear');
  });
});

const PORT = 5173;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));