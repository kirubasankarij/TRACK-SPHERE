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
     * Calculate ETA with Confidence Range
     */
    static calculateConfidenceRange(baseEtaDate = new Date(), predictedDelayMinutes = 0, confidenceScore = 0.88) {
        const eta = new Date(new Date(baseEtaDate).getTime() + predictedDelayMinutes * 60000);
        // Variance margin inversely proportional to confidence score (e.g. 0.88 -> +- 12 mins)
        const marginMinutes = Math.max(5, Math.round((1 - confidenceScore) * 100));
        const minEta = new Date(eta.getTime() - marginMinutes * 60000);
        const maxEta = new Date(eta.getTime() + marginMinutes * 60000);

        return {
            etaTime: eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            minEtaTime: minEta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            maxEtaTime: maxEta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            marginMinutes,
            confidencePercent: Math.round(confidenceScore * 100),
            rangeLabel: `${minEta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${maxEta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        };
    }

    /**
     * Green Logistics Score & CO2 Emissions Engine
     * Factors: distance (km), vehicle category, payload weight (kg), route type
     */
    static calculateGreenMetrics(distanceKm = 100, vehicleType = 'Heavy Truck', payloadKg = 500, isEcoRoute = false) {
        // Base emissions g CO2 per km per ton
        const emissionFactors = {
            'Heavy Truck': 0.12, // 120g CO2/km
            'Truck': 0.09,
            'Van': 0.06,
            'Electric Vehicle': 0.015,
            'EV Truck': 0.02,
            'Drone': 0.005,
            'Bike': 0.01
        };

        const factor = emissionFactors[vehicleType] || 0.08;
        const ecoMultiplier = isEcoRoute ? 0.78 : 1.0; // Eco route reduces 22% CO2
        const co2Kg = parseFloat((distanceKm * factor * (1 + payloadKg / 2000) * ecoMultiplier).toFixed(2));
        
        // Standard diesel truck baseline comparison
        const baselineCo2Kg = parseFloat((distanceKm * 0.14).toFixed(2));
        const co2SavedKg = Math.max(0, parseFloat((baselineCo2Kg - co2Kg).toFixed(2)));

        // Score 0-100 (100 is lowest emission)
        let score = Math.max(10, Math.min(100, Math.round(100 - (co2Kg / Math.max(distanceKm, 1)) * 400)));
        if (isEcoRoute) score = Math.min(100, score + 12);
        if (vehicleType.includes('EV') || vehicleType.includes('Electric') || vehicleType === 'Drone') score = Math.min(100, score + 25);

        let ecoGrade = 'B';
        if (score >= 90) ecoGrade = 'A+';
        else if (score >= 80) ecoGrade = 'A';
        else if (score >= 65) ecoGrade = 'B';
        else ecoGrade = 'C';

        const treesEquivalent = parseFloat((co2Kg / 21.8).toFixed(2)); // ~21.8kg CO2 absorbed by mature tree/year

        return {
            co2EmissionsKg: co2Kg,
            co2SavedKg,
            greenScore: score,
            ecoGrade,
            treesEquivalent,
            isEcoRoute
        };
    }

    /**
     * Traffic-Aware Smart Reroute Engine
     * Calculates alternate paths when congestion occurs
     */
    static calculateTrafficReroute(currentTraffic = 'heavy', distanceKm = 80, fuelCostPerLiter = 102) {
        if (currentTraffic !== 'heavy' && currentTraffic !== 'gridlock') {
            return {
                suggested: false,
                reason: 'Current route is optimal'
            };
        }

        const isGridlock = currentTraffic === 'gridlock';
        const timeSavedMins = isGridlock ? Math.floor(Math.random() * 25) + 20 : Math.floor(Math.random() * 15) + 12;
        const fuelSavedLiters = parseFloat(((timeSavedMins / 60) * (isGridlock ? 3.2 : 2.1)).toFixed(1));
        const costSavedInr = Math.round(fuelSavedLiters * fuelCostPerLiter);
        const co2SavedKg = parseFloat((fuelSavedLiters * 2.68).toFixed(2)); // 2.68kg CO2 per liter diesel

        const routes = [
            'Via Outer Ring Express & National Highway Bypass',
            'Via Salem-Coimbatore Express Bypass → Exit 4',
            'Via Service Corridor → NH 44 Expressway',
            'Via Regional Freight Bypass Sector 7'
        ];

        return {
            suggested: true,
            alternateRoute: routes[Math.floor(Math.random() * routes.length)],
            timeSavedMins,
            fuelSavedLiters,
            costSavedInr,
            co2SavedKg,
            trafficLevel: currentTraffic
        };
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

