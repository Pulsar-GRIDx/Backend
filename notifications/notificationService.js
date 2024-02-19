const db = require('../config/db');
///Get Notifications By DRN
exports.getNotificationsByDRN = (DRN) => {
    const query = "SELECT Alarm , date_time FROM MeterNotifications WHERE DRN = ? ORDER BY date_time DESC LIMIT 25";
  
    return new Promise((resolve, reject) => {
      db.query(query, [DRN], (err, notifications) => {
        if (err) {
          reject(err);
        } else {
          resolve(notifications);
        }
      });
    });
  };

//Get All Critical Notifications


  exports.getAllCriticalNotifications = () => {
    const query = 'SELECT Alarm, DRN, date_time FROM MeterNotifications WHERE date_time >= DATE_SUB(NOW() , INTERVAL 1 HOUR) ORDER BY date_time DESC LIMIT 25';
  
    return new Promise((resolve, reject) => {
      db.query(query,  (err, notifications) => {
        if (err) {
          reject(err);
        } else {
          resolve(notifications);
        }
      });
    });
  };

  