import express from 'express';
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
        if (process.env.DEMO_MODE === 'true') {
            const { MockDriver } = await import('../models/mocks.js');
            const driver = await MockDriver.create(req.body);
            return res.status(201).json({ success: true, data: driver });
        }
        const driver = new Driver(req.body);
        await driver.save();
        res.status(201).json({ success: true, data: driver });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
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

export default router;
