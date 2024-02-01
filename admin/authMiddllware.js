// Configure dotenv
const dotenv = require('dotenv');
dotenv.config();
const config = process.env;
const environment = process.env;



function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = req.query.token || (authHeader && authHeader.split(' ')[1]);
  
    if (token == null) {
      return res.sendStatus(401);
    }
  
    jwt.verify(token, environment.SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
  
      req.user = user;
      next();
    });
  }
  
  const validateEmail = (Email) => {
    if (!validator.isEmail(Email)) {
      return false;
    }
    return true;
  };

  module.exports = authenticateToken;