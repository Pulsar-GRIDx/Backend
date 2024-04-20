// Configure dotenv
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
const validator = require('validator');

dotenv.config();

// Using `process.env` directly
function authenticateToken(req, res, next) {
  const token = req.cookies.accessToken;

  if (!token) {
      return res.status(401).send('Unauthorized');
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
          if (err.name === 'TokenExpiredError') {
              return res.status(401).send('Token expired');
          } else {
              return res.status(403).send('Forbidden');
          }
      }

      // Token is valid
      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          return res.status(401).send('Token expired');
      }

      // Token is not expired, attach user object to request for future use
      req.user = decoded;

      next();
  });
}

// Email Validation
const validateEmail = (Email) => validator.isEmail(Email);

module.exports = { authenticateToken, validateEmail };