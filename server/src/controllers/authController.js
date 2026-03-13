import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';

export const register = async (req, res, next) => {
    try {
        const { name, email, phone, password, role } = req.body;

        if (process.env.DEMO_MODE === 'true') {
            const { MockUser } = await import('../models/mocks.js');
            let user = await MockUser.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }
            const newUser = new MockUser({ name, email, phone, password, role });
            await newUser.save();
            const payload = { user: { id: newUser._id, role: newUser.role } };
            return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' }, (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role } });
            });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ name, email, phone, password, role });
        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Mock Login for Demo Mode
        if (process.env.DEMO_MODE === 'true' || email.toLowerCase().includes('@tracksphere.com')) {
            console.log('Login attempt with demo/mock email:', email);
            const { MockUser } = await import('../models/mocks.js');
            const mockUser = await MockUser.findOne({ email: email.toLowerCase() });
            
            if (mockUser) {
                console.log('Mock user found:', mockUser.email);
                const isMatch = await mockUser.comparePassword(password);
                console.log('Mock password match:', isMatch);
                
                if (isMatch) {
                    const payload = { user: { id: mockUser._id, role: mockUser.role } };
                    return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' }, (err, token) => {
                        if (err) throw err;
                        res.json({ token, user: { id: mockUser._id, name: mockUser.name, email: mockUser.email, role: mockUser.role } });
                    });
                }
            }
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );
    } catch (err) {
        next(err);
    }
};

export const seedDemoAccounts = async (req, res, next) => {
    try {
        console.log('Starting demo account seeding...');

        await User.deleteMany({ email: { $in: ['admin@tracksphere.com', 'driver@tracksphere.com', 'customer@tracksphere.com'] } });

        const demoPassword = 'password123';

        const adminUser = new User({
            name: 'System Admin',
            email: 'admin@tracksphere.com',
            password: demoPassword,
            role: 'admin'
        });
        await adminUser.save();

        const customerUser = new User({
            name: 'Demo Customer',
            email: 'customer@tracksphere.com',
            password: demoPassword,
            role: 'customer'
        });
        await customerUser.save();

        const driverUser = new User({
            name: 'Master Driver',
            email: 'driver@tracksphere.com',
            password: demoPassword,
            role: 'driver'
        });
        await driverUser.save();

        await Vehicle.deleteMany({ plateNumber: 'SL-2026-X' });
        const vehicle = new Vehicle({
            plateNumber: 'SL-2026-X',
            model: 'Heavy Duty Freight 500',
            type: 'truck',
            capacity: 5000,
            status: 'active'
        });
        await vehicle.save();

        await Driver.deleteMany({ licenseNumber: 'DL-DEMO-001' });
        const driverProfile = new Driver({
            user: driverUser._id,
            licenseNumber: 'DL-DEMO-001',
            vehicle: vehicle._id,
            status: 'available',
            rating: 4.8,
            performanceStats: {
                totalDeliveries: 156,
                onTimeDeliveries: 150,
                delayedDeliveries: 6
            }
        });
        await driverProfile.save();

        res.json({
            success: true,
            message: 'Demo accounts seeded successfully!',
            credentials: {
                password: demoPassword,
                accounts: {
                    admin: 'admin@tracksphere.com',
                    driver: 'driver@tracksphere.com',
                    customer: 'customer@tracksphere.com'
                }
            }
        });
    } catch (err) {
        next(err);
    }
};
