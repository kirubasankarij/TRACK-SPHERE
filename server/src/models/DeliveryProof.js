import mongoose from 'mongoose';

const deliveryProofSchema = new mongoose.Schema({
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true },
    otp: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    receiverSignature: String, // Base64 or URL
    photoProof: String, // URL
    deliveryLocation: {
        lat: Number,
        lng: Number,
    },
}, { timestamps: true });

export default mongoose.model('DeliveryProof', deliveryProofSchema);
