import BaseAdapter from './baseAdapter.js';

export default class MockAdapter extends BaseAdapter {
    async getTracking(trackingNumber) {
        console.log(`Mock: Fetching tracking for ${trackingNumber}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const statuses = ['pending', 'in-transit', 'delivered', 'exception'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        return this.formatResponse({
            trackingNumber,
            status: randomStatus,
            location: 'MOCK_FACILITY_01',
            history: [
                { status: 'pending', location: 'ORIGIN', timestamp: new Date(Date.now() - 86400000) },
                { status: 'in-transit', location: 'HUB_A', timestamp: new Date() }
            ]
        });
    }

    async validateTrackingNumber(trackingNumber) {
        return trackingNumber.startsWith('TF');
    }
}
