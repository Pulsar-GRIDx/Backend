const db = require('../config/db');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const db = require('../db');
const validator = require('validator');
const rateLimit = require('express-rate-limit');
const authenticateTokenAndGetAdmin_ID = require('../middleware/authenticateTokenAndGet Admin_ID');


// DELETE route to delete a notification by ID
router.delete('/deleteNotifications/:id', authenticateTokenAndGetAdmin_ID,(req, res) => {
    const notificationId = req.params.id;
  
    // Execute the SQL query to delete the notification
    db.query('DELETE FROM MeterNotifications WHERE id = ?', [notificationId], (error, results, fields) => {
      if (error) {
        res.status(500).json({ error: 'An error occurred while deleting the notification' });
      } else {
        res.status(200).json({ message: 'Notification deleted successfully' });
      }
    });
  });

  module.exports = router ;