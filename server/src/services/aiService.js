/**
 * AI Service for Predictive Logistics
 * Includes: Regression Model for Delay Prediction, Smart ETA, and Route Optimization
 */

class AIService {
    /**
     * Predictive delay based on historical data, weather, and traffic.
     * Uses a simple linear regression representation for demonstration.
     * Logic: Delay = (BaseDelay * TrafficFactor) + WeatherPenalty + DistanceFactor
     */
    static predictDelay(features) {
        const { trafficLevel, weatherCondition, distance, historicalAverageDelay } = features;

        let trafficFactor = 1.0;
        switch (trafficLevel) {
            case 'light': trafficFactor = 1.0; break;
            case 'moderate': trafficFactor = 1.2; break;
            case 'heavy': trafficFactor = 1.8; break;
            case 'gridlock': trafficFactor = 3.0; break;
            default: trafficFactor = 1.1;
        }

        let weatherPenalty = 0;
        if (['rain', 'snow', 'storm'].includes(weatherCondition.toLowerCase())) {
            weatherPenalty = 15; // 15 minutes base penalty
        }

        // Regression model parameters (simplified)
        // Y = a + bX1 + cX2...
        const distanceFactor = distance * 0.05; // 3 seconds per km
        const predictedDelay = (historicalAverageDelay * trafficFactor) + weatherPenalty + distanceFactor;

        // Probability calculation
        const probability = Math.min(Math.round((predictedDelay / (historicalAverageDelay + 60)) * 100), 100);

        // Generate descriptive reason
        let reason = "On schedule";
        if (trafficLevel === 'heavy' || trafficLevel === 'gridlock') {
            reason = `Heavy traffic congestion detected at current sector.`;
        } else if (weatherPenalty > 0) {
            reason = `Slowdown due to ${weatherCondition} conditions.`;
        } else if (predictedDelay > historicalAverageDelay + 10) {
            reason = "Minor operational delay in transit.";
        }

        return {
            predictedDelay: Math.round(predictedDelay),
            delayProbability: probability,
            reason: reason,
            confidence: 0.85
        };
    }

    /**
     * Smart ETA Calculation
     * ETA = CurrentTime + BaseTravelTime + PredictedDelay
     */
    static calculateSmartETA(currentLocation, destination, baseSpeedKph = 50) {
        // Mock distance calculation (Haversine simplified)
        const distance = this.calculateDistance(currentLocation, destination);
        const travelTimeMinutes = (distance / baseSpeedKph) * 60;

        return travelTimeMinutes;
    }

    /**
     * Route Optimization using Shortest Path (Mocked Dijkstra/A*)
     * Returns an optimized array of coordinates
     */
    static optimizeRoute(nodes) {
        if (!nodes || nodes.length < 2) return nodes;

        // In a real scenario, this would call a routing engine like OSRM or Google Routes API
        // For demonstration, we'll sort by distance from start
        const start = nodes[0];
        const rest = nodes.slice(1);

        const optimized = [start, ...rest.sort((a, b) => {
            const distA = this.calculateDistance(start, a);
            const distB = this.calculateDistance(start, b);
            return distA - distB;
        })];

        return optimized;
    }

    static calculateDistance(p1, p2) {
        // Simplified Euclidean distance for demo (should be Haversine for GIS)
        return Math.sqrt(Math.pow(p2.lat - p1.lat, 2) + Math.pow(p2.lng - p1.lng, 2)) * 111; // ~111km per degree
    }
}

export default AIService;
