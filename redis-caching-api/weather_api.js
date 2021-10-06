const constants = require('./constants'); /* for database and Redis constants */
const redis = require('ioredis'); /* for working with Redis */
const axios = require('axios'); /* for fetching HTTP data */
const yargs = require('yargs'); /* for user-specified, passed, arguments */

const { argv } = yargs
  .scriptName("node weather_api.js")
  .usage("Usage: $0 -n <city_name>")
  .example(
    "$0 -n 'Belgrade'",
    "Returns the weather data (from the OpenWeatherMap API) for the specified city"
  )
  .option("n", {
    alias: "cityName",
    describe: "For which city the data is fetched",
    demandOption: "he name of the city is required",
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

/* HTTP endpoint for the weather data of the specified city */
const cityEndpoint = (city) => `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${constants.weather_api_key}`;
/* create a Redis client in order to perform operations on the Redis server */
const redisClient = redis.createClient(constants.redis.port, constants.redis.host); /* connection refused error if the Redis server isn't running on the specified host and port */

/* returns weather data for the specified city */
const getWeatherData = async (cityName) => {
  /* dynamically generate the cache key */
  const cacheKey = `weather:${cityName}`;

  /* check Redis for cached entry first */
  let cacheEntry = await redisClient.get(cacheKey);

  /* if Redis returns a cache hit use the value, otherwise fetch from the HTTP endpoint */
  if (cacheEntry) {
    let data = {
        data: JSON.parse(cacheEntry) /* converting to JSON since the object was stringified */
    };

    /* return the cache entry */
    return { ...data, source : 'cache'}
  }

  /* get HTTP response from the weather API */
  const apiResponse = await axios.get(cityEndpoint(cityName));

  /* add the fetched data to the cache, with expiration (hour) */
  redisClient.setex(cacheKey, 60 * 60, JSON.stringify(apiResponse.data));

  /* return the fetched weather data */
  let data = {
    data: apiResponse.data
  }

  return { ...data, source : 'API'}
}

async function main() {
  const { cityName, clear } = argv;

  /* clear out all the key-value pairs stored in Redis if such was specified */
  if (clear) {
    redisClient.flushall('ASYNC');
  }

  const t0 = new Date().getTime();
  const result = await getWeatherData(cityName);
  const t1 = new Date().getTime();

  result.responseTime = `${t1-t0}ms`; /* elapsed time */
  console.log(result);

  /* disconnect from the Redis server */
  redisClient.quit();
}

main();