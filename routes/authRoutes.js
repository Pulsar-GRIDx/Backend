const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv'); // Import dotenv
const connection = require("../db");


dotenv.config();
const config = process.env;
const enviroment = process.env;

// Rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: 'Too many requests, please try again later.',
});



// Sign-Up route for admins.
router.post('/adminSignup', async (req, res) => {
  const { Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel } = req.body;

  // Validate inputs
  if (!Username || !Password || !FirstName || !LastName || !Email || !IsActive || !RoleName || !AccessLevel || !validateEmail(Email)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    console.log('Received registration request with data:');
    

    const hashedPassword = await bcrypt.hash(Password, 10);

    connection.query(
      'INSERT INTO SystemAdmins (Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [Username, hashedPassword, FirstName, LastName, Email, IsActive, RoleName, AccessLevel],
      (err, result) => {
        if (err) {
          console.error('Registration error:', err);
          return res.status(500).json({ error: 'Registration failed', err });
        }
        console.log('Registration successful');
        res.status(201).json({ message: 'Registration successful' });
      }
    );
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed', err });
  }
});
//signup router for users

router.post('/signup', async (req, res) => {
  const { Password, FirstName, LastName, Email,DRN} = req.body;

  // Validate inputs
  if (!Password || !FirstName || !LastName || !Email || DRN || !validateEmail(Email)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    console.log('Received registration request with data:');
    

    const hashedPassword = await bcrypt.hash(Password, 10);

    connection.query(
      'INSERT INTO SystemUsers  Password, FirstName, LastName, Email, DRN) VALUES (?, ?, ?, ?, ?)',
      [ hashedPassword, FirstName, LastName, Email, IsActive, RoleName, AccessLevel],
      (err, result) => {
        if (err) {
          console.error('Registration error:', err);
          return res.status(500).json({ error: 'Registration failed', err });
        }
        console.log('Registration successful');
        res.status(201).json({ message: 'Registration successful' });
      }
    );
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Registration failed', err });
  }});



// Sign-In route for both regular and guest users
router.post('/signin', (req, res) => {
  const { Email, Password, GuestID } = req.body;

  if (!GuestID && (!Email || !Password)) {
    // If no GuestID is provided and either Email or Password is missing, reject the request.
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (GuestID) {
    // Guest user sign-in
    const findGuestQuery = 'SELECT * FROM guest_users WHERE GuestID = ?';
    connection.query(findGuestQuery, [GuestID], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed', err });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      const guestUser = results[0];

      // Update the login count in the database
      connection.query('UPDATE guest_users SET login_count = login_count + 1 WHERE GuestID = ?', [GuestID], (err, updateResult) => {
        if (err) {
          return res.status(500).json({ error: 'Login count update failed', err });
        }

        // Generate a JWT with a 10-minute expiration for the guest user
        const token = jwt.sign(
          { GuestID: guestUser.GuestID, name: guestUser.name, role: 'guest' },
          environment.SECRET_KEY,
          { expiresIn: '10m' } // Token expires in 10 minutes
        );

        

        // Send the response
        res.status(200).json({
          token,
          user: {
            GuestID: guestUser.GuestID,
            name: guestUser.name,
            role: 'guest',
          },
        });
        res.cookie('accessToken', token, {
          httpOnly: false,
          secure: true, // Set this to true for HTTPS
          maxAge: 40 * 60 * 1000,
          domain: 'admin.gridxmeter.com', // Include the dot before the domain
          path: '/',
          sameSite: 'None',
        });
        
  
        // Set CORS headers
        res.header('Access-Control-Allow-Origin', 'http://admin.gridxmeter.com','https://admin.gridxmeter.com'); 
        res.header('Access-Control-Allow-Credentials', true);
  
        // Send the response with both token and user data
        res.status(200).json({
          message: 'User signed in successfully',
          token,
          
        });
        res.redirect(`/protected?token=${encodeURIComponent(token)}`)
      });
    });
  } else {
    // Regular user sign-in
    // Find the user by email
    const findUserQuery = 'SELECT * FROM SystemAdmins WHERE email = ?';
    connection.query(findUserQuery, [Email], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed', err });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      // Compare passwords
      const admin = results[0];

      bcrypt.compare(Password, admin.Password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Password comparison failed', err });
        }

        if (!isMatch) {
          return res.status(401).json({ error: 'Authentication failed' });
        }

        // Update the login count in the database
        connection.query('UPDATE SystemAdmins SET login_count = login_count + 1 WHERE Admin_ID = ?', [admin.Admin_ID], (err, updateResult) => {
          if (err) {
            return res.status(500).json({ error: 'Login count update failed', err });
          }

          // Generate a JWT with user's AccessLevel
          const token = jwt.sign(
            { UserID: admin.adminID, email: admin.email, AccessLevel: admin.AccessLevel },
            enviroment.SECRET_KEY,
            { expiresIn: '1h' } // Token expires in 1 hour
          );

          // Set the cookie
          res.cookie('token', token, { httpOnly: false, sameSite: 'Lax', secure: false });

          // Send the response
          res.status(200).json({
            
            admin: {
              Admin_ID: admin.adminID,
              email: admin.email,
              AccessLevel: admin.AccessLevel,token
            }
          });
        });
      });
    });
  }
});
//Protected router
router.get('/protected', (req, res) => {
  // Get the token from the request headers
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token,config.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log(config.SECRET_KEY);
      return res.status(401).json({ error: 'Authentication failed' });
       
    }
    console.log(decoded);
    const { AccessLevel } = decoded;
    
    if (AccessLevel === 1) {
      return res.json({ message: 'Welcome admin' });
    } else {
      return res.json({ message: 'Welcome user' });
    }
    res.status(200).json({
  AccessLevel
  
    } );
    
  });
});

