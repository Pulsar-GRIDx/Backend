const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); // Import dotenv
const connection = require("../db");


dotenv.config();
const config = process.env;
const enviroment = process.env;
// Set up Winston logger with console and file transports

// Set up Winston logger with console and file transports
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // You can perform any necessary cleanup here before exiting
  process.exit(1);
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
  // You can perform any necessary cleanup here before exiting
  process.exit(1);
});
//Get Signin router
router.get('/signin', (req, res) => {
    res.sendFile(__dirname + '/signin.html');
  });

  //Get Signup router
  router.get('/signup', (req, res) => {
    res.status(200).json({ message: 'Welome' });
  });

  
// Get user profile router
router.get('/profile/:UserID', (req, res) => {
  const { UserID } = req.params;
  console.log(UserID);

  if (!UserID) {
    return res.status(400).json({ error: 'Invalid UserID' });
  }

  // Query the database to retrieve user profile
  connection.query('SELECT FirstName, Email FROM SystemUsers WHERE UserID = ?', [UserID], (err, results) => {
    if (err) {
      console.error('Error retrieving user profile:', err);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send the user profile data as JSON response
    const userProfile = results[0];
    res.status(200).json({userProfile ,
      redirect: `/protected?token=${encodeURIComponent(token)}`});
});
});




// Router to get all the details of the users from the database
router.get('/allUsers', (req, res) => {
  // Query the database to get the users
  connection.query('SELECT UserID, FirstName,Email,lastName FROM SystemUsers', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Send the list of users as a JSON response
    res.status(200).type({ users: results 
      });
  });
});

router.get('/allAdmins', (req, res) => {
  // Query the database to get the users
  connection.query('SELECT Admin_ID, Username ,FirstName, LastName, Password, Email, IsActive, AccessLevel FROM SystemAdmins', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Send the list of users as a JSON response
    res.status(200).json({ users: results });
  });
});

// Middleware for handling errors
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


  
  module.exports = router;