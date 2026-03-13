import mongoose from 'mongoose';

// A simple mock for Mongoose models to allow the UI to function without a real DB
class MockModel {
    constructor(data) {
        Object.assign(this, data);
        this._id = this._id || new mongoose.Types.ObjectId();
    }
    save() { return Promise.resolve(this); }
    static findOne() { return Promise.resolve(null); }
    static find() { return Promise.resolve([]); }
    static deleteMany() { return Promise.resolve(); }
    static findById() { return Promise.resolve(null); }
    static create(data) { return Promise.resolve(new this(data)); }
}

export const MockUser = class extends MockModel {
    static users = [
        { _id: new mongoose.Types.ObjectId(), name: 'System Admin', email: 'admin@tracksphere.com', phone: '+919999999999', password: 'password123', role: 'admin' },
        { _id: new mongoose.Types.ObjectId(), name: 'Master Driver', email: 'driver@tracksphere.com', phone: '+918888888888', password: 'password123', role: 'driver' },
        { _id: new mongoose.Types.ObjectId(), name: 'Demo Customer', email: 'customer@tracksphere.com', phone: '+917777777777', password: 'password123', role: 'customer' }
    ];

    async save() {
        MockUser.users.push({
            _id: this._id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            password: this.password,
            role: this.role || 'customer'
        });
        return this;
    }

    static async findOne({ email }) {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return null;
        return {
            ...user,
            comparePassword: async (pwd) => pwd === user.password,
            toObject: () => user
        };
    }

    static async findById(id) {
        return this.users.find(u => u._id.toString() === id.toString()) || null;
    }
};

export const MockShipment = class extends MockModel {
    static shipments = [
        { _id: new mongoose.Types.ObjectId(), trackingNumber: 'TF123456', status: 'in-transit', origin: 'New York', destination: 'London', createdAt: new Date() },
        { _id: new mongoose.Types.ObjectId(), trackingNumber: 'TF789012', status: 'delivered', origin: 'Berlin', destination: 'Paris', createdAt: new Date() },
        { 
            _id: new mongoose.Types.ObjectId(), 
            trackingNumber: 'TF-DEMO-001', 
            status: 'in-transit', 
            origin: 'New York', 
            destination: 'London', 
            sender: { name: 'Global Goods', address: 'New York, USA' },
            receiver: { name: 'Local Store', address: 'London, UK' },
            deliveryLocation: { lat: 51.5074, lng: -0.1278 },
            routePoints: [
                { lat: 40.7128, lng: -74.0060, timestamp: new Date(Date.now() - 86400000) },
                { lat: 45.0000, lng: -40.0000, timestamp: new Date(Date.now() - 43200000) },
                { lat: 51.5074, lng: -0.1278, timestamp: new Date() }
            ],
            history: [
                { status: 'picked-up', location: 'New York', timestamp: new Date(Date.now() - 86400000), details: 'Package picked up by carrier' },
                { status: 'in-transit', location: 'Atlantic Ocean', timestamp: new Date(Date.now() - 43200000), details: 'In transit to destination' },
                { status: 'in-transit', location: 'London', timestamp: new Date(), details: 'Arrived at sorting facility' }
            ],
            estimatedDelivery: new Date(Date.now() + 3600000),
            delayProbability: 15,
            predictedDelay: 10,
            createdAt: new Date() 
        },
        { 
            _id: new mongoose.Types.ObjectId(), 
            trackingNumber: 'TF-TN-DEMO', 
            status: 'in-transit', 
            origin: 'Chennai', 
            destination: 'Coimbatore', 
            sender: { name: 'Chennai Tech Hub', address: 'Guindy, Chennai, TN' },
            receiver: { name: 'South Retailers', address: 'RS Puram, Coimbatore, TN' },
            deliveryLocation: { lat: 11.0168, lng: 76.9558 },
            routePoints: [
                { lat: 13.0827, lng: 80.2707, timestamp: new Date(Date.now() - 36000000) }, // Chennai
                { lat: 11.9416, lng: 79.4861, timestamp: new Date(Date.now() - 18000000) }, // Villupuram
                { lat: 11.4102, lng: 77.7334, timestamp: new Date() } // Erode
            ],
            history: [
                { status: 'picked-up', location: 'Chennai', timestamp: new Date(Date.now() - 36000000), details: 'Package picked up by Raj Kumar' },
                { status: 'in-transit', location: 'Villupuram', timestamp: new Date(Date.now() - 18000000), details: 'Passing through Villupuram Toll' },
                { status: 'in-transit', location: 'Erode', timestamp: new Date(), details: 'Approaching Coimbatore' }
            ],
            estimatedDelivery: new Date(Date.now() + 7200000),
            delayProbability: 5,
            predictedDelay: 0,
            aiAnalysis: {
                reason: 'Optimal route maintainted. Potential congestion avoided via Salem bypass.',
                insight: 'Traffic is moving 12% faster than 2-hour average.',
                impact: 'minimal'
            },
            notifications: [
                { type: 'SMS', recipient: '+91 9XXXX XX210', status: 'delivered', timestamp: new Date(Date.now() - 36000000), message: 'Shipment TF-TN-DEMO picked up from Chennai.' },
                { type: 'Email', recipient: 'c****@gmail.com', status: 'sent', timestamp: new Date(), message: 'Your shipment is now in Erode sector.' }
            ],
            assignedDriver: { 
                name: 'Raj Kumar', 
                phone: '+91 98765 43210', 
                rating: 4.9,
                avatar: 'https://i.pravatar.cc/150?u=rajkumar'
            },
            assignedVehicle: { 
                plateNumber: 'TN-01-AX-1234', 
                model: 'Tata Prima 4028.S', 
                type: 'Heavy Truck' 
            },
            weatherInfo: {
                condition: 'Clear Sky',
                temperature: '32°C',
                humidity: '45%',
                windSpeed: '12 km/h'
            },
            carrier: 'SphereForce South',
            createdAt: new Date() 
        },
        { _id: new mongoose.Types.ObjectId(), trackingNumber: 'TF-DEMO-002', status: 'delivered', origin: 'Berlin', destination: 'Paris', createdAt: new Date() },
        { _id: new mongoose.Types.ObjectId(), trackingNumber: 'TF-DEMO-003', status: 'pending', origin: 'Tokyo', destination: 'Osaka', createdAt: new Date() }
    ];

    static async find(query) { return this.shipments; }
    static async findOne(query) {
        if (query.trackingNumber) return this.shipments.find(s => s.trackingNumber === query.trackingNumber);
        return this.shipments[0];
    }
};

