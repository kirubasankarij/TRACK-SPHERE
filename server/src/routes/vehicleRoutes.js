import express from 'express';
import Vehicle from '../models/Vehicle.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockVehicle } = await import('../models/mocks.js');
            const vehicle = await MockVehicle.create(req.body);
            return res.status(201).json({ success: true, data: vehicle });
        }
        const vehicle = new Vehicle(req.body);
        await vehicle.save();
        res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

router.get('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockVehicle } = await import('../models/mocks.js');
            return res.json({ success: true, data: MockVehicle.vehicles });
        }
        const vehicles = await Vehicle.find().populate('assignedDriver', 'name phone');
        res.json({ success: true, data: vehicles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
