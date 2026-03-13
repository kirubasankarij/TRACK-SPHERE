import express from 'express';
import AnalyticsService from '../services/analyticsService.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/global', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const stats = await AnalyticsService.getGlobalStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/driver/:id', authenticate, authorize(['admin', 'driver']), async (req, res) => {
    try {
        const stats = await AnalyticsService.getDriverStats(req.params.id);
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/delays', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const delays = await AnalyticsService.getDelayAnalysis();
        res.json({ success: true, data: delays });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
