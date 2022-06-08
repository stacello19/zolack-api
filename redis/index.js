const Redis = require('redis');
const redisClient = Redis.createClient();

redisClient.connect();

redisClient.on('connect', function() {
  console.log('Redis is Connected!');
});


redisClient.on('error', (err) => {
  console.log('REDIS ERROR: ', err);
});

module.exports = { redisClient };