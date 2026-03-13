import express from 'express';
import Shipment from '../models/Shipment.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { getIO } from '../socket.js';

const router = express.Router();

// GET: Customer's own shipments (history)
router.get('/shipments', authenticate, authorize(['customer', 'admin']), async (req, res) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            return res.json({ success: true, data: MockShipment.shipments });
        }
        const shipments = await Shipment.find({ 'customerRef': req.user.id })
            .populate('assignedDriver')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: shipments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST: Create a new shipment request
router.post('/shipments', authenticate, authorize(['customer', 'admin']), async (req, res) => {
    try {
        const trackingNumber = 'TF-' + Date.now().toString(36).toUpperCase();
        const shipment = new Shipment({
            ...req.body,
            trackingNumber,
            customerRef: req.user.id,
            status: 'pending',
            history: [{
                status: 'pending',
                location: req.body.sender?.address || 'Origin',
                details: 'Shipment request created.'
            }]
        });
        await shipment.save();
        res.status(201).json({ success: true, data: shipment });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST: Verify delivery OTP (customer-side)
router.post('/verify-delivery', authenticate, authorize(['customer']), async (req, res) => {
    try {
        const { trackingNumber, otp } = req.body;
        if (process.env.DEMO_MODE === 'true') {
            if (otp === '123456') {
                return res.json({ success: true, message: 'Delivery verified successfully!' });
            }
            return res.status(400).json({ success: false, message: 'Invalid OTP. Demo OTP is 123456' });
        }
        const shipment = await Shipment.findOne({ trackingNumber });
        if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
        if (shipment.deliveryOTP !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

        shipment.status = 'delivered';
        shipment.history.push({ status: 'delivered', location: shipment.receiver?.address, details: 'Delivery confirmed via OTP.' });
        await shipment.save();
        
        const io = getIO();
        if (io) {
            io.emit('shipmentUpdate', { trackingNumber, status: 'delivered' });
        }
        res.json({ success: true, message: 'Delivery confirmed!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST: Submit feedback/rating
router.post('/feedback', authenticate, authorize(['customer']), async (req, res) => {
    try {
        const { trackingNumber, rating, comment } = req.body;
        if (process.env.DEMO_MODE === 'true') {
            return res.json({ success: true, message: 'Thank you for your feedback!' });
        }
        const shipment = await Shipment.findOne({ trackingNumber });
        if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

        shipment.feedback = { rating, comment, submittedAt: new Date() };
        await shipment.save();

        if (shipment.assignedDriver) {
            const driver = await Driver.findById(shipment.assignedDriver);
            if (driver) {
                driver.points = (driver.points || 0) + Number(rating);
                await driver.save();
            }
        }

        if (req.user && req.user.id) {
            const user = await User.findById(req.user.id);
            if (user) {
                user.givenDriverPoints = (user.givenDriverPoints || 0) + Number(rating);
                await user.save();
            }
        }

        res.json({ success: true, message: 'Feedback submitted. Thank you!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
