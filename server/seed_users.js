import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Driver from './src/models/Driver.js';
import Vehicle from './src/models/Vehicle.js';
import Station from './src/models/Station.js';
import SupportTicket from './src/models/SupportTicket.js';
import bcrypt from 'bcryptjs';

dotenv.config();




const seedData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database:', mongoose.connection.name);

        await User.deleteMany({ email: { $in: ['admin@tracksphere.com', 'driver@tracksphere.com', 'customer@tracksphere.com'] } });
        console.log('Cleared existing demo users.');

        const demoPassword = 'password123';
  
        const adminUser = new User({
            name: 'System Admin',
            email: 'admin@tracksphere.com',
            password: demoPassword,
            role: 'admin'
        });
        await adminUser.save();
        console.log('Admin user created.');

        // 2. Create Customer
        const customerUser = new User({
            name: 'Demo Customer',
            email: 'customer@tracksphere.com',
            password: demoPassword,
            role: 'customer'
        });
        await customerUser.save();
        console.log('Customer user created.');

        // 3. Create Driver User
        const driverUser = new User({
            name: 'Master Driver',
            email: 'driver@tracksphere.com',
            password: demoPassword,
            role: 'driver'
        });
        await driverUser.save();
        console.log('Driver user created.');

        // 4. Create Vehicle
        await Vehicle.deleteMany({ plateNumber: 'SL-2026-X' });
        const vehicle = new Vehicle({
            plateNumber: 'SL-2026-X',
            model: 'Heavy Duty Freight 500',
            type: 'Truck',
            capacity: 5000,
            status: 'active'
        });
        await vehicle.save();
        console.log('Demo vehicle created.');

        // 5. Create Driver Profile
        await Driver.deleteMany({ licenseNumber: 'DL-DEMO-001' });
        const driverProfile = new Driver({
            user: driverUser._id,
            licenseNumber: 'DL-DEMO-001',
            vehicle: vehicle._id,
            status: 'available',
            performance: {
                rating: 4.8,
                totalDeliveries: 156
            }
        });
        await driverProfile.save();
        console.log('Driver profile created and linked to vehicle.');

        // 6. Create Stations
        await Station.deleteMany({});
        const stations = [
            { name: 'Chennai Hub', type: 'station', location: 'Guindy, Chennai', facilities: ['Fuel', 'Rest Area', 'Canteen'], status: 'active', coordinates: { lat: 13.0067, lng: 80.2206 } },
            { name: 'Erode Stop', type: 'food', location: 'Erode, TN', facilities: ['Food', 'Restroom', 'Parking'], status: 'active', coordinates: { lat: 11.3410, lng: 77.7172 } },
            { name: 'Coimbatore Terminal', type: 'station', location: 'Peelamedu, Coimbatore', facilities: ['Fuel', 'Maintenance', 'Rest Area', 'Food'], status: 'active', coordinates: { lat: 11.0168, lng: 76.9558 } }
        ];
        await Station.insertMany(stations);
        console.log('Demo stations created.');

        // 7. Create Support Tickets
        await SupportTicket.deleteMany({});
        const tickets = [
            { customer: customerUser._id, issue: 'Shipment delayed beyond expected time', status: 'open', priority: 'high' },
            { customer: customerUser._id, issue: 'Package not received at destination', status: 'in-progress', priority: 'medium' }
        ];
        await SupportTicket.insertMany(tickets);
        console.log('Demo support tickets created.');

        console.log('Seeding complete! Use "password123" for all demo accounts.');
        console.log('\nDemo Credentials:');
        console.log('-----------------');
        console.log('Admin:    admin@tracksphere.com');
        console.log('Driver:   driver@tracksphere.com');
        console.log('Customer: customer@tracksphere.com');
        console.log('Password: password123\n');
        if (!process.env.NO_EXIT) process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        if (!process.env.NO_EXIT) process.exit(1);
    }
};
export { seedData };

if (process.argv[1] && process.argv[1] === new URL(import.meta.url).pathname.substring(1)) {
    seedData();
} else if (import.meta.url === `file://${process.argv[1]}`) {
    // Windows URL workaround 
    seedData();
}
