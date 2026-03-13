import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
    type: { type: String, enum: ['email', 'sms', 'push'], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['sent', 'failed', 'pending'], default: 'pending' },
    read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
