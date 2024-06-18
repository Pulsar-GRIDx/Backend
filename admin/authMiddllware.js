// Configure dotenv
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
const validator = require('validator');

dotenv.config();


// Using `process.env` directly
function authenticateToken(req, res, next) {
    const authHeader = req.header('Authorization');
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send('Unauthorized');
    }
  
    const token = authHeader.split(' ')[1];
    // Skip authentication for the /signin route
    if (req.path === '/signin') {
    return next();
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          console.error('Token has expired');
          // return res.status(401).send('Token Expired')
          return res.status(401).json({ redirectTo: 'https://admin.gridxmeter.com/' });
        } else {
          return res.status(403).send('Forbidden');
        }
      }
  
      // Token is valid, attach user object to request for future use
      req.user = decoded;
      next();
    });
  }
  

// Email Validation
const validateEmail = (email) => validator.isEmail(email);

module.exports = { authenticateToken, validateEmail };
