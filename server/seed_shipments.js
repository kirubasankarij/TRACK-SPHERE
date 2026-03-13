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
                sender: { name: 'John Doe', address: '123 Main St, New York, NY' },
                receiver: { name: 'Jane Smith', address: '456 Elm St, London, UK' },
                status: 'in-transit',
                carrier: 'SmartLogix Express',
                estimatedDelivery: new Date(Date.now() + 86400000 * 2),
                assignedDriver: driver ? driver._id : null,
                assignedVehicle: vehicle ? vehicle._id : null,
                routePoints: [
                    { lat: 40.7128, lng: -74.0060, timestamp: new Date() }
                ],
                history: [
                    { status: 'pending', location: 'New York Warehouse', details: 'Shipment created' },
                    { status: 'in-transit', location: 'JFK Airport', details: 'Departed from origin' }
                ]
            },
            {
                trackingNumber: 'TF-DEMO-002',
                sender: { name: 'Alice Brown', address: '789 Oak Ave, Berlin, DE' },
                receiver: { name: 'Bob Wilson', address: '101 Pine Rd, Paris, FR' },
                status: 'delivered',
                carrier: 'Logix Priority',
                estimatedDelivery: new Date(Date.now() - 86400000),
                assignedDriver: driver ? driver._id : null,
                assignedVehicle: vehicle ? vehicle._id : null,
                history: [
                    { status: 'pending', location: 'Berlin Center', details: 'Shipment received' },
                    { status: 'in-transit', location: 'On the road', details: 'Out for delivery' },
                    { status: 'delivered', location: 'Destination', details: 'Delivered to recipient' }
                ]
            },
            {
                trackingNumber: 'TF-DEMO-003',
                sender: { name: 'Charlie Green', address: '555 Maple Dr, Tokyo, JP' },
                receiver: { name: 'Diana Prince', address: '777 Sakura Blvd, Osaka, JP' },
                status: 'pending',
                carrier: 'Global Tracking Co.',
                estimatedDelivery: new Date(Date.now() + 86400000 * 5),
                history: [
                    { status: 'pending', location: 'Tokyo Hub', details: 'Shipment scheduled' }
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
