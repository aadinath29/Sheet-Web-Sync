let io;

exports.init = (socketIoInstance) => {
  io = socketIoInstance;
  io.on('connection', (socket) => {
    console.log(`New React client connected via WebSocket: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

exports.broadcastUpdate = (data) => {
  if (io) {
    io.emit('sheet-updated', { rows: data });
  }
};
