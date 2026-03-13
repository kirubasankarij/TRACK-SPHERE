let io;

export default (socketIo) => {
    io = socketIo;
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('joinRoom', (shipmentId) => {
            socket.join(shipmentId);
            console.log(`Client ${socket.id} joined room ${shipmentId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

export const getIO = () => io;

export const emitStatusUpdate = (shipmentId, update) => {
    if (io) {
        io.to(shipmentId).emit('statusUpdate', update);
    }
};
