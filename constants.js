require('dotenv').config();

module.exports = {
    'redis': {
        'port': process.env.REDIS_PORT || 6379, /* Redis Server Port */
        'host': process.env.REDIS_HOST || '127.0.0.1' /* Redis Server Host Address */
    },
    'db_filename': process.env.DB_FILENAME || './db/tmdb_5000_movies.db' /* Database location */
}