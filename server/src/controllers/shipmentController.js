import Shipment from '../models/Shipment.js';
import { emitStatusUpdate, emitDriverAssigned } from '../socket.js';

export const createShipment = async (req, res, next) => {
    try {
        const payload = { ...req.body };
        if (!payload.trackingNumber) {
            payload.trackingNumber = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
        }
        if (!payload.status) {
            payload.status = 'Order Created';
        }
        if (!payload.deliveryOTP) {
            payload.deliveryOTP = Math.floor(100000 + Math.random() * 900000).toString();
        }

        if (!payload.history || payload.history.length === 0) {
            payload.history = [{
                status: payload.status,
                location: payload.sender?.address || payload.pickupLocation || 'Warehouse',
                timestamp: new Date(),
                details: 'Order Created by Admin'
            }];
        }

        let shipment;
        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            shipment = await MockShipment.create(payload);
            MockShipment.shipments.unshift(shipment);
        } else {
            shipment = new Shipment(payload);
            await shipment.save();
        }

        // Broadcast real-time Socket.io update to Driver and Customer
        emitStatusUpdate(shipment._id?.toString(), {
            type: 'SHIPMENT_CREATED',
            shipment,
            trackingNumber: shipment.trackingNumber,
            status: shipment.status
        });

        res.status(201).json({ success: true, data: shipment });
    } catch (err) {
        next(err);
    }
};

export const getAllShipments = async (req, res, next) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            const shipments = await MockShipment.find();
            return res.json({ success: true, data: shipments });
        }
        const shipments = await Shipment.find().populate('assignedDriver').populate('assignedVehicle');
        res.json({ success: true, data: shipments });
    } catch (err) {
        next(err);
    }
};

export const getShipmentById = async (req, res, next) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            const shipment = await MockShipment.findOne({ trackingNumber: req.params.id }) ||
                             MockShipment.shipments.find(s => s._id?.toString() === req.params.id);
            if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });
            return res.json({ success: true, data: shipment });
        }
        const shipment = await Shipment.findById(req.params.id).populate('assignedDriver').populate('assignedVehicle');
        if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });
        res.json({ success: true, data: shipment });
    } catch (err) {
        next(err);
    }
};

export const updateShipment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        let shipment;

        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            const found = MockShipment.shipments.find(s => s._id?.toString() === id || s.trackingNumber === id);
            if (found) {
                Object.assign(found, updateData);
                shipment = found;
            }
        } else {
            shipment = await Shipment.findByIdAndUpdate(id, updateData, { new: true }).populate('assignedDriver').populate('assignedVehicle');
        }

        if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });

        // Emit real-time Socket.io update
        emitStatusUpdate(id, {
            type: 'SHIPMENT_UPDATED',
            shipment,
            trackingNumber: shipment.trackingNumber,
            status: shipment.status
        });

        res.json({ success: true, data: shipment });
    } catch (err) {
        next(err);
    }
};

export const deleteShipment = async (req, res, next) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            MockShipment.shipments = MockShipment.shipments.filter(s => s._id?.toString() !== req.params.id);
            return res.json({ success: true, message: 'Shipment deleted' });
        }
        const shipment = await Shipment.findByIdAndDelete(req.params.id);
        if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });
        res.json({ success: true, message: 'Shipment deleted' });
    } catch (err) {
        next(err);
    }
};
