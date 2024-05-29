const app = require('./app');
const db = require("./config/db");
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

        db.connect((err) => {
            if (err) {
                console.log("Failed to connect to AWS RDS:", err.message);
                return;
            }
            console.log("Successfully connected to AWS RDS database");
            app.listen(process.env.PORT || 4000, () => {
                console.log(`Server is running on port ${process.env.PORT || 4000}`);
            });
        });
    } catch (err) {
        console.error('Failed to connect to Redis', err);
    }
})();
