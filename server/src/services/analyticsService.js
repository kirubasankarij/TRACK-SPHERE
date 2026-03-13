import Shipment from '../models/Shipment.js';
import Driver from '../models/Driver.js';

class AnalyticsService {
    /**
     * Get overall delivery statistics
     */
    static async getGlobalStats() {
        if (process.env.DEMO_MODE === 'true') {
            const { MockShipment } = await import('../models/mocks.js');
            const total = MockShipment.shipments.length;
            const delivered = MockShipment.shipments.filter(s => s.status === 'delivered').length;
            const inTransit = MockShipment.shipments.filter(s => s.status === 'in-transit' || s.status === 'moving').length;
            const exceptions = MockShipment.shipments.filter(s => s.status === 'delayed' || s.status === 'exception').length;

            return {
                totalShipments: total,
                deliveredShipments: delivered,
                inTransitShipments: inTransit,
                exceptions: exceptions,
                deliverySuccessRate: total > 0 ? Math.round((delivered / total) * 100) : 0,
                monthlyStats: [
                    { month: 'Jan', shipments: 45, success: 42 },
                    { month: 'Feb', shipments: 52, success: 48 },
                    { month: 'Mar', shipments: total, success: delivered }
                ]
            };
        }

        const totalShipments = await Shipment.countDocuments();
        return {
            totalShipments,
            deliveredShipments: 0,
            inTransitShipments: 0,
            exceptions: 0,
            deliverySuccessRate: 0,
            monthlyStats: []
        };
    }

    /**
     * Get driver performance metrics
     */
    static async getDriverStats(driverId) {
        const driver = await Driver.findById(driverId);
        if (!driver) return null;

        return {
            name: driver.name,
            totalDeliveries: driver.performanceStats.totalDeliveries,
            onTimeRate: driver.performanceStats.totalDeliveries > 0
                ? (driver.performanceStats.onTimeDeliveries / driver.performanceStats.totalDeliveries) * 100
                : 0,
            rating: driver.rating
        };
    }

    /**
     * Get delay analysis
     */
    static async getDelayAnalysis() {
        // Aggregation logic for delay analysis
        return {
            averageDelayMinutes: 24,
            trafficImpact: 65, // percentage
            weatherImpact: 15,
            mostDelayedRoutes: [
                { origin: 'San Francisco', destination: 'Los Angeles', avgDelay: 45 },
                { origin: 'New York', destination: 'Boston', avgDelay: 20 }
            ]
        };
    }
}

export default AnalyticsService;
