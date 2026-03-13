import mongoose from 'mongoose';

const carrierConfigSchema = new mongoose.Schema({
    carrierName: { type: String, required: true, unique: true },
    apiKey: String,
    apiSecret: String,
    apiEndpoint: String,
    adapterType: { type: String, required: true }, // e.g., 'fedex', 'ups', 'mock'
}, { timestamps: true });

export default mongoose.model('CarrierConfig', carrierConfigSchema);
