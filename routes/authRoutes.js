// Import necessary modules
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const authenticateTokenAndGetAdmin_ID = require('../middleware/authenticateTokenAndGet Admin_ID');
const connection = require("../config/db");
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



// Sign-Up route for admins.
router.post('/adminSignup', authenticateTokenAndGetAdmin_ID , async (req, res) => {
  const { Username, Password, FirstName, LastName, Email, IsActive, RoleName, AccessLevel } = req.body;


  try {
  
    

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

          const token = jwt.sign(
            { Admin_ID: admin.adminID, email: admin.email, AccessLevel: admin.AccessLevel },
            environment.SECRET_KEY,
            { expiresIn: '1h' } // Token expires in 1 hour
          );

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
        message: 'Admin signed in successfully',
        token,
        redirect: (`/protected?token=${encodeURIComponent(token)}`)
      });
          
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

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User information updated successfully' });
  });
});

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

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User information updated successfully' });
  });
});

router.delete('/deleteUser/:UserID', (req, res) => {
  const UserID = req.params.UserID; // Get the userId from the URL parameter

  const deleteUserQuery = 'DELETE FROM SystemUsers WHERE UserID = ?';

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

// Admin Route to update user information
router.post('/AdminUpdate/:Admin_ID', (req, res) => {
  const Admin_ID = req.params.Admin_ID; 
  const { FirstName, Email, LastName, AccessLevel, Username } = req.body;

  // SQL UPDATE query to update user information
  const updateUserQuery = 'UPDATE SystemAdmins SET FirstName = ?, Email = ?, LastName = ?, AccessLevel = ?, Username = ? WHERE Admin_ID = ?';

  // Execute the SQL query to update user information
  connection.query(updateUserQuery, [FirstName, Email, LastName, AccessLevel, Username, Admin_ID], (err, results) => {
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

// Route to update Admin status
router.post('/updateStatus/:Admin_ID', (req, res) => {
  const Admin_ID = req.params.Admin_ID;
   // Check if the user exists in the database
  const checkUserQuery = 'SELECT * FROM SystemAdmins WHERE Admin_ID = ?';

  connection.query(checkUserQuery, [Admin_ID], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      res.status(500).json({ message: 'Internal Server Error', err });
    } else if (results.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      const user = results[0];
      const newStatus = user.IsActive === 1 ? 0 : 1;

      // Update user status
      const updateStatusQuery = 'UPDATE SystemAdmins SET IsActive = ? WHERE Admin_ID = ?';

      connection.query(updateStatusQuery, [newStatus, Admin_ID], (err, updateResult) => {
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

router.post('/resetPassword/:Admin_ID', (req, res) => {
  const Admin_ID = req.params.Admin_ID;
  const { Password } = req.body;

  // Check if the provided password is empty
  if (!Password) {
    return res.status(400).json({ message: 'Please enter a new password' });
  }

  // Check if the new password is the same as the current password
  const checkPasswordQuery = 'SELECT Password FROM SystemAdmins WHERE Admin_ID = ?';
  connection.query(checkPasswordQuery, [Admin_ID], (err, results) => {
    if (err) {
      console.error('Error checking password:', err);
      return res.status(500).json({ message: 'Internal Server Error', err });
    }

    if (results.length > 0) {
      const currentPassword = results[0].Password;

      bcrypt.compare(Password, currentPassword, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).json({ message: 'Internal Server Error', err });
        }

        if (isMatch) {
          return res.status(400).json({ message: 'Please choose a different password' });
        }

        // If the new password is different, proceed with updating the password
        // Hash the new password before storing it in the database
        bcrypt.hash(Password, 10, (err, hashedPassword) => {
          if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ message: 'Internal Server Error', err });
          }

          // Update the password in the database
          const updatePasswordQuery = 'UPDATE SystemAdmins SET Password = ? WHERE Admin_ID = ?';
          connection.query(updatePasswordQuery, [hashedPassword, Admin_ID], (err, updateResult) => {
            if (err) {
              console.error('Error updating password:', err);
              return res.status(500).json({ message: 'Internal Server Error', err });
            }

            res.status(200).json({ message: 'Password updated successfully' });
          });
        });
      });
    } else {
      res.status(404).json({ message: 'User not found' });
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
