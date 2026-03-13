import express from 'express';
import Station from '../models/Station.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all stations
router.get('/', async (req, res) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockStation } = await import('../models/mocks.js');
            const stations = await MockStation.find();
            return res.json({ success: true, data: stations });
        }
        const stations = await Station.find();
        res.json({ success: true, data: stations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create station
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockStation } = await import('../models/mocks.js');
            const station = await MockStation.create(req.body);
            return res.status(201).json({ success: true, data: station });
        }
        const station = new Station(req.body);
        await station.save();
        res.status(201).json({ success: true, data: station });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update station
router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: station });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete station
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        await Station.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Station deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;
