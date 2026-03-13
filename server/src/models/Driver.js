import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    licenseNumber: { type: String, required: true, unique: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    status: { type: String, enum: ['available', 'on-trip', 'offline'], default: 'offline' },
    rating: { type: Number, default: 5 },
    points: { type: Number, default: 0 },
    currentLocation: {
        lat: Number,
        lng: Number,
    },
    performanceStats: {
        totalDeliveries: { type: Number, default: 0 },
        onTimeDeliveries: { type: Number, default: 0 },
        delayedDeliveries: { type: Number, default: 0 },
    },
}, { timestamps: true });

export default mongoose.model('Driver', driverSchema);
