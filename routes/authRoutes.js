
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const validator = require('validator');
const rateLimit = require('express-rate-limit');


//Rate limiter 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Too many requests, please try again later.',
});





// Generate a random temporary password
function generateTemporaryPassword() {
  const tempPassword = Math.random().toString(36).slice(-8); // Generate an 8-character alphanumeric password
  return tempPassword;
}

// Send a password reset email (You can use a library like Nodemailer to send emails)
function sendResetEmail(email, tempPassword) {
  // Implement your email sending logic here
  // Send an email to the user's email address with the temporary password
}




// Temporary storage for reset tokens (you should use a more persistent storage in production)
const resetTokens = {};

// Forgot Password route
router.post('/forgot-password',limiter, (req, res) => {
  const { email } = req.body;

  // Generate a unique temporary password
  const temporaryPassword = generateTemporaryPassword();

  // Generate a token with user's email and temporary password
  const tokenPayload = { email, temporaryPassword };
  const token = jwt.sign(tokenPayload, 'your_secret_key', { expiresIn: '1h' });

  // Store the token and email in the temporary storage
  resetTokens[token] = email;

  // Include the token in the reset link
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  // Send the reset link to the user's email
  sendResetEmail(email, resetLink, temporaryPassword);

  res.status(200).json({ message: 'Password reset link sent' });
});

// Reset Password route
router.post('/reset-password', async (req, res) => {
  const { token, newPassword, confirm_password } = req.body;

  // Check if the reset token exists and retrieve the associated email
  const email = resetTokens[token];

  if (!email) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Verify the token and get the payload (including temporary password)
  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    const { email: decodedEmail, temporaryPassword } = decoded;

    if (decodedEmail !== email) {
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
    db.query(updateUserQuery, [hashedNewPassword, email], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Password reset failed' });
      }

      // Remove the used reset token from temporary storage
      delete resetTokens[token];

      res.status(200).json({ message: 'Password reset successful' });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
});


//Signin  signup routers
  
 router.post('/signup',limiter, async (req, res) => {
    const { full_name, email, password, role } = req.body;
  
    // Validate inputs
    if (!full_name || !email || !password || !role || !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
  
    try {
      console.log('Received registration request with data:');
      console.log('Full Name:', full_name);
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('Role:', role);
      console.log('Request Body:', req.body);
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      console.log('Hashed Password:', hashedPassword);
  
      db.query(
        'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        [full_name, email, hashedPassword, role],
        (err, result) => {
          if (err) {
            console.error('Registration error:', err);
            return res.status(500).json({ error: 'Registration failed' });
          }
          console.log('Registration successful');
          res.status(201).json({ message: 'Registration successful' });
        }
      );
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });
  
  
  
  // Login
  router.post('/signin',limiter, (req, res) => {
    const { email, password } = req.body;
  
    // Find the user by email
    const findUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(findUserQuery, [email], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: 'Authentication failed' });
      }
  
      // Compare passwords
      const user = results[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Password comparison failed' });
        }
  
        if (!isMatch) {
          return res.status(401).json({ error: 'Authentication failed' });
        }
  
        // Generate a JWT with user's role
        const token = jwt.sign({ id: user.id,role: user.role }, 'your_secret_key', { expiresIn: '1h' });
        
        // Include the token and role in the response
        res.status(200).json({ token, role: user.role });
      });
    });
  });
  
  // Validation function for email
const validateEmail = (email) => {
  if (!validator.isEmail(email)) {
    return false;
  }
  return true;
};

  // Protected route
  router.get('/protected', (req, res) => {
    // Check if the user has a valid token
    const token = req.header('Authorization');
  
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  
    // Verify the token
    jwt.verify(token, 'your_secret_key', (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token verification failed' });
      }
  
      // Check user's role or any other authorization logic
      if (decoded.role === 'user') {
        console.log('welcom,user');
      } else {
        console.log('Welcome, admin!');
      }
    });
  });


//Route to update user information
router.post('/update/:userId', (req, res) => {
  const userId = req.params.userId; // Extract the userId from the URL
  const { full_name, email, role } = req.body; // Additional information from the request body

  // SQL UPDATE query to update user information
  const updateUserQuery = 'UPDATE users SET full_name = ?, email = ?, role = ? WHERE id = ?';

  // Execute the SQL query to update user information
  db.query(updateUserQuery, [full_name, email, role,userId], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Check if the user was found and updated
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send a success response
    res.status(200).json({ message: 'User information updated successfully' });
  });
});

// Route to update user information for the currently logged-in user
router.post('/login/:userId', (req, res) => {
  const userId = req.params.userId; // Extract the userId from the URL
  const { full_name, email, role } = req.body; // Updated information from the request body

  // SQL UPDATE query to update user information
  const updateUserQuery = 'UPDATE users SET full_name = ?, email = ?, role = ? WHERE id = ?';

  // Execute the SQL query to update user information
  db.query(updateUserQuery, [full_name, email, role, userId], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error' });
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
router.post('/deleteUser', (req, res) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token verification failed' });
    }

    const userId = decoded.userId;

    // SQL DELETE query to remove the user by userId
    const deleteUserQuery = 'DELETE FROM users WHERE id = ?';

    // Execute the SQL query to delete the user
    db.query(deleteUserQuery, [userId], (err, results) => {
      if (err) {
        console.error('Error deleting user:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Check if the user was found and deleted
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Send a success response
      res.status(200).json({ message: 'User deleted successfully' });
    });
  });
});

  
module.exports = router;