// Validation function for email
const validateEmail = (Email) => {
  if (!validator.isEmail(Email)) {
    return false;
  }
  return true;
};

// Admin Route to update user information
router.post('/AdminUpdate/:UserID', (req, res) => {
  const UserID = req.params.UserID; // Extract the userId from the URL
  const { FirstName, Email } = req.body; // Additional information from the request body

  // SQL UPDATE query to update user information
  const updateUserQuery = 'UPDATE SystemUsers SET FirstName = ?, Email = ?, LastName = ?, DRN = ?  WHERE UserID = ?';

  // Execute the SQL query to update user information
  connection.query(updateUserQuery, [FirstName, Email, LastName, DRN, UserID], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error', err });
    }

    // Check if the user was found and updated
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send a success response
    res.status(200).json({ message: 'User information updated successfully' });
  });
});

// User Route to update user information for the currently logged-in user
router.post('/UserUpdate/:UserID', (req, res) => {
  const UserID = req.params.UserID; // Extract the userId from the URL
  const { FirstName, Email } = req.body; // Updated information from the request body

  // SQL UPDATE query to update user information
  const updateUserQuery = 'UPDATE SystemUsers SET FirstName = ?, Email = ?, LastName = ?, DRN = ? WHERE UserID = ?';

  // Execute the SQL query to update user information
  connection.query(updateUserQuery, [FirstName, Email ,LastName ,DRN], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error', err });
    }

    // Check if the user was found and updated
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send a success response
    res.status(200).json({ message: 'User information updated successfully' });
  });
});

// Route to delete the currently logged-in user
router.delete('/deleteUser/:UserID', (req, res) => {
  const UserID = req.params.UserID; // Get the userId from the URL parameter

  const deleteUserQuery = 'DELETE FROM SystemUsers WHERE UserID = ?';

  // Execute the SQL query to delete the user
  connection.query(deleteUserQuery, [UserID], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Internal server error', err });
    }

    // Check if the user was found and deleted
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found', err });
    }

    // Send a success response
    res.status(200).json({ message: 'User deleted successfully' });
  });
});

// Route to update user status
router.put('/updateStatus/:UserID', (req, res) => {
  const UserID = req.params.UserID;

  // Check if the user exists in the database
  const checkUserQuery = 'SELECT * FROM SystemUsers WHERE UserID = ?';

  connection.query(checkUserQuery, [UserID], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      res.status(500).json({ message: 'Internal Server Error', err });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      const user = results[0];
      const newStatus = user.IsActive === 1 ? 0 : 1;

      // Update user status
      const updateStatusQuery = 'UPDATE users SET IsActive = ? WHERE UserID = ?';

      connection.query(updateStatusQuery, [newStatus, UserID], (err, updateResult) => {
        if (err) {
          console.error('Error updating user status:', err);
          res.status(500).json({ message: 'Internal Server Error', err });
        } else {
          res.status(200).json({ message: 'User status updated successfully', newStatus });
        }
      });
    }
  });
});

module.exports = router;