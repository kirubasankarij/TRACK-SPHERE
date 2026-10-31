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
        if (!id) return null;
        return this.users.find(u => u._id && u._id.toString() === id.toString()) || null;
    }
};

export const MockShipment = class extends MockModel {
    static shipments = [
        { 
            _id: new mongoose.Types.ObjectId(), 
            trackingNumber: 'TF-DEMO-001', 
            status: 'in-transit', 
            origin: 'Bengaluru, Karnataka', 
            destination: 'Madurai, Tamil Nadu', 
            sender: { name: 'South India Fulfillment Hub', address: 'Electronic City, Bengaluru, Karnataka' },
            receiver: { name: 'Meenakshi Enterprises', address: 'Anna Nagar, Madurai, Tamil Nadu' },
            deliveryLocation: { lat: 9.9252, lng: 78.1198, name: 'Anna Nagar Hub, Madurai' },
            lastLocation: 'Salem NH 44 Highway Bypass, Tamil Nadu',
            currentLocation: { lat: 11.6643, lng: 78.1460, name: 'Salem NH 44 Highway Bypass' },
            routePoints: [
                { lat: 12.9716, lng: 77.5946, name: 'Electronic City Hub, Bengaluru (Origin)', timestamp: new Date(Date.now() - 36000000) },
                { lat: 12.7409, lng: 77.8253, name: 'Hosur Toll Gate, NH 44 (TN Border)', timestamp: new Date(Date.now() - 28000000) },
                { lat: 12.1211, lng: 78.1582, name: 'Dharmapuri Toll Plaza, NH 44', timestamp: new Date(Date.now() - 16000000) },
                { lat: 11.6643, lng: 78.1460, name: 'Salem NH 44 Highway Bypass (Current Truck Location)', timestamp: new Date() }
            ],
            plannedPoints: [
                { lat: 11.6643, lng: 78.1460, name: 'Salem NH 44 Highway Bypass' },
                { lat: 11.2189, lng: 78.1674, name: 'Namakkal Highway Sector (NH 44)' },
                { lat: 10.9601, lng: 78.0766, name: 'Karur Bypass Corridor' },
                { lat: 10.3673, lng: 77.9803, name: 'Dindigul Toll Plaza' },
                { lat: 9.9252, lng: 78.1198, name: 'Anna Nagar Hub, Madurai (Destination)' }
            ],
            history: [
                { status: 'picked-up', location: 'Bengaluru Sort Facility', timestamp: new Date(Date.now() - 36000000), details: 'Package picked up by driver Raj Kumar' },
                { status: 'in-transit', location: 'Hosur Toll Gate, NH 44', timestamp: new Date(Date.now() - 28000000), details: 'Crossing Karnataka-Tamil Nadu Border' },
                { status: 'in-transit', location: 'Salem Bypass NH 44', timestamp: new Date(), details: 'Live Truck In-Transit on NH 44 towards Madurai' }
            ],
            assignedDriver: { 
                name: 'Raj Kumar (Master Driver)', 
                phone: '+91 98765 43210', 
                rating: 4.9, 
                avatar: null 
            },
            assignedVehicle: { 
                plateNumber: 'TN-01-AX-1234', 
                model: 'Tata Prima 4028.S (Heavy Truck)', 
                type: 'Truck' 
            },
            estimatedDelivery: new Date(Date.now() + 18000000),
            delayProbability: 12,
            predictedDelay: 0,
            aiAnalysis: {
                reason: 'Direct NH 44 route clear with smooth traffic velocity.',
                insight: 'Truck running on schedule with 12% fuel savings.',
                impact: 'minimal'
            },
            createdAt: new Date() 
        },
        { 
            _id: new mongoose.Types.ObjectId(), 
            trackingNumber: 'TF-TN-DEMO', 
            status: 'in-transit', 
            origin: 'Guindy, Chennai, Tamil Nadu', 
            destination: 'RS Puram, Coimbatore, Tamil Nadu', 
            sender: { name: 'Chennai Central Fulfillment Hub', address: 'Guindy Industrial Estate, Chennai, Tamil Nadu' },
            receiver: { name: 'South Retail Logistics', address: 'RS Puram, Coimbatore, Tamil Nadu' },
            deliveryLocation: { lat: 11.0168, lng: 76.9558, name: 'RS Puram Delivery Hub, Coimbatore' },
            lastLocation: 'Erode NH 544 Sector, Tamil Nadu (Live GPS)',
            currentLocation: { lat: 11.4102, lng: 77.7334, name: 'Erode NH 544 Sector' },
            routePoints: [
                { lat: 13.0067, lng: 80.2206, name: 'Guindy Sorting Hub, Chennai (Origin)', timestamp: new Date(Date.now() - 36000000) },
                { lat: 12.9675, lng: 79.9405, name: 'Sriperumbudur Industrial Corridor (NH 48)', timestamp: new Date(Date.now() - 30000000) },
                { lat: 12.8342, lng: 79.7036, name: 'Kanchipuram Toll Plaza (NH 48)', timestamp: new Date(Date.now() - 25000000) },
                { lat: 12.9165, lng: 79.1325, name: 'Vellore Bypass (NH 48)', timestamp: new Date(Date.now() - 20000000) },
                { lat: 12.5186, lng: 78.2137, name: 'Krishnagiri Junction (NH 44)', timestamp: new Date(Date.now() - 15000000) },
                { lat: 12.1211, lng: 78.1582, name: 'Dharmapuri Toll Plaza (NH 44)', timestamp: new Date(Date.now() - 10000000) },
                { lat: 11.6643, lng: 78.1460, name: 'Salem Express Bypass (NH 544)', timestamp: new Date(Date.now() - 5000000) },
                { lat: 11.4102, lng: 77.7334, name: 'Erode NH 544 Sector (Current Live Truck)', timestamp: new Date() }
            ],
            plannedPoints: [
                { lat: 11.4102, lng: 77.7334, name: 'Erode NH 544 Sector' },
                { lat: 11.2750, lng: 77.5850, name: 'Perundurai Toll Plaza (NH 544)' },
                { lat: 11.1925, lng: 77.2680, name: 'Avinashi Bypass (NH 544)' },
                { lat: 11.0550, lng: 77.0850, name: 'Neelambur Toll, Coimbatore Entry' },
                { lat: 11.0168, lng: 76.9558, name: 'RS Puram Delivery Hub, Coimbatore (Destination)' }
            ],
            history: [
                { status: 'picked-up', location: 'Guindy Sorting Hub, Chennai', timestamp: new Date(Date.now() - 36000000), details: 'Package picked up by Raj Kumar' },
                { status: 'in-transit', location: 'Vellore Toll Plaza, NH 48', timestamp: new Date(Date.now() - 20000000), details: 'Passed Vellore highway sector' },
                { status: 'in-transit', location: 'Salem Express Bypass', timestamp: new Date(Date.now() - 5000000), details: 'Transitioned to NH 544' },
                { status: 'in-transit', location: 'Erode NH 544 Sector', timestamp: new Date(), details: 'Current live truck location moving towards Coimbatore' }
            ],
            estimatedDelivery: new Date(Date.now() + 7200000),
            delayProbability: 35,
            predictedDelay: 25,
            aiAnalysis: {
                reason: 'Optimal highway route maintained. Potential congestion avoided via Salem bypass.',
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
                avatar: null 
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
            greenLogistics: {
                greenScore: 92,
                co2EmissionsKg: 4.25,
                co2SavedKg: 1.85,
                ecoGrade: 'A+',
                treesEquivalent: 0.19,
                isEcoRoute: true
            },
            etaConfidence: {
                marginMinutes: 12,
                confidencePercent: 88,
                rangeLabel: '±12 Mins Margin'
            },
            rerouteSuggestion: {
                suggested: true,
                alternateRoute: 'Via Salem-Coimbatore Express Bypass → Exit 4',
                timeSavedMins: 18,
                fuelSavedLiters: 1.6,
                costSavedInr: 163,
                co2SavedKg: 4.29
            },
            carrier: 'SphereForce South',
            createdAt: new Date() 
        },
        { 
            _id: new mongoose.Types.ObjectId(), 
            trackingNumber: 'TF-DEMO-002', 
            status: 'delivered', 
            origin: 'Hyderabad, Telangana', 
            destination: 'Bengaluru, Karnataka', 
            sender: { name: 'Deccan Tech Logistics', address: 'HITEC City, Hyderabad, Telangana' },
            receiver: { name: 'Kavitha S.', address: 'Indiranagar, Bengaluru, Karnataka' },
            deliveryLocation: { lat: 12.9784, lng: 77.6408, name: 'Indiranagar Delivery Hub, Bengaluru' },
            routePoints: [
                { lat: 17.3850, lng: 78.4867, name: 'HITEC City Cargo Terminal, Hyderabad (Origin)', timestamp: new Date(Date.now() - 48000000) },
                { lat: 15.8281, lng: 78.0373, name: 'Kurnool Highway Toll, Andhra Pradesh', timestamp: new Date(Date.now() - 24000000) },
                { lat: 13.6288, lng: 77.7126, name: 'Chikkaballapur NH 44 Toll', timestamp: new Date(Date.now() - 10000000) },
                { lat: 12.9784, lng: 77.6408, name: 'Indiranagar Delivery Hub, Bengaluru (Destination)', timestamp: new Date(Date.now() - 3600000) }
            ],
            plannedPoints: [
                { lat: 12.9784, lng: 77.6408, name: 'Indiranagar Delivery Hub, Bengaluru' }
            ],
            history: [
                { status: 'picked-up', location: 'Hyderabad Hub', timestamp: new Date(Date.now() - 48000000), details: 'Package dispatched' },
                { status: 'in-transit', location: 'Kurnool Toll, Andhra Pradesh', timestamp: new Date(Date.now() - 24000000), details: 'Crossing AP corridor' },
                { status: 'delivered', location: 'Bengaluru Destination', timestamp: new Date(Date.now() - 3600000), details: 'Successfully delivered to customer' }
            ],
            assignedDriver: { name: 'Vicknesh', phone: '+91 99999 11111', rating: 4.8 },
            assignedVehicle: { plateNumber: 'TS-09-EV-7890', model: 'Ashok Leyland Dost', type: 'Van' },
            lastLocation: 'Indiranagar, Bengaluru (Delivered)',
            currentLocation: { lat: 12.9784, lng: 77.6408, name: 'Indiranagar, Bengaluru' },
            createdAt: new Date() 
        },
        { 
            _id: new mongoose.Types.ObjectId(), 
            trackingNumber: 'TF-DEMO-003', 
            status: 'in-transit', 
            origin: 'New Delhi', 
            destination: 'Jaipur, Rajasthan', 
            sender: { name: 'North Cargo Terminal', address: 'Okhla Phase 3, New Delhi' },
            receiver: { name: 'Rajputana Handicrafts', address: 'MI Road, Jaipur, Rajasthan' },
            deliveryLocation: { lat: 26.9124, lng: 75.7873, name: 'MI Road Fulfillment Hub, Jaipur' },
            lastLocation: 'NH 48 Neemrana Industrial Sector, Rajasthan (Live Truck)',
            currentLocation: { lat: 27.9888, lng: 76.3883, name: 'Neemrana Industrial Sector' },
            routePoints: [
                { lat: 28.5355, lng: 77.2732, name: 'Okhla Cargo Hub, New Delhi (Origin)', timestamp: new Date(Date.now() - 14400000) },
                { lat: 28.4595, lng: 77.0266, name: 'Gurgaon Cyber City (NH 48)', timestamp: new Date(Date.now() - 10000000) },
                { lat: 28.2055, lng: 76.7944, name: 'Dharuhera Toll Plaza (NH 48)', timestamp: new Date(Date.now() - 7200000) },
                { lat: 27.9888, lng: 76.3883, name: 'Neemrana Industrial Sector (Live Truck)', timestamp: new Date() }
            ],
            plannedPoints: [
                { lat: 27.9888, lng: 76.3883, name: 'Neemrana Industrial Sector' },
                { lat: 27.7025, lng: 76.1963, name: 'Kotputli Bypass (NH 48)' },
                { lat: 27.3912, lng: 75.9614, name: 'Shahpura Toll Plaza' },
                { lat: 26.9124, lng: 75.7873, name: 'MI Road Fulfillment Hub, Jaipur (Destination)' }
            ],
            history: [
                { status: 'picked-up', location: 'Okhla Hub, Delhi', timestamp: new Date(Date.now() - 14400000), details: 'Loaded on truck' },
                { status: 'in-transit', location: 'Neemrana Toll Plaza, NH 48', timestamp: new Date(Date.now() - 7200000), details: 'In-transit on Delhi-Jaipur Expressway' }
            ],
            assignedDriver: { name: 'Kiruba', phone: '+91 88888 77777', rating: 4.8 },
            assignedVehicle: { plateNumber: 'DL-04-BZ-9012', model: 'Mahindra Bolero Pik-Up', type: 'Truck' },
            estimatedDelivery: new Date(Date.now() + 7200000),
            createdAt: new Date() 
        },
        { 
            _id: new mongoose.Types.ObjectId(), 
            trackingNumber: 'TRK-DEMO-2002', 
            status: 'out-for-delivery', 
            origin: 'Mumbai, Maharashtra', 
            destination: 'Pune, Maharashtra', 
            sender: { name: 'Mumbai Logistics Terminal', address: 'Andheri East, Mumbai, Maharashtra' },
            receiver: { name: 'Pune Tech Distributors', address: 'Hinjewadi Phase 1, Pune, Maharashtra' },
            deliveryLocation: { lat: 18.5913, lng: 73.7389, name: 'Hinjewadi Tech Park, Pune' },
            lastLocation: 'Lonavala Expressway Checkpoint (Live Truck)',
            currentLocation: { lat: 18.7557, lng: 73.4091, name: 'Lonavala Expressway Checkpoint' },
            routePoints: [
                { lat: 19.0760, lng: 72.8777, name: 'Andheri East Dispatch Hub, Mumbai (Origin)', timestamp: new Date(Date.now() - 28800000) },
                { lat: 19.0330, lng: 73.0297, name: 'Vashi Creek Bridge / Navi Mumbai', timestamp: new Date(Date.now() - 20000000) },
                { lat: 18.7842, lng: 73.2872, name: 'Khalapur Toll Plaza', timestamp: new Date(Date.now() - 14400000) },
                { lat: 18.7557, lng: 73.4091, name: 'Lonavala Expressway Checkpoint (Live Truck)', timestamp: new Date() }
            ],
            plannedPoints: [
                { lat: 18.7557, lng: 73.4091, name: 'Lonavala Expressway Checkpoint' },
                { lat: 18.7237, lng: 73.6826, name: 'Talegaon Toll Plaza' },
                { lat: 18.6298, lng: 73.7997, name: 'Pimpri-Chinchwad Bypass' },
                { lat: 18.5913, lng: 73.7389, name: 'Hinjewadi Tech Park, Pune (Destination)' }
            ],
            history: [
                { status: 'picked-up', location: 'Mumbai Terminal', timestamp: new Date(Date.now() - 28800000), details: 'Package picked up from warehouse' },
                { status: 'in-transit', location: 'Khalapur Toll', timestamp: new Date(Date.now() - 14400000), details: 'Crossed Mumbai-Pune Expressway toll' },
                { status: 'out-for-delivery', location: 'Lonavala', timestamp: new Date(), details: 'Entering Pune district sector' }
            ],
            estimatedDelivery: new Date(Date.now() + 3600000),
            delayProbability: 10,
            predictedDelay: 5,
            aiAnalysis: {
                reason: 'Express highway route selected. Low traffic expected.',
                insight: 'Delivery on track — ETA within 1 hour.',
                impact: 'minimal'
            },
            notifications: [
                { type: 'SMS', recipient: '+91 9XXXX XX456', status: 'delivered', timestamp: new Date(Date.now() - 28800000), message: 'Shipment TRK-DEMO-2002 picked up from Mumbai.' },
                { type: 'Email', recipient: 'p****@gmail.com', status: 'sent', timestamp: new Date(), message: 'Your shipment is out for delivery in Pune.' }
            ],
            assignedDriver: { 
                name: 'Vikram Singh', 
                phone: '+91 87654 32109', 
                rating: 4.7, 
                avatar: null 
            },
            assignedVehicle: { 
                plateNumber: 'MH-04-BZ-5678', 
                model: 'Eicher Pro 2049', 
                type: 'Truck' 
            },
            carrier: 'SphereForce West',
            createdAt: new Date() 
        }
    ];    ];

    static async find(query) { return this.shipments; }
    static async findOne(query) {
        if (!query) return this.shipments[0];
        if (query.trackingNumber) {
            const target = String(query.trackingNumber).trim().toLowerCase();
            const found = this.shipments.find(s => s.trackingNumber.toLowerCase() === target);
            if (found) return found;
        }
        if (query._id) {
            const found = this.shipments.find(s => String(s._id) === String(query._id));
            if (found) return found;
        }
        return this.shipments[0];
    }
};

