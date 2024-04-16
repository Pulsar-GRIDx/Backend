const db = require('../config/db');
const express = require('express');
const router = express.Router();
const authenticateTokenAndGetAdmin_ID = require('../middleware/authenticateTokenAndGet Admin_ID');
const notificationController = require('./notificationController');


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



router.get('/notificationsByDRN/:DRN', notificationController.getAllNotificationsByDRN);
router.get('/criticalNotifications' , notificationController.getAllCriticalNotifications) ;
router.get('/getAll',notificationController.getAll);
router.get('/notificationTypes',notificationController.getMeterNotificationsByType);
router.get('/notificationsTypesByDRN/:DRN',notificationController.getMeterNotificationsByTypeByDRN);

module.exports = router;

