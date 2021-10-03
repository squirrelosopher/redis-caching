# Redis Caching
Simple caching example using *Redis* and *SQLite* database.
The same logic can be applied for any other, relational or not, database, as well as for the purpose of *HTTP* request(s) caching.

## Prerequisites
- Node.js    
```bash
$ apt install nodejs
```

- npm (Node Package Manager)
```bash
$ apt install npm
```

- Redis
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
$ git clone https://github.com/squirrelosopher/redis-caching
```

Navigate to the project folder:
```bash
$ cd redis-caching
```

Install dependencies:
```bash
$ npm install 
```

## Running the example(s)

### `popular_movie.js`

The code is demonstrating database caching using *Redis*. It retrieves the most popular movie for the given period either from the database (**cache miss**) or from the *Redis* server (**cache hit**).
Timing is collected during the request execution and added to the returned *JSON* Object.

Ensure that the *Redis* is running, then run the:
```bash
$ node popular_movie.js -f <from_date> -t <to_date>
```

Since there is no cache entry, the program will retrieve the data from the database.

```bash
$ node popular_movie.js -f '2000-01-01' -t '2020-01-01'
{
  data: { original_title: 'Minions', popularity: 875.581305 },
  source: 'database',
  responseTime: '27ms'
}
```

The code will have placed a copy of the entry in the *Redis* cache, so the next program execution will return data from the cache, resulting in much faster data retrieval.

```bash
$ node popular_movie.js -f '2000-01-01' -t '2020-01-01'
{
  data: { original_title: 'Minions', popularity: 875.581305 },
  source: 'cache',
  responseTime: '12ms'
}
```

### `help`

You can always use the *help* parameter to get around with the program usage.
```bash
$ node popular_movie.js --help
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

If you have *Redis* set up and running on another host and/or port, or you have changed the location of the database file itself, you can update it inside the **.env** file:

```
# If left out, environment variables have the default value set in constants.js file.

# Specifies port on which the Redis Server is running
REDIS_PORT=6379

# Specifies host address on which the Redis Server is running
REDIS_HOST=127.0.0.1

# Specifies path to a DB file (relative)
DB_FILENAME=./db/tmdb_5000_movies.db
```

## Database Information

The database used in the example is from the [Kaggle](https://www.kaggle.com/tmdb/tmdb-movie-metadata?select=tmdb_5000_movies.csv). The [SQLite precompiled binaries](https://www.sqlite.org/download.html) were used to create database from the *CSV* content.