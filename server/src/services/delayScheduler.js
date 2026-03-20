import cron from 'node-cron';
import { sendNotification, sendEmail, sendSMS } from './notificationService.js';
import { getIO } from '../socket.js';

// In-memory notification store for DEMO_MODE
export const mockNotifications = [];

// Helper: build a notification record
const buildRecord = ({ userId, shipmentId, trackingNumber, role, message, title }) => ({
    _id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    shipmentId,
    trackingNumber,
    role,        // 'admin' | 'customer'
    title,
    message,
    status: 'sent',
    read: false,
    createdAt: new Date(),
});

// ─────────────────────────────────────────────
// Core delay-check logic (exported so it can be
// called from the manual trigger endpoint too)
// ─────────────────────────────────────────────
export const runDelayCheck = async () => {
    console.log('[DelayScheduler] Running delay check...');

    try {
        const isDemo = process.env.DEMO_MODE === 'true';

        let shipments = [];

        if (isDemo) {
            // Use mock data
            const { MockShipment } = await import('../models/mocks.js');
            shipments = await MockShipment.find({ status: 'in-transit' });
        } else {
            const Shipment = (await import('../models/Shipment.js')).default;
            shipments = await Shipment.find({ status: 'in-transit' });
        }

        const now = new Date();
        const TWO_HOURS = 2 * 60 * 60 * 1000;

        console.log(`[DelayScheduler] Checking ${shipments.length} active shipment(s)...`);

        for (const shipment of shipments) {
            const isOverdue =
                shipment.estimatedDelivery && now > new Date(shipment.estimatedDelivery);
            const hasPredictedDelay =
                shipment.predictedDelay && shipment.predictedDelay > 0;
            const hasHighProbability =
                shipment.delayProbability && shipment.delayProbability >= 30;

            const isDelayed = isOverdue || hasPredictedDelay || hasHighProbability;
            if (!isDelayed) continue;

            // Avoid spamming – only re-notify after 2 hours
            if (
                shipment.lastDelayNotifiedAt &&
                now - new Date(shipment.lastDelayNotifiedAt) < TWO_HOURS
            ) {
                console.log(`[DelayScheduler] Skipping ${shipment.trackingNumber} – notified recently`);
                continue;
            }

            // ── Build delay message ──────────────────────────────
            let reason = '';
            if (isOverdue) reason = 'shipment has passed its estimated delivery time';
            else if (hasPredictedDelay)
                reason = `a delay of ~${shipment.predictedDelay} minutes is predicted`;
            else reason = `delay probability is at ${shipment.delayProbability}%`;

            const customerTitle = '⚠️ Shipment Delay Alert';
            const customerMsg = `Your shipment ${shipment.trackingNumber} has been flagged for a delay — ${reason}. We are working to resolve this as quickly as possible.`;

            const adminTitle = '🚨 ADMIN – Delay Alert';
            const adminMsg = `Shipment ${shipment.trackingNumber} is delayed. Reason: ${reason}. Customer has been notified automatically.`;

            // ── Notify Customer ──────────────────────────────────
            const customerId = shipment.customerRef || shipment.userId || 'DEMO_CUSTOMER';

            await sendNotification({
                userId: customerId,
                type: 'DELAY_REPORT',
                title: customerTitle,
                message: customerMsg,
                metadata: { trackingNumber: shipment.trackingNumber },
            });

            // Store in-memory record (demo & live)
            const customerRecord = buildRecord({
                userId: customerId,
                shipmentId: shipment._id,
                trackingNumber: shipment.trackingNumber,
                role: 'customer',
                title: customerTitle,
                message: customerMsg,
            });
            mockNotifications.push(customerRecord);

            // Emit to customer via socket
            const io = getIO();
            if (io) {
                io.emit('newNotification', customerRecord);
                console.log(`[DelayScheduler] Socket: Emitted customer alert for ${shipment.trackingNumber}`);
            }

            // ── Notify Admin ─────────────────────────────────────
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@tracksphere.com';
            const adminPhone = process.env.ADMIN_PHONE || '+919999999999';

            await sendEmail(adminEmail, adminTitle, adminMsg);
            await sendSMS(adminPhone, `TrackSphere ADMIN: ${shipment.trackingNumber} delayed. ${reason}`);

            const adminRecord = buildRecord({
                userId: 'admin',
                shipmentId: shipment._id,
                trackingNumber: shipment.trackingNumber,
                role: 'admin',
                title: adminTitle,
                message: adminMsg,
            });
            mockNotifications.push(adminRecord);

            if (io) {
                io.emit('newNotification', adminRecord);
                console.log(`[DelayScheduler] Socket: Emitted admin alert for ${shipment.trackingNumber}`);
            }

            // ── Update lastDelayNotifiedAt ──────────────────────
            if (!isDemo) {
                try {
                    const Shipment = (await import('../models/Shipment.js')).default;
                    await Shipment.findByIdAndUpdate(shipment._id, {
                        lastDelayNotifiedAt: now,
                    });
                } catch (_) { /* ignore in demo */ }
            } else {
                // patch the mock object in-memory
                shipment.lastDelayNotifiedAt = now;
            }

            console.log(`[DelayScheduler] ✅ Delay alert sent for ${shipment.trackingNumber}`);
        }

        console.log('[DelayScheduler] Check complete.');
    } catch (err) {
        console.error('[DelayScheduler] Error during delay check:', err.message);
    }
};

// ─────────────────────────────────────────────
// Start the cron scheduler (called once at boot)
// ─────────────────────────────────────────────
export const startDelayScheduler = () => {
    // Run every 5 minutes: "*/5 * * * *"
    cron.schedule('*/5 * * * *', runDelayCheck, {
        scheduled: true,
        timezone: 'Asia/Kolkata',
    });

    console.log('[DelayScheduler] Started – checking every 5 minutes ✅');

    // Also run once immediately on boot so you see results right away
    setTimeout(runDelayCheck, 3000);
};

export default { startDelayScheduler, runDelayCheck, mockNotifications };
