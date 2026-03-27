import express from 'express';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import Shipment from '../models/Shipment.js';
import { authenticate, authorize } from '../middleware/auth.js';

import { addFuelLog, getFuelLogs } from '../controllers/fuelController.js';

const router = express.Router();

// Get all drivers (Admin only)
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockDriver } = await import('../models/mocks.js');
            const drivers = [await MockDriver.findOne()]; 
            return res.json({ success: true, data: drivers });
        }
        const drivers = await Driver.find().populate('user', 'name email phone');
        res.json({ success: true, data: drivers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new driver profile
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { name, phone, email, licenseNumber, license, avatar } = req.body;
        const driverEmail = email || `${phone || Date.now()}@tracksphere.com`;
        
        if (process.env.DEMO_MODE === 'true') {
            const { MockDriver } = await import('../models/mocks.js');
            const driver = await MockDriver.create(req.body);
            return res.status(201).json({ success: true, data: driver });
        }

        // 1. Find or Create User
        let user = await User.findOne({ 
            $or: [
                { email: driverEmail },
                { phone: phone }
            ] 
        });

        if (!user) {
            user = new User({
                name,
                email: driverEmail,
                phone,
                password: 'password123', // Default temporary password
                role: 'driver'
            });
            await user.save();
        }

        // 2. Create Driver Profile
        const driver = new Driver({
            user: user._id,
            licenseNumber: licenseNumber || license,
            avatar,
            status: 'active'
        });
        
        await driver.save();
        const populatedDriver = await driver.populate('user', 'name email phone');
        
        res.status(201).json({ success: true, data: populatedDriver });
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(400).json({ success: false, message: error.message || 'Failed to create driver' });
    }
});

// Get assigned shipments for current driver
// ... (lines 9-24)
router.get('/shipments', authenticate, authorize(['driver']), async (req, res) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            return res.json({ success: true, data: MockShipment.shipments });
        }
        const driver = await Driver.findOne({ user: req.user.id });
        if (!driver) return res.status(404).json({ message: 'Driver profile not found' });

        const shipments = await Shipment.find({ assignedDriver: driver._id });
        res.json({ success: true, data: shipments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Fuel tracking routes
router.post('/fuel', authenticate, authorize(['driver']), addFuelLog);
router.get('/fuel', authenticate, authorize(['driver']), getFuelLogs);

// Update driver location
router.post('/location', authenticate, authorize(['driver']), async (req, res) => {
    try {
        const { lat, lng } = req.body;
        await Driver.findOneAndUpdate(
            { user: req.user.id },
            { currentLocation: { lat, lng } }
        );
        res.json({ success: true, message: 'Location updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update driver profile (Self)
router.put('/profile', authenticate, authorize(['driver']), async (req, res) => {
    try {
        const {
            address, bloodGroup, organDonor,
            emergencyContact, medicalConditions,
            licenseNumber, avatar
        } = req.body;

        if (process.env.DEMO_MODE === 'true') {
            const { MockDriver } = await import('../models/mocks.js');
            const driver = await MockDriver.findOne();
            Object.assign(driver, req.body);
            return res.json({ success: true, data: driver });
        }

        const driver = await Driver.findOneAndUpdate(
            { user: req.user.id },
            { 
                $set: { 
                    address, bloodGroup, organDonor, 
                    emergencyContact, medicalConditions,
                    licenseNumber, avatar
                } 
            },
            { new: true, upsert: true, runValidators: true }
        ).populate('user', 'name phone email');

        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
        res.json({ success: true, data: driver });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Public route for QR Scan (Limited Info)
// Note: This route is NOT protected by authenticate middleware
router.get('/public/:id', async (req, res) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockDriver } = await import('../models/mocks.js');
            const driver = await MockDriver.findOne();
            // Filter limited info
            const limitedInfo = {
                name: driver.name || 'Raj Kumar',
                avatar: driver.avatar,
                licenseNumber: driver.licenseNumber,
                status: driver.status,
                company: driver.company || { name: 'TrackSphere', contact: '+91 1800-TRACK-00' },
                emergencyContact: driver.emergencyContact
            };
            return res.json({ success: true, data: limitedInfo });
        }

        const driver = await Driver.findById(req.params.id)
            .populate('user', 'name phone')
            .populate('vehicle', 'plateNumber model type');

        if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

        // Filter limited info for privacy
        const limitedInfo = {
            name: driver.user.name,
            avatar: driver.avatar,
            vehicle: driver.vehicle ? { 
                plateNumber: driver.vehicle.plateNumber,
                model: driver.vehicle.model,
                type: driver.vehicle.type
            } : null,
            company: driver.company,
            emergencyContact: driver.emergencyContact
        };

        res.json({ success: true, data: limitedInfo });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
