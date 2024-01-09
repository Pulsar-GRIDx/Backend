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

<<<<<<< HEAD
// Middleware to parse URL-encoded bodies
router.use(express.urlencoded({ extended: true }));




// Sign-Up route
router.post('/signup', async (req, res) => {
=======


// Sign-Up route for admins.
router.post('/adminSignup', async (req, res) => {
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412
  const { Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel } = req.body;

  if (!Username || !Password || !FirstName || !LastName || !Email || !IsActive || !RoleName || !AccessLevel || !validateEmail(Email)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  try {
<<<<<<< HEAD
    const hashedPassword = await bcrypt.hash(Password, 10);

    connection.query(
      'INSERT INTO systemadmins (Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
=======
    console.log('Received registration request with data:');
    

    const hashedPassword = await bcrypt.hash(Password, 10);

    connection.query(
      'INSERT INTO SystemAdmins (Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412
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

<<<<<<< HEAD
=======
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



>>>>>>> 2966415b133f63a36588360d30c329fc537bb412
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

<<<<<<< HEAD
        res.cookie('token', token, { httpOnly: true, sameSite: 'Lax', secure: false });
=======
        
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412

        res.status(200).json({
          token,
          user: {
            GuestID: guestUser.GuestID,
            name: guestUser.name,
            role: 'guest',
            redirect: `/protected?token=${encodeURIComponent(token)}`
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
<<<<<<< HEAD
    const findUserQuery = 'SELECT * FROM users WHERE email = ?';
=======
    // Regular user sign-in
    // Find the user by email
    const findUserQuery = 'SELECT * FROM SystemAdmins WHERE email = ?';
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412
    connection.query(findUserQuery, [Email], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed', err });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

<<<<<<< HEAD
      const user = results[0];
=======
      // Compare passwords
      const admin = results[0];
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412

      bcrypt.compare(Password, admin.Password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Password comparison failed', err });
        }

        if (!isMatch) {
          return res.status(401).json({ error: 'Authentication failed' });
        }

<<<<<<< HEAD
        connection.query('UPDATE users SET login_count = login_count + 1 WHERE UserID = ?', [user.UserID], (err, updateResult) => {
=======
        // Update the login count in the database
        connection.query('UPDATE SystemAdmins SET login_count = login_count + 1 WHERE Admin_ID = ?', [admin.Admin_ID], (err, updateResult) => {
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412
          if (err) {
            return res.status(500).json({ error: 'Login count update failed', err });
          }

          const token = jwt.sign(
<<<<<<< HEAD
            { UserID: user.UserID, email: user.email, AccessLevel: user.AccessLevel },
            environment.SECRET_KEY,
            { expiresIn: '1h' }
          );
          res.cookie('Authorization', `Bearer ${token}`,{
            httpOnly: false,
            credentials: 'include',
            maxAge: 15 * 60 * 1000, // 30 minutes in milliseconds
=======
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
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412
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

  jwt.verify(token, environment.SECRET_KEY, (err, user) => {
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
<<<<<<< HEAD
  const UserID = req.params.UserID;
  const { FirstName, Email, RoleName, IsActive } = req.body;
  const updateUserQuery = 'UPDATE users SET FirstName = ?, Email = ?, RoleName = ?, IsActive = ?  WHERE UserID = ?';

  connection.query(updateUserQuery, [FirstName, Email, RoleName, IsActive, UserID], (err, results) => {
=======
  const UserID = req.params.UserID; // Extract the userId from the URL
  const { FirstName, Email } = req.body; // Additional information from the request body

  // SQL UPDATE query to update user information
  const updateUserQuery = 'UPDATE SystemUsers SET FirstName = ?, Email = ?, LastName = ?, DRN = ?  WHERE UserID = ?';

  // Execute the SQL query to update user information
  connection.query(updateUserQuery, [FirstName, Email, LastName, DRN, UserID], (err, results) => {
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412
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
<<<<<<< HEAD
  const UserID = req.params.UserID;
  const { FirstName, Email } = req.body;
  const updateUserQuery = 'UPDATE users SET FirstName = ?, Email = ? WHERE UserID = ?';

  connection.query(updateUserQuery, [FirstName, Email, UserID], (err, results) => {
=======
  const UserID = req.params.UserID; // Extract the userId from the URL
  const { FirstName, Email } = req.body; // Updated information from the request body

  // SQL UPDATE query to update user information
  const updateUserQuery = 'UPDATE SystemUsers SET FirstName = ?, Email = ?, LastName = ?, DRN = ? WHERE UserID = ?';

  // Execute the SQL query to update user information
  connection.query(updateUserQuery, [FirstName, Email ,LastName ,DRN], (err, results) => {
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412
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
<<<<<<< HEAD
  const UserID = req.params.UserID;
  const deleteUserQuery = 'DELETE FROM users WHERE UserID = ?';
=======
  const UserID = req.params.UserID; // Get the userId from the URL parameter

  const deleteUserQuery = 'DELETE FROM SystemUsers WHERE UserID = ?';
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412

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
<<<<<<< HEAD
  const checkUserQuery = 'SELECT * FROM users WHERE UserID = ?';
=======

  // Check if the user exists in the database
  const checkUserQuery = 'SELECT * FROM SystemUsers WHERE UserID = ?';
>>>>>>> 2966415b133f63a36588360d30c329fc537bb412

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


// Middleware for handling errors
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


// Global error handler for unhandled exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // You can perform any necessary cleanup here before exiting
  process.exit(1);
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // You can perform any necessary cleanup here before exiting
  process.exit(1);
});
// Export the router
module.exports = router;
