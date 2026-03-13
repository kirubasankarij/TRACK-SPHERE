import axios from 'axios';

/**
 * Weather and Traffic Service
 * Integrates with external APIs for real-time logistics data.
 */

class WeatherTrafficService {
    /**
     * Get real weather data from OpenMeteo API
     */
    static async getWeather(lat, lng) {
        try {
            const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
            const data = response.data.current;

            let condition = 'Clear';
            const code = data.weather_code;
            if (code >= 1 && code <= 3) condition = 'Cloudy';
            else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) condition = 'Rain';
            else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) condition = 'Snow';
            else if (code >= 95 && code <= 99) condition = 'Storm';

            return {
                condition,
                temperature: Math.round(data.temperature_2m),
                humidity: Math.round(data.relative_humidity_2m),
                windSpeed: Math.round(data.wind_speed_10m)
            };
        } catch (err) {
            console.error('Weather API Error:', err.message);
            // Fallback
            return {
                condition: 'Clear',
                temperature: 20,
                humidity: 50,
                windSpeed: 10
            };
        }
    }

    /**
     * Get mock traffic data for a route
     */
    static async getTraffic(start, end) {
        const levels = ['light', 'moderate', 'heavy', 'gridlock'];
        const level = levels[Math.floor(Math.random() * levels.length)];

        let delayMinutes = 0;
        if (level === 'moderate') delayMinutes = 5;
        if (level === 'heavy') delayMinutes = 15;
        if (level === 'gridlock') delayMinutes = 40;

        return {
            level,
            delayMinutes,
            congestionIndex: Math.random() * 100
        };
    }
}

export default WeatherTrafficService;
