const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/totalEnergyAmount', (req, res) => {
    // Get the current date
    const currentDate = new Date();
  
    // Query for records where display_msg is 'Accept' and date_time is the current date
    const getCurrentData = "SELECT active_energy FROM MeterCumulativeEnergyUsage WHERE  date_time = ?";
    db.query(getCurrentData, [currentDate], (err, currentData) => {
      if (err) {
        console.log('Error querying the database:', err);
        return res.status(500).send({ error: 'Database query failed', details: err });
      }
    //   // Count occurrences of 'Accept' in the 'display_msg' column
    //   const currentDateCount = currentData.filter(row => row.display_msg === 'Accept').length;
  
      // Query for all previous records
      const getPreviousData = "SELECT active_energy FROM MeterCumulativeEnergyUsage WHERE  date_time < ?";
      db.query(getPreviousData, [currentDate], (err, previousData) => {
        if (err) {
          console.log('Error querying the database:', err);
          return res.status(500).send({ error: 'Database query failed', details: err });
        }
        // const previousDateCount = previousData.filter(row => row.display_msg === 'Accept').length;
  
        // Query for the earliest date_time in the database
        const getStartDate = "SELECT MIN(date_time) as startDate FROM MeterCumulativeEnergyUsage";
        db.query(getStartDate, [], (err, result) => {
          if (err) {
            console.log('Error querying the database:', err);
            return res.status(500).send({ error: 'Database query failed', details: err });
          }
  
          // Get the start date from the result
          const startDate = result[0].startDate;
  
          // Calculate the total enrgy amount for the current date
          const currentTotal = currentData.reduce((total, record) => total + Number(record.active_energy), 0) / 1000;
  
          // Calculate the total token amount for each previous date
          const previousTotals = previousData.reduce((totals, record) => {
            if (record.date_time) {
              const date = record.date_time.toISOString().split('T')[0]; // Convert date to YYYY-MM-DD format
              if (!totals[date]) {
                totals[date] = 0;
              }
              totals[date] += Number(record.active_energy) / 1000;
            }
            return totals;
          }, {});
  
          // Calculate the grand total
          const allData = [...previousData, ...currentData];
          const grandTotal = allData.reduce((total, record) => total + Number(record.active_energy), 0) / 1000;
  
          // Prepare the response
          const response = {
            allData: allData.map(record => Number(record.active_energy)),
            startDate: startDate,
            grandTotal: grandTotal,
          };
  
          // Send the response
          res.json(response);
        });
      });
    });
  });
  
module.exports = router;
