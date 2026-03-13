import Fuel from '../models/Fuel.js';

export const addFuelLog = async (req, res, next) => {
    try {
        const { station, amount, cost, mileage } = req.body;
        const fuelLog = await Fuel.create({
            driver: req.user.driverId, // Assuming req.user.driverId is populated by auth middleware
            station,
            amount,
            cost,
            mileage
        });
        res.status(201).json({ success: true, data: fuelLog });
    } catch (err) {
        next(err);
    }
};

export const getFuelLogs = async (req, res, next) => {
    try {
        const logs = await Fuel.find({ driver: req.user.driverId }).sort({ date: -1 });
        res.json({ success: true, data: logs });
    } catch (err) {
        next(err);
    }
};
