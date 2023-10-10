
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const PermissionsMiddleware = require('./PermissionsMiddleware');


//Rate limiter 
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

// Send a password reset email (You can use a library like Nodemailer to send emails)
function sendResetEmail(Email, tempPassword) {
  // Implement your email sending logic here
  // Send an email to the user's email address with the temporary password
}




// Temporary storage for reset tokens (you should use a more persistent storage in production)
const resetTokens = {};

// Forgot Password route
router.post('/forgot-password',limiter, (req, res) => {
  const { Email } = req.body;

  // Generate a unique temporary password
  const temporaryPassword = generateTemporaryPassword();

  // Generate a token with user's email and temporary password
  const tokenPayload = { Email, temporaryPassword };
  const token = jwt.sign(tokenPayload, 'your_secret_key', { expiresIn: '1h' });

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
    const decoded = jwt.verify(token, 'your_secret_key');
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
    db.config(updateUserQuery, [hashedNewPassword, email], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Password reset failed',err });
      }

      // Remove the used reset token from temporary storage
      delete resetTokens[token];

      res.status(200).json({ message: 'Password reset successful',err });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
});


//Signin  signup routers
  
 router.post('/signup', async (req, res) => {
    const { Username , Password , FirstName , LastName , Email , IsActive , RoleName , AccessLevel } = req.body;
  
    // Validate inputs
    if (!Username || !Password || !FirstName || !LastName || !Email || !IsActive|| !RoleName || !AccessLevel || !validateEmail(Email)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
  
    try {
      console.log('Received registration request with data:');
      
      console.log('Request Body:', req.body);
  
      const hashedPassword = await bcrypt.hash(Password, 10);
  
      //console.log('Hashed Password:', hashedPassword);
  
      db.query(
        'INSERT INTO users (Username,Password,FirstName,LastName,Email,IsActive,RoleName,AccessLevel) VALUES (?, ?, ?, ?, ?,?,?,?)',
        [Username,hashedPassword,FirstName,LastName,Email,IsActive,RoleName,AccessLevel],
        (err, result) => {
          if (err) {
            console.error('Registration error:');
            return res.status(500).json({ error: 'Registration failed',err });
          }
          console.log('Registration successful',err);
          res.status(201).json({ message: 'Registration successful' });
        }
      );
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ error: 'Registration failed',err });
    }
  });
  
  
  
 
  // Login
router.post('/signin', (req, res) => {
  const { Email, Password } = req.body;

  console.log('Request Body:', req.body);

  // Find the user by email
  const findUserQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(findUserQuery, [Email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed',err });
    }
   console.log(results);
    if (results.length === 0) {
      return res.status(401).json({ error: 'Authentication failed',err });
    }

    // Compare passwords
    const user = results[0];
    console.log('Hashed Password from Database:', user.Password); // Debugging line
    bcrypt.compare(Password, user.Password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Password comparison failed',err });
      }

      console.log('Password Comparison Result:', isMatch); // Debugging line

      if (!isMatch) {
        return res.status(401).json({ error: 'Authentication failed',err });
      }

      // Generate a JWT with user's role
      const token = jwt.sign(
        { ID: user.UserID, email: user.email, AccessLevel: user.AccessLevel },
        'your_secret_key',
        { expiresIn: '1h' }
      );

      // Include the token 
      res.status(200).json({ token });
    });
  });
});

  // Validation function for email
const validateEmail = (Email) => {
  if (!validator.isEmail(Email)) {
    return false;
  }
  return true;
};

 


//Admin Route to update user information 

router.post('/AdminUpdate/:UserID',(req, res) => {
  const UserID = req.params.UserID; // Extract the userId from the URL
  const { FirstName, Email, RoleName, IsActive } = req.body; // Additional information from the request body

  // SQL UPDATE query to update user information
  const updateUserQuery = 'UPDATE users SET FirstName = ?, Email = ?, RoleName = ?, IsActive = ?  WHERE UserID = ?';

  // Execute the SQL query to update user information
  db.query(updateUserQuery, [FirstName, Email, RoleName, IsActive, UserID], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error' ,err});
    }

    // Check if the user was found and updated
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send a success response
    res.status(200).json({ message: 'User information updated successfully' });
  });
});


//User Route to update user information for the currently logged-in user


router.post('/UserUpdate/:UserID', (req, res) => {
  const UserID = req.params.UserID; // Extract the userId from the URL
  const { FirstName, Email} = req.body; // Updated information from the request body

  // SQL UPDATE query to update user information
  const updateUserQuery = 'UPDATE users SET FirstName = ?, Email = ? WHERE UserID = ?';


  // Execute the SQL query to update user information
  db.query(updateUserQuery, [FirstName, Email, UserID], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error',err });
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
  console.log(UserID);

  const deleteUserQuery = 'DELETE FROM users WHERE UserID = ?';

  // Execute the SQL query to delete the user
  db.query(deleteUserQuery, [UserID], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Internal server error',err });
    }

    // Check if the user was found and deleted
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' ,err});
    }

    // Send a success response
    res.status(200).json({ message: 'User deleted successfully' });
  });
});


// Route to update user status
router.put('/updateStatus/:userId', (req, res) => {
  const UserID = req.params.UserID;

  // Check if the user exists in the database 
  const checkUserQuery = 'SELECT * FROM users WHERE ID = ?';

  db.query(checkUserQuery, [UserID], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      res.status(500).json({ message: 'Internal Server Error',err });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      const user = results[0];
      const newStatus = user.IsActive === 1 ? 0 : 1;

      // Update user status
      const updateStatusQuery = 'UPDATE users SET status = ? WHERE ID = ?';

      db.query(updateStatusQuery, [newStatus, userId], (err, updateResult) => {
        if (err) {
          console.error('Error updating user status:', err);
          res.status(500).json({ message: 'Internal Server Error',err });
        } else {
          res.status(200).json({ message: 'User status updated successfully', newStatus });
        }
      });
    }
  });
});

  
module.exports = router;
