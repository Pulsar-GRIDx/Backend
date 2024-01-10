const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/tokenAmount', (req, res) => {
    // Get the current date
    const currentDate = new Date();

    // Query for records where display_msg is 'Accept' and date is the current date
    const getCurrentData = "SELECT token_amount FROM STSTokesInfo WHERE display_msg = 'Accept' AND date_time = ?";
    db.query(getCurrentData, [currentDate], (err, currentData) => {
        if (err) {
            console.log('Error querying the database:', err);
            return res.status(500).send({ error: 'Database query failed', details: err });
        }

        // Query for all previous records
        const getPreviousData = "SELECT token_amount FROM STSTokesInfo WHERE display_msg = 'Accept' AND date_time < ?";
        db.query(getPreviousData, [currentDate], (err, previousData) => {
            if (err) {
                console.log('Error querying the database:', err);
                return res.status(500).send({ error: 'Database query failed', details: err });
            }

            // Calculate the total token amount for the current date
            const currentTotal = currentData.reduce((total, record) => total + record.tokenamount, 0);

            // Calculate the total token amount for each previous date
            const previousTotals = previousData.reduce((totals, record) => {
                if (!totals[record.date]) {
                    totals[record.date] = 0;
                }
                totals[record.date] += record.tokenamount;
                return totals;
            }, {});

            // Calculate the grand total
            const grandTotal = currentTotal + Object.values(previousTotals).reduce((total, amount) => total + amount, 0);

            // Prepare the response
            // Prepare the response
const response = {
    allData: [...previousData, ...currentData],
    startDate: previousData[0].date,
    grandTotal: grandTotal
};


            // Send the response
            res.json(response);
        });
    });
});
module.exports = router;
