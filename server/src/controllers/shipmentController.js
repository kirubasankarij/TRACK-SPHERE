export const createShipment = async (req, res, next) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            const shipment = await MockShipment.create(req.body);
            return res.status(201).json({ success: true, data: shipment });
        }
        const shipment = new Shipment(req.body);
        await shipment.save();
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
        const shipments = await Shipment.find();
        res.json({ success: true, data: shipments });
    } catch (err) {
        next(err);
    }
};

export const getShipmentById = async (req, res, next) => {
    try {
        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            const shipment = await MockShipment.findOne({ trackingNumber: req.params.id });
            if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });
            return res.json({ success: true, data: shipment });
        }
        const shipment = await Shipment.findById(req.params.id);
        if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });
        res.json({ success: true, data: shipment });
    } catch (err) {
        next(err);
    }
};

export const updateShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });
        res.json({ success: true, data: shipment });
    } catch (err) {
        next(err);
    }
};

export const deleteShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findByIdAndDelete(req.params.id);
        if (!shipment) return res.status(404).json({ msg: 'Shipment not found' });
        res.json({ success: true, message: 'Shipment deleted' });
    } catch (err) {
        next(err);
    }
};
