import Queue from 'bull';
import { sendSMS, sendEmail, sendPushNotification } from '../services/notificationService.js';
import Notification from '../models/Notification.js';

const notificationQueue = new Queue('notifications', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

notificationQueue.process(async (job) => {
    const { notificationId, type, recipient, message, subject } = job.data;
    console.log(`Processing ${type} notification`);

    try {
        if (type === 'sms') {
            await sendSMS(recipient, message);
        } else if (type === 'email') {
            await sendEmail(recipient, subject || 'TrackFlow Update', message);
        } else if (type === 'push') {
            await sendPushNotification(recipient, 'TrackFlow Update', message);
        }

        await Notification.findByIdAndUpdate(notificationId, { status: 'sent' });
    } catch (err) {
        console.error(`Notification Worker Error: ${err.message}`);
        await Notification.findByIdAndUpdate(notificationId, { status: 'failed' });
        throw err;
    }
});

export default notificationQueue;
