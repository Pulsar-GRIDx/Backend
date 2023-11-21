const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const connection = require("../db");
const dotenv = require('dotenv');

// Configure dotenv
dotenv.config();

const util = require('util');
const query = util.promisify(connection.query).bind(connection);
const environment = process.env;
// Assuming generateTemporaryPassword and sendResetEmail functions are defined somewhere
// Placeholder for generating a temporary password (customize as needed)
function generateTemporaryPassword() {
    const temporaryPassword = Math.random().toString(36).slice(-8);
    return temporaryPassword;
  }
  
  // Placeholder for sending reset email (customize as needed)
  function sendResetEmail(email, resetLink, temporaryPassword) {
    // Implement the logic to send the reset email using Nodemailer or your email service provider
    // This function can be similar to the one you've already implemented in a previous part of your code
  }
const resetTokens = {};

router.post('/forgot-password', async (req, res) => {
  const { Email } = req.body;

  if (!Email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if the email exists in the database
    const [rows] = await query('SELECT * FROM users WHERE email = ?', [Email]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Continue with the password reset process
    const temporaryPassword = generateTemporaryPassword();
    const tokenPayload = { Email, temporaryPassword };
    const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, { expiresIn: '1h' });
    resetTokens[token] = Email;
    const resetLink = `https://gridxmeter.com/reset-password?token=${token}`;

    // Call the function to send the reset email
    sendResetEmail(Email, resetLink, temporaryPassword);

    res.status(200).json({ message: 'Password reset link sent' });
  } catch (error) {
    console.error('Error checking email in the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to send reset email using Nodemailer
function sendResetEmail(email, resetLink, temporaryPassword) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'etangoking6@gmail.com',
      pass: 'hjtk onik ojyv lxud',
    },
  });

  const mailOptions = {
    from: 'etangoking6@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Click on the following link to reset your password: ${resetLink}\nTemporary Password: ${temporaryPassword}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}



// Reset Password route
router.post('/reset-password', async (req, res) => {
    const { token, newPassword, confirm_password } = req.body;
    const Email = resetTokens[token];
  
    if (!Email) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const { Email: decodedEmail, temporaryPassword, exp } = decoded;
  
      // Verify if the token is expired
      if (exp && exp < Date.now() / 1000) {
        return res.status(401).json({ error: 'Password reset link has expired' });
      }
  
      if (decodedEmail !== Email) {
        return res.status(401).json({ error: 'Invalid token for this email' });
      }
  
      if (newPassword !== confirm_password) {
        return res.status(400).json({ error: 'Both New Password and Confirm Password Should Match' });
      }
  
      try {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
        const updateUserQuery = 'UPDATE users SET password = ? WHERE email = ?';
        connection.query(updateUserQuery, [hashedNewPassword, Email], (err) => {
          if (err) {
            console.error('Password reset failed:', err);
            return res.status(500).json({ error: 'Password reset failed' });
          }
  
          delete resetTokens[token];
  
          res.status(200).json({ message: 'Password reset successful' });
        });
      } catch (hashError) {
        console.error('Password hashing failed:', hashError);
        return res.status(500).json({ error: 'Password reset failed' });
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ error: 'Token verification failed' });
    }
  });
  
// Middleware for handling errors
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


  ///Functions 
  


module.exports = router;
