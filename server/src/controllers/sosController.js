import mongoose from 'mongoose';
import SOS from '../models/SOS.js';
import Driver from '../models/Driver.js';
import NotificationService from '../services/notificationService.js';
import { getIO } from '../socket.js';

// In-memory fallback history for DEMO MODE or offline DB
const demoSOSHistory = [];

export const triggerSOS = async (req, res) => {
    try {
        let { driverId, location, detectedPhrase, driverName, issueType, details, alertType } = req.body;

        detectedPhrase = detectedPhrase || details || issueType || 'Emergency Alert Triggered';
        alertType = alertType || (detectedPhrase.toLowerCase().includes('closed') || detectedPhrase.toLowerCase().includes('drowsy') ? 'drowsy' : 'sos');

        if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
            location = { lat: 13.0827, lng: 80.2707 }; // Default location if missing
        }

        let vehiclePlate = 'TN-01-AX-1234';
        driverName = driverName || 'Master Driver (Raj Kumar)';
        let resolvedDriverId = driverId || new mongoose.Types.ObjectId();

        const isDbConnected = mongoose.connection.readyState === 1 && process.env.DEMO_MODE !== 'true';

        if (isDbConnected) {
            try {
                let driver;
                if (driverId && mongoose.Types.ObjectId.isValid(driverId)) {
                    driver = await Driver.findById(driverId).populate('user').populate('vehicle');
                }
                if (!driver) {
                    driver = await Driver.findOne().populate('user').populate('vehicle');
                }
                if (driver) {
                    resolvedDriverId = driver._id;
                    driverName = driver?.user?.name || driverName;
                    vehiclePlate = driver?.vehicle?.plateNumber || vehiclePlate;
                }

                const sosEvent = new SOS({
                    driver: resolvedDriverId,
                    location,
                    detectedPhrase
                });
                await sosEvent.save();
            } catch (dbErr) {
                console.warn('Could not persist SOS to MongoDB:', dbErr.message);
            }
        }

        const alertData = {
            id: new mongoose.Types.ObjectId().toString(),
            driverName,
            driverId: resolvedDriverId,
            vehiclePlate,
            location,
            detectedPhrase,
            alertType,
            issueType: issueType || (alertType === 'drowsy' ? '🚨 Driver Drowsiness Alert (Eyes Closed >30s)' : 'Emergency SOS Triggered'),
            timestamp: new Date().toISOString()
        };

        // Add to in-memory history
        demoSOSHistory.unshift(alertData);
        if (demoSOSHistory.length > 50) demoSOSHistory.pop();

        // 2. Emit real-time alert via Socket.io to all admins
        const io = getIO();
        if (io) {
            io.emit('sosAlert', alertData);
            io.emit('driverSafetyAlert', alertData);
            io.emit('newNotification', {
                role: 'admin',
                type: alertType === 'drowsy' ? 'DROWSINESS_ALERT' : 'EMERGENCY_SOS',
                message: alertType === 'drowsy'
                    ? `🚨 CRITICAL SAFETY ALERT: Driver ${driverName} - Eyes Closed (>3s) Detected!`
                    : `🚨 EMERGENCY ALERT: Driver ${driverName} - ${detectedPhrase}`,
                data: alertData,
                timestamp: new Date()
            });
        }

        // 3. Trigger Notifications (SMS/Email if configured)
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@tracksphere.com';
        const adminPhone = process.env.ADMIN_PHONE || '+919894965291';

        try {
            await NotificationService.sendSMS(
                adminPhone,
                `EMERGENCY ALERT! Driver ${driverName} (${vehiclePlate}) alert: "${detectedPhrase}". Location: ${location.lat}, ${location.lng}`
            );
            await NotificationService.sendEmail(
                adminEmail,
                `EMERGENCY: Safety Alert for ${driverName}`,
                `Driver: ${driverName}\nVehicle: ${vehiclePlate}\nAlert: ${detectedPhrase}\nLocation: ${location.lat}, ${location.lng}\nTimestamp: ${alertData.timestamp}`
            );
        } catch (notifErr) {
            console.warn('Notification service dispatch skipped/failed non-fatally:', notifErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'SOS / Drowsiness alert triggered successfully',
            data: alertData
        });

    } catch (err) {
        console.error('SOS Trigger Error:', err.message);
        res.status(500).json({ message: 'Internal server error triggering SOS' });
    }
};

export const getSOSHistory = async (req, res) => {
    try {
        const isDbConnected = mongoose.connection.readyState === 1 && process.env.DEMO_MODE !== 'true';
        if (isDbConnected) {
            const history = await SOS.find().populate({
                path: 'driver',
                populate: { path: 'user' }
            }).sort({ timestamp: -1 });
            return res.json(history);
        }
        res.json(demoSOSHistory);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching SOS history' });
    }
};
