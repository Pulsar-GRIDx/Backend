// Configure dotenv
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
const validator = require('validator');

dotenv.config();
const environment = process.env;

// Using `process.env` directly
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).send('Unauthorized');
  }


  const tokenParts = authHeader.split(' ');

  
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).send('Unauthorized');
  }

 
  const token = tokenParts[1];

  jwt.verify(token, environment.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send('Forbidden');
    }

    
    
    next();
  });
}

// Email Validation
const validateEmail = (Email) => validator.isEmail(Email);

module.exports = { authenticateToken, validateEmail };
