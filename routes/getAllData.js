const express = require('express');
const router = express.Router();
const db = require('../db');

// router.post('/tokenAmount', (req, res) => {
//     // Get the current date
//     const currentDate = new Date();

//     // Query for records where display_msg is 'Accept' and date_time is the current date
//     const getCurrentData = "SELECT token_amount FROM STSTokesInfo WHERE display_msg = 'Accept' AND date_time = ?";
//     db.query(getCurrentData, [currentDate], (err, currentData) => {
//         if (err) {
//             console.log('Error querying the database:', err);
//             return res.status(500).send({ error: 'Database query failed', details: err });
//         }

//         // Query for all previous records
//         const getPreviousData = "SELECT token_amount FROM STSTokesInfo WHERE display_msg = 'Accept' AND date_time < ?";
//         db.query(getPreviousData, [currentDate], (err, previousData) => {
//             if (err) {
//                 console.log('Error querying the database:', err);
//                 return res.status(500).send({ error: 'Database query failed', details: err });
//             }

//             // Query for the earliest date_time in the database
//             const getStartDate = "SELECT MIN(date_time) as startDate FROM STSTokesInfo";
//             db.query(getStartDate, [], (err, result) => {
//                 if (err) {
//                     console.log('Error querying the database:', err);
//                     return res.status(500).send({ error: 'Database query failed', details: err });
//                 }

//                 // Get the start date from the result
//                 const startDate = result[0].startDate;

//                 // Calculate the total token amount for the current date
//                 const currentTotal = currentData.reduce((total, record) => total + Number(record.token_amount), 0);


//                 // Calculate the total token amount for each previous date
// const previousTotals = previousData.reduce((totals, record) => {
//     if (record.date_time) {
//         const date = record.date_time.toISOString().split('T')[0]; // Convert date to YYYY-MM-DD format
//         if (!totals[date]) {
//             totals[date] = 0;
//         }
//         totals[date] += Number(record.token_amount);
//     }
//     return totals;
// }, {});


//                 // Calculate the grand total
// const allData = [...previousData, ...currentData];
// const grandTotal = allData.reduce((total, record) => total + Number(record.token_amount), 0);

//                 // Prepare the response
//                 const response = {
                    
//                     allData: allData.map(record => Number(record.token_amount)),
//                     startDate: startDate,
//                     grandTotal: grandTotal
//                 };

//                 // Send the response
//                 res.json(response);
//             });
//         });
//     });
// });
module.exports = router;
