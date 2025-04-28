const redis = require('redis');
const {redisHost} = require('../config/config');
const cacheClient = redis.createClient({
  host: redisHost,
  port: 6380
});

function setProductToCache(key, value, ttl = 3600) 
{
  cacheClient.setex(key, ttl, value);
}

function getProductFromCache(key) 
{
  return new Promise((resolve, reject) => {
    cacheClient.get(key, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

function invalidateCache(key)
{
  cacheClient.del(key, (err, response) => {
    if (err) console.error('Error invalidating cache:', err);
    else console.log(`Cache invalidated for key: ${key}`);
  });
}

module.exports = {getProductFromCache,setProductToCache,invalidateCache};
