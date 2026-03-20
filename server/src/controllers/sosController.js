import SOS from '../models/SOS.js';
import Driver from '../models/Driver.js';
import NotificationService from '../services/notificationService.js';
import { getIO } from '../socket.js';

export const triggerSOS = async (req, res) => {
    try {
        const { driverId, location, detectedPhrase } = req.body;

        if (!driverId || !location || !detectedPhrase) {
            return res.status(400).json({ message: 'Missing required SOS information' });
        }

        // 1. Save SOS event
        const sosEvent = new SOS({
            driver: driverId,
            location,
            detectedPhrase
        });
        await sosEvent.save();

        // 2. Fetch driver & vehicle details for the alert
        const driver = await Driver.findById(driverId).populate('user').populate('vehicle');
        const driverName = driver?.user?.name || 'Unknown Driver';
        const vehiclePlate = driver?.vehicle?.plateNumber || 'Unknown Vehicle';

        const alertData = {
            id: sosEvent._id,
            driverName,
            vehiclePlate,
            location,
            detectedPhrase,
            timestamp: sosEvent.timestamp
        };

        // 3. Emit real-time alert via Socket.io to admins
        const io = getIO();
        if (io) {
            io.emit('sosAlert', alertData);
        }

        // 4. Trigger Notifications
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@trackflow.com';
        const adminPhone = process.env.ADMIN_PHONE || '+919999999999';

        // SMS
        await NotificationService.sendSMS(
            adminPhone,
            `EMERGENCY ALERT! Driver ${driverName} (${vehiclePlate}) triggered SOS: "${detectedPhrase}". Location: ${location.lat}, ${location.lng}`
        );

        // Email
        await NotificationService.sendEmail(
            adminEmail,
            `EMERGENCY: SOS Triggered by ${driverName}`,
            `Driver: ${driverName}\nVehicle: ${vehiclePlate}\nPhrase: ${detectedPhrase}\nLocation: ${location.lat}, ${location.lng}\nTimestamp: ${sosEvent.timestamp}`
        );

        // Voice Call
        await NotificationService.sendVoiceCall(
            adminPhone,
            `Attention. Emergency detected from driver ${driverName}. Please check your dashboard immediately.`
        );

        res.status(201).json({
            success: true,
            message: 'SOS alert triggered successfully',
            data: sosEvent
        });

    } catch (err) {
        console.error('SOS Trigger Error:', err.message);
        res.status(500).json({ message: 'Internal server error triggering SOS' });
    }
};

export const getSOSHistory = async (req, res) => {
    try {
        const history = await SOS.find().populate({
            path: 'driver',
            populate: { path: 'user' }
        }).sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching SOS history' });
    }
};
