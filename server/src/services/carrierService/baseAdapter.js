export default class BaseAdapter {
    constructor(config) {
        this.config = config;
    }

    async getTracking(trackingNumber) {
        throw new Error('Method getTracking() must be implemented');
    }

    async validateTrackingNumber(trackingNumber) {
        throw new Error('Method validateTrackingNumber() must be implemented');
    }

    formatResponse(data) {
        // Standardize carrier-specific response to TrackFlow format
        return {
            trackingNumber: data.trackingNumber,
            status: data.status,
            location: data.location,
            timestamp: new Date(),
            history: data.history || []
        };
    }
}
