import mongoose from 'mongoose';

const fuelSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    date: { type: Date, default: Date.now },
    station: { type: String, required: true },
    amount: { type: Number, required: true }, // in Liters
    cost: { type: Number, required: true },
    mileage: { type: Number, required: true }, // Odometer reading
}, { timestamps: true });

export default mongoose.model('Fuel', fuelSchema);