export const MockDriver = class extends MockModel {
    static drivers = [
        {
            _id: new mongoose.Types.ObjectId(),
            name: 'Raj Kumar (Master Driver)',
            user: { name: 'Raj Kumar (Master Driver)', phone: '+91 98765 43210', email: 'driver@tracksphere.com' },
            phone: '+91 98765 43210',
            licenseNumber: 'TN-38-2022-0012345',
            license: 'TN-38-2022-0012345',
            performanceStats: { totalDeliveries: 1542, rating: 4.9 },
            avatar: null,
            status: 'active',
            address: '123, Anna Salai, Chennai, Tamil Nadu',
            bloodGroup: 'B+',
            organDonor: true,
            emergencyContact: { name: 'Kavitha Raj', phone: '+91 98765 00000' },
            medicalConditions: 'None',
            company: { name: 'TrackSphere Logistics', contact: '+91 1800-TRACK-00' }
        },
        {
            _id: new mongoose.Types.ObjectId(),
            name: 'Kiruba',
            user: { name: 'Kiruba', phone: '+91 88888 77777', email: 'kiruba@tracksphere.com' },
            phone: '+91 88888 77777',
            licenseNumber: 'MH-12-2021-044',
            license: 'MH-12-2021-044',
            performanceStats: { totalDeliveries: 98, rating: 4.8 },
            avatar: null,
            status: 'active',
            address: '45, MG Road, Bengaluru',
            bloodGroup: 'O+',
            emergencyContact: { name: 'Sankari', phone: '+91 88888 66666' }
        },
        {
            _id: new mongoose.Types.ObjectId(),
            name: 'Vicknesh',
            user: { name: 'Vicknesh', phone: '+91 99999 11111', email: 'vicknesh@tracksphere.com' },
            phone: '+91 99999 11111',
            licenseNumber: 'DL-04-2020-088',
            license: 'DL-04-2020-088',
            performanceStats: { totalDeliveries: 212, rating: 4.7 },
            avatar: null,
            status: 'active',
            address: '88, Outer Ring Road, Delhi',
            bloodGroup: 'AB-',
            emergencyContact: { name: 'Amma', phone: '+91 99999 22222' }
        }
    ];

    static async find() { return this.drivers; }
    static async findOne() { return this.drivers[0]; }
    static async create(data) {
        const newDriver = {
            _id: new mongoose.Types.ObjectId(),
            name: data.name,
            user: { name: data.name, phone: data.phone, email: data.email || `${data.phone}@tracksphere.com` },
            phone: data.phone,
            licenseNumber: data.licenseNumber || data.license,
            license: data.licenseNumber || data.license,
            avatar: data.avatar || null,
            status: 'active',
            performanceStats: { totalDeliveries: 0, rating: 5.0 }
        };
        this.drivers.push(newDriver);
        return newDriver;
    }
};

export const MockVehicle = class extends MockModel { 
    static vehicles = [
        { _id: new mongoose.Types.ObjectId(), plateNumber: 'TN-01-AX-1234', model: 'Tata Prima 4028.S', type: 'Heavy Truck', capacity: 40, status: 'moving', assignedDriver: { name: 'Raj Kumar (Master Driver)', phone: '+91 98765 43210' } },
        { _id: new mongoose.Types.ObjectId(), plateNumber: 'MH-12-PQ-5678', model: 'Ashok Leyland Dost', type: 'Van', capacity: 10, status: 'standby', assignedDriver: { name: 'Kiruba (Standby)', phone: '+91 88888 77777' } },
        { _id: new mongoose.Types.ObjectId(), plateNumber: 'KA-05-LM-9012', model: 'Mahindra Bolero Pik-Up', type: 'Truck', capacity: 15, status: 'maintenance', assignedDriver: null },
        { _id: new mongoose.Types.ObjectId(), plateNumber: 'TS-09-EV-7890', model: 'DJI Matrice 300 RTK', type: 'Drone', capacity: 2.7, status: 'standby', assignedDriver: null }
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
