import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
    customerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trackingNumber: { type: String, required: true, unique: true },
    sender: {
        name: String,
        address: String,
    },
    receiver: {
        name: String,
        address: String,
    },
    status: {
        type: String,
        enum: ['pending', 'in-transit', 'delivered', 'exception'],
        default: 'pending'
    },
    carrier: String,
    estimatedDelivery: Date,
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    predictedDelay: { type: Number, default: 0 }, // in minutes
    delayProbability: { type: Number, default: 0 }, // percentage
    routePoints: [{
        lat: Number,
        lng: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    weatherInfo: {
        condition: String,
        temperature: Number,
    },
    trafficInfo: {
        level: String, // light, moderate, heavy, gridlock
        delayMinutes: Number,
    },
    history: [{
        status: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
        details: String,
    }],
    deliveryOTP: { type: String },
    deliveryProof: { type: String }, // URL to proof image
    feedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        submittedAt: Date,
    },
    lastDelayNotifiedAt: { type: Date, default: null }, // prevents duplicate delay alerts
}, { timestamps: true });

export default mongoose.model('Shipment', shipmentSchema);
