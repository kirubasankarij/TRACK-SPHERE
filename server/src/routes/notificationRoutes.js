import express from 'express';
import { mockNotifications, runDelayCheck } from '../services/delayScheduler.js';

const router = express.Router();

// ────────────────────────────────────────────
// GET /api/notifications
// Admin → all notifications
// Customer → only their own (by trackingNumber query param)
// ────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { role, trackingNumber } = req.query;

        let notifications = [...mockNotifications].reverse(); // newest first

        if (role === 'customer' && trackingNumber) {
            notifications = notifications.filter(
                (n) => n.trackingNumber === trackingNumber && n.role === 'customer'
            );
        } else if (role === 'admin') {
            // admin sees all
        } else if (role === 'customer') {
            notifications = notifications.filter((n) => n.role === 'customer');
        }

        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ────────────────────────────────────────────
// GET /api/notifications/unread-count
// Returns badge count for the UI header
// ────────────────────────────────────────────
router.get('/unread-count', (req, res) => {
    const { role } = req.query;
    let items = mockNotifications;
    if (role === 'admin') {
        items = items.filter((n) => n.role === 'admin');
    } else if (role === 'customer') {
        items = items.filter((n) => n.role === 'customer');
    }
    const count = items.filter((n) => !n.read).length;
    res.json({ success: true, count });
});

// ────────────────────────────────────────────
// PATCH /api/notifications/:id/read
// Mark a single notification as read
// ────────────────────────────────────────────
router.patch('/:id/read', (req, res) => {
    const notif = mockNotifications.find((n) => n._id === req.params.id);
    if (!notif) return res.status(404).json({ success: false, message: 'Not found' });
    notif.read = true;
    res.json({ success: true, notification: notif });
});

// ────────────────────────────────────────────
// POST /api/notifications/mark-all-read
// Mark all as read (for a given role)
// ────────────────────────────────────────────
router.post('/mark-all-read', (req, res) => {
    const { role } = req.body;
    mockNotifications.forEach((n) => {
        if (!role || n.role === role) n.read = true;
    });
    res.json({ success: true });
});

// ────────────────────────────────────────────
// GET /api/notifications/trigger-check
// Manual trigger for testing without waiting 5 min
// ────────────────────────────────────────────
router.get('/trigger-check', async (req, res) => {
    try {
        await runDelayCheck();
        res.json({ success: true, message: 'Delay check triggered. Check server logs.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
