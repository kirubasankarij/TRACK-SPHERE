import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['station', 'food'], default: 'station' },
    location: { type: String, required: true },
    facilities: [String],
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    coordinates: {
        lat: Number,
        lng: Number
    }
}, { timestamps: true });

export default mongoose.model('Station', stationSchema);
