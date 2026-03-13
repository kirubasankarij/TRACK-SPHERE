import Shipment from '../models/Shipment.js';

export const getDashboardStats = async (req, res, next) => {
    try {
        const total = await Shipment.countDocuments();
        const delivered = await Shipment.countDocuments({ status: 'delivered' });
        const inTransit = await Shipment.countDocuments({ status: 'in-transit' });
        const pending = await Shipment.countDocuments({ status: 'pending' });

        res.json({
            total,
            delivered,
            inTransit,
            pending
        });
    } catch (err) {
        next(err);
    }
};

export const getCarrierPerformance = async (req, res, next) => {
    try {
        const performance = await Shipment.aggregate([
            { $group: { _id: "$carrier", count: { $sum: 1 } } }
        ]);
        res.json(performance);
    } catch (err) {
        next(err);
    }
};
