import { emitDirectMessage } from '../socket.js';

const messages = [];

export const sendMessage = async (req, res, next) => {
    try {
        const { sender, recipient, recipientRole, message, trackingNumber } = req.body;
        const msgObj = {
            id: `MSG-${Date.now()}`,
            sender: sender || 'Admin Command',
            recipient: recipient || 'Driver',
            recipientRole: recipientRole || 'driver',
            message,
            trackingNumber: trackingNumber || 'GENERAL',
            timestamp: new Date().toISOString()
        };
        messages.push(msgObj);
        
        // Broadcast in real-time via Socket.io
        emitDirectMessage(msgObj);

        res.status(201).json({ success: true, data: msgObj });
    } catch (err) {
        next(err);
    }
};

export const getMessages = async (req, res, next) => {
    try {
        res.json({ success: true, data: messages });
    } catch (err) {
        next(err);
    }
};
