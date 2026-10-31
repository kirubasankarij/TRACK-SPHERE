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
        default: 'Order Created'
    },
    priority: { type: String, default: 'Normal' },
    packageDetails: { type: String, default: 'Standard Parcel' },
    pickupLocation: { type: String },
    deliveryLocation: { type: String },
    lastLocation: { type: String },
    assignedTime: { type: Date },
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
    vehicleType: { type: String, default: 'Heavy Truck' },
    greenLogistics: {
        greenScore: { type: Number, default: 85 },
        co2EmissionsKg: { type: Number, default: 4.5 },
        co2SavedKg: { type: Number, default: 1.2 },
        ecoGrade: { type: String, default: 'A' },
        treesEquivalent: { type: Number, default: 0.2 },
        isEcoRoute: { type: Boolean, default: true }
    },
    etaConfidence: {
        marginMinutes: { type: Number, default: 12 },
        confidencePercent: { type: Number, default: 88 },
        rangeLabel: { type: String }
    },
    rerouteSuggestion: {
        suggested: { type: Boolean, default: false },
        alternateRoute: { type: String },
        timeSavedMins: { type: Number, default: 0 },
        fuelSavedLiters: { type: Number, default: 0 },
        costSavedInr: { type: Number, default: 0 },
        co2SavedKg: { type: Number, default: 0 }
    }
}, { timestamps: true });

export default mongoose.model('Shipment', shipmentSchema);
