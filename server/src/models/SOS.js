import mongoose from 'mongoose';

const sosSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    detectedPhrase: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'resolved'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('SOS', sosSchema);
