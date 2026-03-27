import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    licenseNumber: { type: String, required: true, unique: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    avatar: { type: String }, // URL to driver image
    status: { type: String, enum: ['available', 'on-trip', 'offline'], default: 'offline' },
    rating: { type: Number, default: 5 },
    points: { type: Number, default: 0 },
    currentLocation: {
        lat: Number,
        lng: Number,
    },
    // New Fields
    address: { type: String },
    bloodGroup: { type: String },
    organDonor: { type: Boolean, default: false },
    emergencyContact: {
        name: { type: String },
        phone: { type: String },
    },
    medicalConditions: { type: String },
    company: {
        name: { type: String, default: 'TrackSphere' },
        contact: { type: String, default: '+91 1800-TRACK-00' }
    },
    performanceStats: {
        totalDeliveries: { type: Number, default: 0 },
        onTimeDeliveries: { type: Number, default: 0 },
        delayedDeliveries: { type: Number, default: 0 },
    },
}, { timestamps: true });

export default mongoose.model('Driver', driverSchema);
