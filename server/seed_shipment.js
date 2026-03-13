import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shipment from './src/models/Shipment.js';

dotenv.config();

const seedShipment = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        const trackingNumber = 'TF123456789';
        await Shipment.deleteMany({ trackingNumber });

        const shipment = new Shipment({
            trackingNumber,
            sender: { name: 'SENDER CO', address: '123 Sender St, NY' },
            receiver: { name: 'RECEIVER CO', address: '456 Receiver Ave, CA' },
            status: 'in-transit',
            carrier: 'TrackFlow Express',
            estimatedDelivery: new Date(Date.now() + 259200000),
            history: [
                { status: 'pending', location: 'Dispatch Center', timestamp: new Date(Date.now() - 172800000) },
                { status: 'in-transit', location: 'Local Distribution Hub', timestamp: new Date() }
            ]
        });

        await shipment.save();
        console.log('Test shipment seeded successfully: TF123456789');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedShipment();
