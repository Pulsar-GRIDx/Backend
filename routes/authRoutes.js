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

// Generate a random temporary password
function generateTemporaryPassword() {
  const tempPassword = Math.random().toString(36).slice(-8); // Generate an 8-character alphanumeric password
  return tempPassword;
}

// Send a password reset email 
function sendResetEmail(Email, tempPassword) {
 
  // Send an email to the user's email address with the temporary password
}

// Temporary storage for reset tokens (you should use a more persistent storage in production)
const resetTokens = {};

// Forgot Password route
router.post('/forgot-password', limiter, (req, res) => {
  const { Email } = req.body;

  // Generate a unique temporary password
  const temporaryPassword = generateTemporaryPassword();

  // Generate a token with user's email and temporary password
  const tokenPayload = { Email, temporaryPassword };
  const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, { expiresIn: '1h' });

  // Store the token and email in the temporary storage
  resetTokens[token] = Email;

  // Include the token in the reset link
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  // Send the reset link to the user's email
  sendResetEmail(Email, resetLink, temporaryPassword);

  res.status(200).json({ message: 'Password reset link sent' });
});

// Reset Password route
router.post('/reset-password', async (req, res) => {
  const { token, newPassword, confirm_password } = req.body;

  // Check if the reset token exists and retrieve the associated email
  const Email = resetTokens[token];

  if (!Email) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Verify the token and get the payload (including temporary password)
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { Email: decodedEmail, temporaryPassword } = decoded;

    if (decodedEmail !== Email) {
      return res.status(401).json({ error: 'Invalid token for this email' });
    }

    // Check if newPassword and confirm_password match
    if (newPassword !== confirm_password) {
      return res.status(400).json({ error: 'Both New Password and Confirm Password Should Match' });
    }

    // Update the user's password with the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database using the email
    const updateUserQuery = 'UPDATE users SET password = ? WHERE email = ?';
    connection.query(updateUserQuery, [hashedNewPassword, Email], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Password reset failed', err });
      }

      // Remove the used reset token from temporary storage
      delete resetTokens[token];

      res.status(200).json({ message: 'Password reset successful' });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
});

// Sign-Up route
router.post('/signup', async (req, res) => {
  const { Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel } = req.body;

  // Validate inputs
  if (!Username || !Password || !FirstName || !LastName || !Email || !IsActive || !RoleName || !AccessLevel || !validateEmail(Email)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
    console.log('Received registration request with data:');
    console.log('Request Body:', req.body);

    const hashedPassword = await bcrypt.hash(Password, 10);

    connection.query(
      'INSERT INTO users (Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
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

// Sign-In route
router.post('/signin', (req, res) => {
  const { Email, Password } = req.body;

  // Find the user by email
  const findUserQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(findUserQuery, [Email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed', err });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Compare passwords
    const user = results[0];

    bcrypt.compare(Password, user.Password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Password comparison failed', err });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      // Generate a JWT with user's AccessLevel
      const token = jwt.sign(
        { UserID: user.UserID, email: user.email, AccessLevel: user.AccessLevel },
        enviroment.SECRET_KEY
      );
       console.log(enviroment.SECRET_KEY);
      res.status(200).json({
        token
        
      });
    });
  });
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
  const { FirstName, Email, RoleName, IsActive } = req.body; // Additional information from the request body

  // SQL UPDATE query to update user information
  const updateUserQuery = 'UPDATE users SET FirstName = ?, Email = ?, RoleName = ?, IsActive = ?  WHERE UserID = ?';

  // Execute the SQL query to update user information
  connection.query(updateUserQuery, [FirstName, Email, RoleName, IsActive, UserID], (err, results) => {
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
  const updateUserQuery = 'UPDATE users SET FirstName = ?, Email = ? WHERE UserID = ?';

  // Execute the SQL query to update user information
  connection.query(updateUserQuery, [FirstName, Email, UserID], (err, results) => {
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

  const deleteUserQuery = 'DELETE FROM users WHERE UserID = ?';

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
  const checkUserQuery = 'SELECT * FROM users WHERE UserID = ?';

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
