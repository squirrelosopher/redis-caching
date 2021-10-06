const constants = require('./constants'); /* for database and Redis constants */
const redis = require('ioredis'); /* for working with Redis */
const sqlite3 = require('sqlite3'); /* for working with SQLite3 database (doesn't support async calls) */
const { open } = require('sqlite'); /* SQLite3 wrapper so async calls could be made */
const yargs = require('yargs'); /* for user-specified, passed, arguments */

const { argv } = yargs
  .scriptName("node popular_movie.js")
  .usage("Usage: $0 -f <from_date> -t <to_date>")
  .example(
    "$0 -f '2000-01-01' -t '2020-12-25'",
    "Returns the most popular movie in the specified period (Between 2000-01-01 and 2020-12-25)"
  )
  .option("f", {
    alias: "fromDate",
    describe: "From what date to include the most popular movie lookup",
    demandOption: "The starting date is required",
    type: "string",
    nargs: 1,
  })
  .option("t", {
    alias: "toDate",
    describe: "To what date to include the most popular movie lookup",
    demandOption: "The ending date is required",
    type: "string",
    nargs: 1,
  })
  .option("c", {
    alias: "clear",
    describe: "Clears out all of the stored key-value pairs in the Redis",
    type: "boolean"
  })
  .version("version", "Show the application version")
  .help("help", "Show this help");

/* create a Redis client in order to perform operations on the Redis server */
const redisClient = redis.createClient(constants.redis.port, constants.redis.host); /* connection refused error if the Redis server isn't running on the specified host and port */

/* a query fro retrieving most popular movie in a specified period */
const mp_movie_sql = `SELECT original_title, MAX(popularity) as popularity
                      FROM movies
                      WHERE release_date BETWEEN (?) AND (?)
                      GROUP BY id, original_title
                      ORDER BY popularity DESC
                      LIMIT 1`;

/* returns most popular movie in a specified period */
const getMostPopularMovie = async (startDate, endDate) => {
  /* dynamically generate the cache key */
  const cacheKey = `popular:${startDate}:${endDate}`;

  /* check Redis for cached entry first */
  let cacheEntry = await redisClient.get(cacheKey);

  /* if Redis returns a cache hit use the value, otherwise read from the databse */
  if (cacheEntry) {
    let data = {
        data: JSON.parse(cacheEntry) /* converting to JSON since the object was stringified */
    };

    /* return the entry */
    return { ...data, source : 'cache'}
  }

  /* open a DB connection. */
  const db = await createDbConnection(constants.db_filename);

  /* perform the query and get the value from the database */
  const dbEntry = await db.get(mp_movie_sql, [startDate, endDate]);

  /* add the entry we pulled from the database to the cache, with expiration (single day) */
  redisClient.setex(cacheKey, 60 * 60 * 24, JSON.stringify(dbEntry));

  /* return the database entry */
  let data = {
    data: dbEntry
  }

  return { ...data, source : 'database'}
}

/* connect to a database */
function createDbConnection(filename) {
  return open({
    filename,
    driver: sqlite3.Database
  });
}

async function main() {
  const { fromDate, toDate, clear } = argv;

  /* clear out all the key-value pairs stored in Redis if such was specified */
  if (clear) {
    redisClient.flushall('ASYNC');
  }

  const t0 = new Date().getTime();
  const result = await getMostPopularMovie(fromDate, toDate);
  const t1 = new Date().getTime();

  result.responseTime = `${t1-t0}ms`; /* elapsed time */
  console.log(result);

  /* disconnect from the Redis server */
  redisClient.quit();
}

main();