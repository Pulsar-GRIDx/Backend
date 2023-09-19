const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');



//Get Signin router
router.get('/signin', (req, res) => {
    res.sendFile(__dirname + '/signin.html');
  });

  //Get Signup router
  router.get('/signup', (req, res) => {
    res.status(200).json({ message: 'Welome' });
  });

  //Get protected router 
  router.get('/protected', (req, res) => {
    res.status(200).json({ message: 'Welome' });
  });

  //Get userProfile router
  router.get('/profile/:userId', (req, res) => {
    const userId = req.params.userId;
  
    // Query the database to retrieve user profile
    db.query('SELECT full_name, email,role FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error retrieving user profile:', err);
        return res.status(500).json({ error: 'Failed to fetch user profile' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Send the user profile data as JSON response
      const userProfile = results[0];
      res.status(200).json(userProfile);
    });
  });

  module.exports = router;