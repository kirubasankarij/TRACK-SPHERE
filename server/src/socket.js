let io;

export default (socketIo) => {
    io = socketIo;
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('joinRoom', (room) => {
            if (room) {
                socket.join(room);
                console.log(`Client ${socket.id} joined room ${room}`);
            }
        });

        socket.on('updateLocation', (data) => {
            console.log('Real-time location update:', data);
            io.emit('driverLocationUpdate', data);
            if (data.trackingNumber) io.to(data.trackingNumber).emit('driverLocationUpdate', data);
            if (data.shipmentId) io.to(data.shipmentId).emit('driverLocationUpdate', data);
        });

        socket.on('updateStatus', (data) => {
            console.log('Real-time status update:', data);
            io.emit('statusUpdate', data);
            io.emit('shipmentUpdated', data);
            if (data.trackingNumber) io.to(data.trackingNumber).emit('statusUpdate', data);
        });

        socket.on('sendMessage', (data) => {
            console.log('Direct message sent via socket:', data);
            io.emit('directMessage', data);
        });

        socket.on('triggerSOS', (data) => {
            console.log('🚨 SOS / Safety alert received via socket:', data);
            io.emit('sosAlert', data);
            io.emit('driverSafetyAlert', data);
            io.emit('newNotification', {
                role: 'admin',
                type: data.alertType === 'drowsy' ? 'DROWSINESS_ALERT' : 'EMERGENCY_SOS',
                message: data.alertType === 'drowsy'
                    ? `🚨 CRITICAL SAFETY ALERT: Driver ${data.driverName || 'Driver'} - Eyes Closed (>3s) Detected!`
                    : `🚨 EMERGENCY ALERT: Driver ${data.driverName || 'Driver'} - ${data.detectedPhrase || 'Emergency Triggered'}`,
                data,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

export const getIO = () => io;

export const emitStatusUpdate = (shipmentId, update) => {
    if (io) {
        io.emit('statusUpdate', update);
        io.emit('shipmentUpdated', update);
        if (shipmentId) io.to(shipmentId).emit('statusUpdate', update);
    }
};

export const emitDriverAssigned = (data) => {
    if (io) {
        io.emit('driverAssigned', data);
        io.emit('shipmentUpdated', data);
    }
};

export const emitLocationUpdate = (data) => {
    if (io) {
        io.emit('driverLocationUpdate', data);
        if (data.trackingNumber) io.to(data.trackingNumber).emit('driverLocationUpdate', data);
    }
};

export const emitDelayAlert = (data) => {
    if (io) {
        io.emit('delayAlert', data);
        if (data.trackingNumber) io.to(data.trackingNumber).emit('delayAlert', data);
    }
};

export const emitSOSAlert = (data) => {
    if (io) {
        io.emit('sosAlert', data);
    }
};

export const emitDirectMessage = (data) => {
    if (io) {
        io.emit('directMessage', data);
    }
};
