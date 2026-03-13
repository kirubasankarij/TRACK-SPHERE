import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    plateNumber: { type: String, required: true, unique: true },
    model: { type: String, required: true },
    type: { type: String, enum: ['truck', 'van', 'bike', 'drone'], required: true },
    capacity: Number,
    status: { type: String, enum: ['active', 'maintenance', 'retired'], default: 'active' },
    currentLocation: {
        lat: Number,
        lng: Number,
    },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
