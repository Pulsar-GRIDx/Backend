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
    const query = 'SELECT Alarm, DRN, date_time FROM MeterNotifications WHERE date_time >= DATE_SUB(NOW() AND Type = "Critical", INTERVAL 1 HOUR) ORDER BY date_time DESC LIMIT 25';
  
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

//Get All notifications
exports.getAll = () => {

  const query = 'SELECT * FROM MeterNotifications WHERE DATE(date_time) = CURDATE()';
  
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

//Get type of notifications

exports.getSumOfTypes = function(callback) {
  const query = `
      SELECT Type, COUNT(*) as count
      FROM MeterNotifications
      WHERE Type IN ('Pending', 'Critical', 'Success', 'Warning')
      GROUP BY Type
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.log('Error Querying the database:', err);
          return callback({ error: 'Database query failed', details: err });
      }

      // Initialize counts to 0
      const counts = {
          'Pending': 0,
          'Critical': 0,
          'Success': 0,
          'Warning': 0
      };

      results.forEach(row => {
          counts[row.Type] = row.count;
      });
      callback(null, counts);
  });
}




