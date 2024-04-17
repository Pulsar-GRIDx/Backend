// Configure dotenv
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
const validator = require('validator');

dotenv.config();

// Using `process.env` directly
function authenticateToken(req, res, next) {
  const token = req.query.accessToken;

  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send('Forbidden');
    }

    req.user = user;
    next();
  });
}

// Email Validation
const validateEmail = (Email) => validator.isEmail(Email);

module.exports = { authenticateToken, validateEmail };
