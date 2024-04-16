const jwt = require('jsonwebtoken');
const sessionStorage = require('sessionstorage');
const dotenv = require('dotenv');

// Configure dotenv
dotenv.config();
const environment = process.env;

function authenticateToken(req, res, next) {
    try {
        const token = sessionStorage.getItem('token');

        if (!token) {
            return res.sendStatus(401); // Unauthorized
        }

        jwt.verify(token, environment.SECRET_KEY, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(403).send({ error: 'Token expired' }); // Forbidden
                }
                return res.status(403).send({ error: 'Failed to authenticate token' }); // Forbidden
            }

            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Error authenticating token:', error);
        return res.status(500).send({ error: 'Internal Server Error' }); // Internal Server Error
    }
}

module.exports = authenticateToken;
