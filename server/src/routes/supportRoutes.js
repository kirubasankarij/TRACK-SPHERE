import express from 'express';
import SupportTicket from '../models/SupportTicket.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all tickets (Admin only)
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockSupportTicket } = await import('../models/mocks.js');
            const tickets = await MockSupportTicket.find();
            return res.json({ success: true, data: tickets });
        }
        const tickets = await SupportTicket.find().populate('customer', 'name email');
        res.json({ success: true, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create ticket (Customer)
router.post('/', authenticate, async (req, res) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockSupportTicket } = await import('../models/mocks.js');
            const ticket = await MockSupportTicket.create({
                ...req.body,
                customer: req.user.id
            });
            return res.status(201).json({ success: true, data: ticket });
        }
        const ticket = new SupportTicket({
            ...req.body,
            customer: req.user.id
        });
        await ticket.save();
        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Respond to ticket (Admin)
router.post('/:id/respond', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { message } = req.body;
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.responses.push({
            admin: req.user.id,
            message
        });
        ticket.status = 'in-progress';
        await ticket.save();
        res.json({ success: true, data: ticket });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Resolve ticket
router.put('/:id/resolve', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
        res.json({ success: true, data: ticket });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;
