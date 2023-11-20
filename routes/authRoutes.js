// Import necessary modules
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const connection = require("../db");
const dotenv = require('dotenv');

// Configure dotenv
dotenv.config();
const config = process.env;
const environment = process.env;

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: 'Too many requests, please try again later.',
});

// Middleware to parse URL-encoded bodies
router.use(express.urlencoded({ extended: true }));




// Sign-Up route
router.post('/signup', async (req, res) => {
  const { Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel } = req.body;

  if (!Username || !Password || !FirstName || !LastName || !Email || !IsActive || !RoleName || !AccessLevel || !validateEmail(Email)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
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

// Sign-In route for both regular and guest users
router.post('/signin', (req, res) => {
  const { Email, Password, GuestID } = req.body;

  if (!GuestID && (!Email || !Password)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  if (GuestID) {
    const findGuestQuery = 'SELECT * FROM guest_users WHERE GuestID = ?';
    connection.query(findGuestQuery, [GuestID], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed', err });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      const guestUser = results[0];

      connection.query('UPDATE guest_users SET login_count = login_count + 1 WHERE GuestID = ?', [GuestID], (err, updateResult) => {
        if (err) {
          return res.status(500).json({ error: 'Login count update failed', err });
        }

        const token = jwt.sign(
          { GuestID: guestUser.GuestID, name: guestUser.name, role: 'guest' },
          environment.SECRET_KEY,
          { expiresIn: '10m' }
        );

        res.cookie('token', token, { httpOnly: true, sameSite: 'Lax', secure: false });

        res.status(200).json({
          token,
          user: {
            GuestID: guestUser.GuestID,
            name: guestUser.name,
            role: 'guest',
          },
        });
      });
    });
  } else {
    const findUserQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(findUserQuery, [Email], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed', err });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      const user = results[0];

      bcrypt.compare(Password, user.Password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Password comparison failed', err });
        }

        if (!isMatch) {
          return res.status(401).json({ error: 'Authentication failed' });
        }

        connection.query('UPDATE users SET login_count = login_count + 1 WHERE UserID = ?', [user.UserID], (err, updateResult) => {
          if (err) {
            return res.status(500).json({ error: 'Login count update failed', err });
          }

          const token = jwt.sign(
            { UserID: user.UserID, email: user.email, AccessLevel: user.AccessLevel },
            environment.SECRET_KEY,
            { expiresIn: '1h' }
          );
          res.cookie('Authorization', `Bearer ${token}`,{
            httpOnly: false,
            credentials: 'include',
            maxAge: 15 * 60 * 1000, // 30 minutes in milliseconds
          });
          res.redirect(`/protected?token=${encodeURIComponent(token)}`);
        });
      });
    });
  }
});

router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected resource accessed' });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = req.query.token || (authHeader && authHeader.split(' ')[1]);

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
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

router.post('/AdminUpdate/:UserID', (req, res) => {
  const UserID = req.params.UserID;
  const { FirstName, Email, RoleName, IsActive } = req.body;
  const updateUserQuery = 'UPDATE users SET FirstName = ?, Email = ?, RoleName = ?, IsActive = ?  WHERE UserID = ?';

  connection.query(updateUserQuery, [FirstName, Email, RoleName, IsActive, UserID], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error', err });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User information updated successfully' });
  });
});

router.post('/UserUpdate/:UserID', (req, res) => {
  const UserID = req.params.UserID;
  const { FirstName, Email } = req.body;
  const updateUserQuery = 'UPDATE users SET FirstName = ?, Email = ? WHERE UserID = ?';

  connection.query(updateUserQuery, [FirstName, Email, UserID], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error', err });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User information updated successfully' });
  });
});

router.delete('/deleteUser/:UserID', (req, res) => {
  const UserID = req.params.UserID;
  const deleteUserQuery = 'DELETE FROM users WHERE UserID = ?';

  connection.query(deleteUserQuery, [UserID], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Internal server error', err });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found', err });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  });
});

router.put('/updateStatus/:UserID', (req, res) => {
  const UserID = req.params.UserID;
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

// Export the router
module.exports = router;
