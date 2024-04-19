const express = require('express');
const router = express.Router();
const db = require("../config/db");
const authenticateToken = require('../admin/authMiddllware');


router.get('/energy-stats', authenticateToken.authenticateToken,(req, res) => {
    const queries = {
      lastWeek: `SELECT DATE(date_time) as date, SUM(active_energy) as total FROM MeterCumulativeEnergyUsage WHERE date_time >= curdate() - INTERVAL DAYOFWEEK(curdate())+6 DAY AND date_time < curdate() - INTERVAL DAYOFWEEK(curdate())-1 DAY GROUP BY date_time`,
      currentWeek: `SELECT DATE(date_time) as date, SUM(active_energy) as total FROM MeterCumulativeEnergyUsage WHERE date_time >= curdate() - INTERVAL DAYOFWEEK(curdate())-1 DAY GROUP BY date_time`,
      lastMonth: `SELECT DATE(date_time) as date, SUM(active_energy) as total FROM MeterCumulativeEnergyUsage WHERE date_time >= DATE_SUB(LAST_DAY(DATE_SUB(NOW(), INTERVAL 2 MONTH)), INTERVAL DAY(LAST_DAY(DATE_SUB(NOW(), INTERVAL 2 MONTH)))-1 DAY) AND date_time < DATE_SUB(LAST_DAY(DATE_SUB(NOW(), INTERVAL 1 MONTH)), INTERVAL DAY(LAST_DAY(DATE_SUB(NOW(), INTERVAL 1 MONTH)))-1 DAY) GROUP BY date_time`,
      currentMonth: `SELECT DATE(date_time) as date, SUM(active_energy) as total FROM MeterCumulativeEnergyUsage WHERE date_time >= DATE_SUB(LAST_DAY(DATE_SUB(NOW(), INTERVAL 1 MONTH)), INTERVAL DAY(LAST_DAY(DATE_SUB(NOW(), INTERVAL 1 MONTH)))-1 DAY) GROUP BY date_time`
    };
  
    let results = {};
  
   
  
      Object.keys(queries).forEach((key, i, array) => {
        db.query(queries[key], (err, result) => {
          if (err) throw err;
          results[key] = result;
  
          if (i === array.length - 1) {
            // Close the database connection after all queries are executed
            db.end((err) => {
              if (err) throw err;
            });
  
            res.send(results);
          }
        });
      });
    });
  
  



  
module.exports = router;
