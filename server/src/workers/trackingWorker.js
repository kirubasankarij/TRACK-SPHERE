import Queue from 'bull';
import { getAdapter } from '../services/carrierService/index.js';
import Shipment from '../models/Shipment.js';
import { emitStatusUpdate, getIO } from '../socket.js';

const trackingQueue = new Queue('tracking-updates', process.env.REDIS_URL || 'redis://127.0.0.1:6379');

trackingQueue.process(async (job) => {
    const { shipmentId, carrier, trackingNumber } = job.data;
    console.log(`Processing tracking update for ${trackingNumber}`);

    try {
        const adapter = getAdapter(carrier, {}); // Config could be fetched from DB
        const trackingInfo = await adapter.getTracking(trackingNumber);

        const shipment = await Shipment.findByIdAndUpdate(shipmentId, {
            status: trackingInfo.status,
            $push: { history: { status: trackingInfo.status, location: trackingInfo.location, timestamp: new Date() } }
        }, { new: true });

        if (shipment) {
            emitStatusUpdate(shipmentId, {
                status: shipment.status,
                location: trackingInfo.location,
                timestamp: new Date()
            });
        }
    } catch (err) {
        console.error(`Worker Error: ${err.message}`);
        throw err;
    }
});

export default trackingQueue;
