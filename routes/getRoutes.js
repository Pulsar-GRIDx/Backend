const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
// const secretKey = process.env.SECRET_KEY;
// const dotenv = require('dotenv'); 

// dotenv.config();
//Get Signin router
router.get('/signin', (req, res) => {
    res.sendFile(__dirname + '/signin.html');
  });

  //Get Signup router
  router.get('/signup', (req, res) => {
    res.status(200).json({ message: 'Welome' });
  });

  
  // Get userProfile router
router.get('/profile/:UserID', (req, res) => {
  const { UserID } = req.params; 
  console.log(UserID);
  const resetTokens = {};
  const userId = resetTokens[UserID]; 

  if (!UserID) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Verify the token and get the payload userId
  try {
    const decoded = jwt.verify(ID, 'your_secret_key'); 
    const { UserID: decodedUserID } = decoded;

    if (decodedUserID !== UserID) {
      return res.status(401).json({ error: 'Invalid token for this userId' });
    }

    // Check if userId from the token matches the one from the token in resetTokens
    if (UserID !== decodedUserID) {
      return res.status(400).json({ error: 'UserId Should Match' });
    }

    // Query the database to retrieve user profile
    db.query('SELECT FirstName, Email, RoleName,IsActive FROM users WHERE ID = ?', [userId], (err, results) => {
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
  db.query('SELECT UserID, FirstName,RoleName,IsActive FROM users', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Send the list of users as a JSON response
    res.status(200).json({ users: results });
  });
});


//  // Protected route
//  router.get('/protected', (req, res) => {
//   const token = req.header('Authorization');

//   if (!token) {
//     return res.status(401).json({ error: 'Authentication required' });
//   }

//   jwt.verify(token, secretKey, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ error: 'Token verification failed',err });
//     }


//     const { AccessLevel } = decoded;

//     if (AccessLevel === 1) {
//       return res.json({ message: 'Welcome admin' });
//     } else if (AccessLevel !== 1) {
//       return res.json({ message: 'Welcome user' });
//     } else {
//       return res.status(403).json({ error: 'Access denied' });
//     }
//   });
// });
// router.get('/protected', (req, res) => {
//   const token = req.header('Authorization');

  

//   if (!token) {
//     return res.status(401).json({ error: 'Authentication required' });
//   }

//   jwt.verify(token, secretKey, (err, decoded) => {
//     if (err) {
//       console.log(token,secretKey);
//       return res.status(401).json({ error: 'Token verification failed',err });
//     }

//     const { AccessLevel } = decoded;

//     if (AccessLevel === 1) {
//       return res.json({ message: 'Welcome admin' });
//     } else if (AccessLevel === 2) {
//       return res.json({ message: 'Welcome user' });
//     } else {
//       return res.status(403).json({ error: 'Access denied' });
//     }
//   });
// });
  
  module.exports = router;