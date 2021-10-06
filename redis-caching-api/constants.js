require('dotenv').config();

module.exports = {
    'redis': {
        'port': process.env.REDIS_PORT || 6379, /* Redis Server Port */
        'host': process.env.REDIS_HOST || '127.0.0.1' /* Redis Server Host Address */
    },
    'weather_api_key': process.env.WEATHER_API_KEY || 'aea864465325d76434ef9b28a2831f4e' /* API key */
}