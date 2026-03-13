import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shipment from './src/models/Shipment.js';

dotenv.config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const shipments = await Shipment.find({}, 'trackingNumber status');
        console.log('SHIPMENTS_FOUND:', JSON.stringify(shipments));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
