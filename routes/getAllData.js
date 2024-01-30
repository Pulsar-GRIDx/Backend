const express = require('express');
const router = express.Router();
const db = require("../config/db");

// router.get('/totalEnergyAmount', (req, res) => {
//   // Query for records where display_msg is 'Accept' and date_time is the current date
//   const getCurrentData = "SELECT active_energy, DATE(date_time) as date_time FROM MeterCumulativeEnergyUsage WHERE DATE(date_time) = CURDATE()";
//   db.query(getCurrentData, (err, currentData) => {
//     if (err) {
//       console.log('Error querying the database:', err);
//       return res.status(500).send({ error: 'Database query failed', details: err });
//     }

//     // Query for the earliest date_time in the database
//     const getStartDate = "SELECT MIN(DATE(date_time)) as startDate FROM MeterCumulativeEnergyUsage";
//     db.query(getStartDate, (err, startDateResult) => {
//       if (err) {
//         console.log('Error querying the database:', err);
//         return res.status(500).send({ error: 'Database query failed', details: err });
//       }

//       // Get the start date from the result
//       const startDate = startDateResult[0].startDate;

//       // Query for all records starting from the startDate
//       const getPreviousData = "SELECT active_energy, DATE(date_time) as date_time FROM MeterCumulativeEnergyUsage WHERE DATE(date_time) >= ?";
//       db.query(getPreviousData, [startDate], (err, allData) => {
//         if (err) {
//           console.log('Error querying the database:', err);
//           return res.status(500).send({ error: 'Database query failed', details: err });
//         }

//         // Calculate the total energy amount for each date
//         const totals = allData.reduce((acc, record) => {
//           const date = record.date_time;
//           const energy = Number(record.active_energy) / 1000;
//           if (!acc[date]) {
//             acc[date] = 0;
//           }
//           acc[date] += energy;
//           return acc;
//         }, {});

//         // Convert the totals object to an array
//         const result = Object.values(totals);

//         // Calculate the grand total
//         const grandTotal = result.reduce((total, record) => total + record, 0);

//         // Prepare the response
//         const response = {
//           allData: result,
//           startDate: startDate,
//           grandTotal: grandTotal,
//         };

//         res.json(response);
//       });
//     });
//   });
// });



  
module.exports = router;