export const MockDriver = class extends MockModel {
    static async findOne() { 
        return { 
            name: 'Raj Kumar',
            phone: '+91 98765 43210',
            licenseNumber: 'TN-38-2022-0012345',
            performanceStats: { totalDeliveries: 1542, rating: 4.9 },
            status: 'active'
        }; 
    }
};

export const MockVehicle = class extends MockModel { 
    static vehicles = [
        { _id: new mongoose.Types.ObjectId(), plateNumber: 'TN-01-AX-1234', model: 'Tata Prima 4028.S', type: 'Heavy Truck', capacity: 40, status: 'moving', assignedDriver: { name: 'Raj Kumar', phone: '+91 98765 43210' } },
        { _id: new mongoose.Types.ObjectId(), plateNumber: 'MH-12-PQ-5678', model: 'Ashok Leyland Dost', type: 'van', capacity: 10, status: 'active', assignedDriver: { name: 'Sarah Wilson', phone: '+91 88888 77777' } },
        { _id: new mongoose.Types.ObjectId(), plateNumber: 'KA-05-LM-9012', model: 'Mahindra Bolero Pik-Up', type: 'truck', capacity: 15, status: 'maintenance', assignedDriver: null },
        { _id: new mongoose.Types.ObjectId(), plateNumber: 'DL-04-CR-3456', model: 'Honda Activa 6G', type: 'bike', capacity: 0.5, status: 'active', assignedDriver: { name: 'Amit Verma', phone: '+91 99999 11111' } },
        { _id: new mongoose.Types.ObjectId(), plateNumber: 'TS-09-EV-7890', model: 'DJI Matrice 300 RTK', type: 'drone', capacity: 2.7, status: 'active', assignedDriver: null }
    ];

    static async find() {
        return this.vehicles;
    }
    
    static async findOne() {
        return this.vehicles[0];
    }
};

export const MockStation = class extends MockModel {
    static stations = [
        { _id: new mongoose.Types.ObjectId(), name: 'Chennai Hub', type: 'station', location: 'Guindy, Chennai', facilities: ['Fuel', 'Rest Area', 'Canteen'], status: 'active' },
        { _id: new mongoose.Types.ObjectId(), name: 'Erode Stop', type: 'food', location: 'Erode, TN', facilities: ['Food', 'Restroom', 'Parking'], status: 'active' }
    ];

    async save() {
        MockStation.stations.push(this);
        return this;
    }

    static async find() { return this.stations; }
};

export const MockSupportTicket = class extends MockModel {
    static tickets = [
        { _id: new mongoose.Types.ObjectId(), customer: { name: 'Demo Customer' }, issue: 'Shipment delayed beyond expected time', status: 'open', priority: 'high', createdAt: new Date() },
        { _id: new mongoose.Types.ObjectId(), customer: { name: 'Demo Customer' }, issue: 'Package not received at destination', status: 'in-progress', priority: 'medium', createdAt: new Date() }
    ];

    async save() {
        MockSupportTicket.tickets.push(this);
        return this;
    }

    static async find() { return this.tickets; }
};
