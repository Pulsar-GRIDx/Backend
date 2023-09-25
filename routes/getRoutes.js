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


  // Get userProfile router
router.get('/profile/:Id', (req, res) => {
  const { Id } = req.params; 
  console.log(Id);
  const resetTokens = {};
  const userId = resetTokens[Id]; 

  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Verify the token and get the payload userId
  try {
    const decoded = jwt.verify(Id, 'your_secret_key'); 
    const { userId: decodedUserId } = decoded;

    if (decodedUserId !== userId) {
      return res.status(401).json({ error: 'Invalid token for this userId' });
    }

    // Check if userId from the token matches the one from the token in resetTokens
    if (userId !== decodedUserId) {
      return res.status(400).json({ error: 'UserId Should Match' });
    }

    // Query the database to retrieve user profile
    db.query('SELECT full_name, email, role,status FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error retrieving user profile:', err);
        return res.status(500).json({ error: 'Failed to fetch user profile' });
      }
     
      // Send the user profile data as JSON response
      const userProfile = results[0];
      res.status(200).json(userProfile);
    });
    
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
});

//Router to get all the detaikls of the users from the database
router.get('/allUsers', (req, res) => {
  // Query the database to get the users
  db.query('SELECT id, full_name, email, role,status FROM users', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Send the list of users as a JSON response
    res.status(200).json({ users: results });
  });
});


  
  module.exports = router;