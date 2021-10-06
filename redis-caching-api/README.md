# Redis caching API response
Simple caching example using *Redis* and some trivial *API* endpoint. Slow *API* responses are primary target when it comes to caching data.
The same logic can be applied for any other, relational or not, database.

## Prerequisites
- **Node.js**    
```bash
$ apt install nodejs
```

- **npm** (*Node Package Manager*)
```bash
$ apt install npm
```

- **Redis**
```bash
$ apt install redis-server
```

## Set Caching Evcition Policy and limit the available memory

Configure the *Redis* server to use to appropriate [Eviction Policy](https://redis.io/topics/lru-cache), as well as to have the *RAM* limit.

```bash
nano /etc/redis/redis.conf
```

Change/Update the following configuration:
```
maxmemory 100mb
maxmemory-policy volatile-lru
```

Note that there is no difference between using the *volatile-lru* and *allkeys-lru* policy for this example since we're generating only expiration keys (keys with *TTL* set).

## Trying out the application

Clone the repository to your computer:

```bash
$ git clone https://github.com/squirrelosopher/redis-caching/redis-caching-api
```

Navigate to the project folder:
```bash
$ cd redis-caching-api
```

Install dependencies:
```bash
$ npm install 
```

## Running the example(s)

### `weather_api.js`

The code is demonstrating *HTTP* response caching using *Redis*. It fetches the weather data for the given city either as the *HTTP* response (**cache miss**) or from the *Redis* server (**cache hit**).
Timing is collected during the request execution and added to the returned *JSON* Object.

Ensure that the *Redis* is running, then run the:
```bash
$ node weather_api.js -n <city_name>
```

Since there is no cache entry, the program will retrieve the data via *HTTP* request.

```bash
$ node weather_api.js -n 'Belgrade'
{
  data: {
    coord: { lon: 20.4651, lat: 44.804 },
    weather: [ [Object] ],
    base: 'stations',
    main: {
      temp: 56.01,
      feels_like: 54.7,
      temp_min: 54.46,
      temp_max: 56.86,
      pressure: 1017,
      humidity: 72
    },
    visibility: 10000,
    wind: { speed: 17.27, deg: 130 },
    rain: { '1h': 0.21 },
    clouds: { all: 75 },
    dt: 1633552749,
    sys: {
      type: 2,
      id: 2039045,
      country: 'RS',
      sunrise: 1633495322,
      sunset: 1633536613
    },
    timezone: 7200,
    id: 792680,
    name: 'Belgrade',
    cod: 200
  },
  source: 'API',
  responseTime: '133ms'
}

```

The code will have a placed a copy of the entry in the *Redis* cache, so the next program execution will return data from the cache, resulting in much faster data retrieval.

```bash
$ node popular_movie.js -f '2000-01-01' -t '2020-01-01'
{
  data: {
    coord: { lon: 20.4651, lat: 44.804 },
    weather: [ [Object] ],
    base: 'stations',
    main: {
      temp: 56.01,
      feels_like: 54.7,
      temp_min: 54.46,
      temp_max: 56.86,
      pressure: 1017,
      humidity: 72
    },
    visibility: 10000,
    wind: { speed: 17.27, deg: 130 },
    rain: { '1h': 0.21 },
    clouds: { all: 75 },
    dt: 1633552749,
    sys: {
      type: 2,
      id: 2039045,
      country: 'RS',
      sunrise: 1633495322,
      sunset: 1633536613
    },
    timezone: 7200,
    id: 792680,
    name: 'Belgrade',
    cod: 200
  },
  source: 'cache',
  responseTime: '7ms'
}
```

### `help`

You can always use the *help* parameter to get around with the program usage.
```bash
$ node weather_api.js --help
```

## Check for Redis server

To check whether the server is running or not, you can use the command:
```bash
$ service redis-server status
```

The following commands are for starting, stopping and restarting the Redis server respectively:

```bash
$ service redis-server start
```

```bash
$ service redis-server stop
```

```bash
$ service redis-server restart
```

## Change the Environment variables

If you have *Redis* set up and running on another host and/or port, or you want to specify a different *API* key, you can update it inside the **.env** file:

```
# If left out, environment variables have the default value set in constants.js file.

# Specifies port on which the Redis server is running
REDIS_PORT=6379

# Specifies host address on which the Redis server is running
REDIS_HOST=127.0.0.1

# Specifies the API key for the https://openweathermap.org/
WEATHER_API_KEY=aea864465325d76434ef9b28a2831f4e
```

## API Information

The *API* used in the example for data fetching is [OpenWeatherMap API](https://openweathermap.org/api). With free registration, the free pricing plan is offering a decent amount of available *API* calls per minute, enough for testing purposes.