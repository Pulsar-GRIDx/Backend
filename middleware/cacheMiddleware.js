const redis = require('redis');

const redisClient = redis.createClient({
    url: 'redis://backend1.gridxmeter.com:6379' // Adjust if Redis is not running on localhost
});

redisClient.on('error', (err) => {
    console.error('Redis client error', err);
});

(async () => {
    try {
        await redisClient.connect();
        console.log('Redis client connected');
    } catch (err) {
        console.error('Failed to connect to Redis', err);
    }
})();

const cacheMiddleware = async (req, res, next) => {
    const key = req.originalUrl;

    try {
        const cachedResponse = await redisClient.get(key);

        if (cachedResponse) {
            return res.send(JSON.parse(cachedResponse));
        } else {
            res.sendResponse = res.send;
            res.send = async (body) => {
                await redisClient.set(key, JSON.stringify(body), {
                    EX: 3600 // TTL in seconds
                });
                res.sendResponse(body);
            };
            next();
        }
    } catch (err) {
        console.error('Redis error', err);
        next(); // Proceed without caching in case of an error
    }
};

module.exports = cacheMiddleware;
