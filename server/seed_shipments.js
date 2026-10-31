import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Shipment from './src/models/Shipment.js';
import Driver from './src/models/Driver.js';
import Vehicle from './src/models/Vehicle.js';

dotenv.config();

const seedShipments = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);

        // Find a driver and vehicle to link
        const driver = await Driver.findOne();
        const vehicle = await Vehicle.findOne();

        const shipments = [
            {
                trackingNumber: 'TF-DEMO-001',
                sender: { name: 'South India Fulfillment Hub', address: 'Electronic City, Bengaluru, Karnataka' },
                receiver: { name: 'Meenakshi Enterprises', address: 'Anna Nagar, Madurai, Tamil Nadu' },
                status: 'in-transit',
                carrier: 'TrackFlow Express India',
                estimatedDelivery: new Date(Date.now() + 86400000 * 2),
                assignedDriver: driver ? driver._id : null,
                assignedVehicle: vehicle ? vehicle._id : null,
                deliveryLocation: { lat: 9.9252, lng: 78.1198 },
                routePoints: [
                    { lat: 12.9716, lng: 77.5946, timestamp: new Date(Date.now() - 36000000) },
                    { lat: 12.7409, lng: 77.8253, timestamp: new Date(Date.now() - 28000000) },
                    { lat: 12.1211, lng: 78.1582, timestamp: new Date(Date.now() - 16000000) },
                    { lat: 11.6643, lng: 78.1460, timestamp: new Date() }
                ],
                history: [
                    { status: 'pending', location: 'Bengaluru Sort Facility', details: 'Shipment created' },
                    { status: 'in-transit', location: 'Salem Bypass NH 44', details: 'Departed from Bengaluru towards Madurai' }
                ]
            },
            {
                trackingNumber: 'TF-DEMO-002',
                sender: { name: 'Deccan Tech Logistics', address: 'HITEC City, Hyderabad, Telangana' },
                receiver: { name: 'Kavitha S.', address: 'Indiranagar, Bengaluru, Karnataka' },
                status: 'delivered',
                carrier: 'Logix Priority India',
                estimatedDelivery: new Date(Date.now() - 86400000),
                assignedDriver: driver ? driver._id : null,
                assignedVehicle: vehicle ? vehicle._id : null,
                deliveryLocation: { lat: 12.9784, lng: 77.6408 },
                routePoints: [
                    { lat: 17.3850, lng: 78.4867, timestamp: new Date(Date.now() - 48000000) },
                    { lat: 15.8281, lng: 78.0373, timestamp: new Date(Date.now() - 24000000) },
                    { lat: 12.9784, lng: 77.6408, timestamp: new Date() }
                ],
                history: [
                    { status: 'pending', location: 'Hyderabad Hub', details: 'Shipment received' },
                    { status: 'in-transit', location: 'Kurnool Corridor', details: 'Out for delivery' },
                    { status: 'delivered', location: 'Bengaluru Destination', details: 'Delivered to recipient' }
                ]
            },
            {
                trackingNumber: 'TF-DEMO-003',
                sender: { name: 'North Cargo Terminal', address: 'Okhla Phase 3, New Delhi' },
                receiver: { name: 'Rajputana Handicrafts', address: 'MI Road, Jaipur, Rajasthan' },
                status: 'in-transit',
                carrier: 'Northern Logistics Co.',
                estimatedDelivery: new Date(Date.now() + 86400000 * 2),
                assignedDriver: driver ? driver._id : null,
                assignedVehicle: vehicle ? vehicle._id : null,
                deliveryLocation: { lat: 26.9124, lng: 75.7873 },
                routePoints: [
                    { lat: 28.6139, lng: 77.2090, timestamp: new Date(Date.now() - 14400000) },
                    { lat: 27.9888, lng: 76.3883, timestamp: new Date(Date.now() - 7200000) },
                    { lat: 27.2000, lng: 75.9000, timestamp: new Date() }
                ],
                history: [
                    { status: 'pending', location: 'Delhi Okhla Terminal', details: 'Shipment scheduled' },
                    { status: 'in-transit', location: 'NH 48 Neemrana', details: 'In-transit to Jaipur' }
                ]
            }
        ];

        console.log('Clearing old demo shipments...');
        await Shipment.deleteMany({ trackingNumber: { $in: ['TF-DEMO-001', 'TF-DEMO-002', 'TF-DEMO-003'] } });

        console.log('Inserting new demo shipments...');
        await Shipment.insertMany(shipments);

        console.log('Shipments seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding shipments:', err);
        process.exit(1);
    }
};

seedShipments();
