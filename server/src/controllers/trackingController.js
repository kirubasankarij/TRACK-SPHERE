import Shipment from '../models/Shipment.js';
import DeliveryProof from '../models/DeliveryProof.js';
import AIService from '../services/aiService.js';
import OTPService from '../services/otpService.js';
import NotificationService from '../services/notificationService.js';
import { getIO } from '../socket.js';

export const getTrackingInfo = async (req, res, next) => {
    try {
        const trackingNumber = req.params.trackingNumber;

        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            const shipment = await MockShipment.findOne({ trackingNumber });
            if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });
            return res.json(shipment);
        }

        const shipment = await Shipment.findOne({ trackingNumber })
            .populate('assignedDriver')
            .populate('assignedVehicle');

        if (shipment) {
            return res.json(shipment);
        }

        // Fallback: check demo/mock data for demo tracking IDs
        const isDemoId = trackingNumber.startsWith('TF-') || trackingNumber.startsWith('TRK-');
        if (isDemoId) {
            const { MockShipment } = await import('../models/mocks.js');
            const demoShipment = await MockShipment.findOne({ trackingNumber });
            if (demoShipment) return res.json(demoShipment);
        }

        return res.status(404).json({ msg: 'Shipment not found' });
    } catch (err) {
        next(err);
    }
};

export const updateTracking = async (req, res, next) => {
    try {
        const { trackingNumber, status, location, weatherCondition, trafficLevel } = req.body;

        let shipment;
        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            shipment = await MockShipment.findOne({ trackingNumber });
        } else {
            shipment = await Shipment.findOne({ trackingNumber });
        }

        if (!shipment) {
            return res.status(404).json({ msg: 'Shipment not found' });
        }

        // AI Delay Prediction
        if (status === 'in-transit' && location) {
            const aiFeatures = {
                trafficLevel: trafficLevel || 'moderate',
                weatherCondition: weatherCondition || 'clear',
                distance: 100, // In real app, calculate from current pos to destination
                historicalAverageDelay: 20
            };
            const prediction = AIService.predictDelay(aiFeatures);
            shipment.predictedDelay = prediction.predictedDelay;
            shipment.delayProbability = prediction.delayProbability;

            if (prediction.predictedDelay > 20) {
                await NotificationService.sendNotification({
                    userId: shipment.customer || shipment.customerRef,
                    type: 'DELAY_PREDICTION',
                    title: 'Potential Delay Detected',
                    message: `AI analysis predicts a ${prediction.predictedDelay} min delay for ${trackingNumber} due to ${prediction.reason}.`,
                    metadata: { trackingNumber, predictedDelay: prediction.predictedDelay }
                });
            }
        }

        shipment.status = status;
        shipment.history.push({
            status,
            location,
            timestamp: new Date(),
            details: `Updated to ${status} at ${location}`
        });

        // Generate OTP if out for delivery
        if (status === 'out-for-delivery') {
            const otp = OTPService.generateOTP();
            
            if (process.env.DEMO_MODE === 'true') {
                shipment.deliveryOTP = otp; // Store for verification
                console.log(`[DEMO] Generated OTP for ${trackingNumber}: ${otp}`);
            } else {
                await DeliveryProof.create({
                    shipment: shipment._id,
                    otp: otp
                });
            }
            
            // Mock sending OTP
            await OTPService.sendOTP('CUSTOMER_PHONE', otp);
        }

        if (process.env.DEMO_MODE !== 'true') {
            await shipment.save();
        }

        // Emit real-time update via Socket.io
        const io = getIO();
        if (io) {
            const shipmentId = shipment._id?.toString() || 'demo';
            io.to(shipmentId).emit('statusUpdate', {
                status,
                location,
                predictedDelay: shipment.predictedDelay,
                delayProbability: shipment.delayProbability,
                timestamp: new Date()
            });
        }

        res.json(shipment);
    } catch (err) {
        next(err);
    }
};

export const verifyDelivery = async (req, res, next) => {
    try {
        const { trackingNumber, otp } = req.body;

        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            const shipment = await MockShipment.findOne({ trackingNumber });
            if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });

            if (shipment.deliveryOTP !== otp && otp !== '123456') {
                return res.status(400).json({ msg: 'Invalid or expired OTP' });
            }

            shipment.status = 'delivered';
            shipment.history.push({
                status: 'delivered',
                location: 'Destination',
                timestamp: new Date(),
                details: 'Delivered successfully with OTP verification (DEMO)'
            });
            return res.json({ success: true, shipment });
        }

        const shipment = await Shipment.findOne({ trackingNumber });
        if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });

        const proof = await DeliveryProof.findOne({ shipment: shipment._id, isVerified: false }).sort({ createdAt: -1 });
        if (!proof || proof.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        proof.isVerified = true;
        proof.verifiedAt = new Date();
        await proof.save();

        shipment.status = 'delivered';
        shipment.history.push({
            status: 'delivered',
            location: 'Destination',
            timestamp: new Date(),
            details: 'Delivered successfully with OTP verification'
        });
        await shipment.save();

        res.json({ success: true, shipment });
    } catch (err) {
        next(err);
    }
};
export const reportDelay = async (req, res, next) => {
    try {
        const { trackingNumber, reason, estimatedMinutes } = req.body;

        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            const shipment = await MockShipment.findOne({ trackingNumber });
            if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });

            shipment.status = 'delayed';
            shipment.predictedDelay = parseInt(estimatedMinutes);
            shipment.aiAnalysis = {
                reason: `Manual report: ${reason}`,
                insight: `Driver reported a slowdown. New ETA recalculated.`,
                impact: 'moderate'
            };
            shipment.history.push({
                status: 'delayed',
                location: shipment.routePoints?.[shipment.routePoints.length - 1]?.location || 'In Transit',
                timestamp: new Date(),
                details: `Driver reported delay: ${reason}. EST: +${estimatedMinutes} mins`
            });

            return res.json({ success: true, shipment });
        }

        const shipment = await Shipment.findOne({ trackingNumber });
        if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });

        shipment.status = 'delayed';
        shipment.predictedDelay = parseInt(estimatedMinutes);
        shipment.history.push({
            status: 'delayed',
            location: 'Current Location',
            timestamp: new Date(),
            details: `Manual Delay Report: ${reason}. Expected delay: ${estimatedMinutes} mins`
        });

        await shipment.save();

        const io = getIO();
        if (io) {
            const shipmentId = shipment._id?.toString() || 'demo';
            io.to(shipmentId).emit('statusUpdate', {
                status: 'delayed',
                reason,
                predictedDelay: shipment.predictedDelay,
                timestamp: new Date()
            });
        }

        await NotificationService.sendNotification({
            userId: shipment.customer || shipment.customerRef,
            type: 'DELAY_REPORT',
            title: 'Shipment Delayed',
            message: `Driver reported a delay for ${trackingNumber}: ${reason}. New ETA updated.`,
            metadata: { trackingNumber, reason, estimatedMinutes }
        });

        res.json({ success: true, shipment });
    } catch (err) {
        next(err);
    }
};
