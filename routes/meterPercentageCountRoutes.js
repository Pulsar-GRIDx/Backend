const express = require('express');
const router = express.Router();



//Import dotenv
const dotenv = require('dotenv'); // Import dotenv
const connection = require("../config/db");



//Configure dotenv
dotenv.config();


router.get('/meter_change', (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Query to count unique DRNs and retrieve dates until the current month
  connection.query(`
    SELECT
      COUNT(DISTINCT DRN) AS count,
      MIN(date_time) AS earliestDate,
      MAX(date_time) AS latestDate,
      (
        SELECT COUNT(DISTINCT DRN)
        FROM MeterProfileReal
        WHERE DATE_FORMAT(date_time, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
      ) AS currentMonthCount,
      (
        SELECT COUNT(DISTINCT DRN)
        FROM MeterProfileReal
        WHERE DATE_FORMAT(date_time, '%Y-%m') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m')
      ) AS previousMonthCount
    FROM MeterProfileReal
    WHERE YEAR(date_time) < ${currentYear} OR (YEAR(date_time) = ${currentYear} AND MONTH(date_time) <= ${currentMonth})
  `, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const { count, earliestDate, latestDate, currentMonthCount, previousMonthCount } = results[0];

    // Calculate the percentage change
    const percentageChange = calculatePercentageChange(previousMonthCount, currentMonthCount);

    // Send the data as a JSON response
    res.status(200).json({
      percentageChange: percentageChange,
      currentMonth: {
        count: currentMonthCount,
        earliestDate: earliestDate,
        latestDate: latestDate
      },
      previousMonth: {
        count: previousMonthCount,
        earliestDate: earliestDate,
        latestDate: latestDate
      }
    });
  });
});

// Function to calculate percentage change
function calculatePercentageChange(previousValue, currentValue) {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : 100;
  }

  return ((currentValue - previousValue) / previousValue) * 100;
}


router.get('/active_state_count', (req, res) => {
  // Get the current date and previous date
  const now = new Date();
  const currentDate = formatDate(now);
  const previousDate = formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)); // 24 hours ago

  // Query to count unique DRNs in active state for the current day
  connection.query(`
    SELECT COUNT(DISTINCT DRN) AS currentDayCount
    FROM MeterMainsStateTable
    WHERE state = '1' AND DATE(date_time) = '${currentDate}'
  `, (err, currentResults) => {
    if (err) {
      console.error('Error fetching current day count:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const currentDayCount = currentResults[0].currentDayCount;

    // Query to count unique DRNs in active state for the previous day
    connection.query(`
      SELECT COUNT(DISTINCT DRN) AS previousDayCount
      FROM MeterMainsStateTable
      WHERE state = '1' AND DATE(date_time) = '${previousDate}'
    `, (err, previousResults) => {
      if (err) {
        console.error('Error fetching previous day count:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const previousDayCount = previousResults[0].previousDayCount;

      // Calculate the percentage change
      const percentageChange = activePercent(previousDayCount, currentDayCount);

      // Send the data as a JSON response
      res.status(200).json({
        currentDayCount: currentDayCount,
        previousDayCount: previousDayCount,
        percentageChange: percentageChange
      });
    });
  });
});

// Function to format date as 'YYYY-MM-DD'
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


function activePercent(previousValue, currentValue) {
  if (previousValue === 0 && currentValue === 0) {
    return 0;  // No change
  } else if (previousValue === 0) {
    return currentValue * 100;  // Percentage increase (currentValue is not zero)
  } else if (currentValue === 0) {
    return -previousValue * 100;  // Percentage decrease (previousValue is not zero)
  } else {
    return ((currentValue - previousValue) / previousValue) * 100;
  }
}

router.get('/inactive_state_count', (req, res) => {
  // Get the current date and previous date
  const now = new Date();
  const currentDate = formatDate(now);
  const previousDate = formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)); // 24 hours ago

  // Query to count unique DRNs in active state for the current day
  connection.query(`
    SELECT COUNT(DISTINCT DRN) AS currentDayCount
    FROM MeterMainsStateTable
    WHERE state = '0' AND DATE(date_time) = '${currentDate}'
  `, (err, currentResults) => {
    if (err) {
      console.error('Error fetching current day count:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const currentDayCount = currentResults[0].currentDayCount;

    // Query to count unique DRNs in active state for the previous day
    connection.query(`
      SELECT COUNT(DISTINCT DRN) AS previousDayCount
      FROM MeterMainsStateTable
      WHERE state = '0' AND DATE(date_time) = '${previousDate}'
    `, (err, previousResults) => {
      if (err) {
        console.error('Error fetching previous day count:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const previousDayCount = previousResults[0].previousDayCount;

      // Calculate the percentage change
      const percentageChange = inactivePercent(previousDayCount, currentDayCount);

      // Send the data as a JSON response
      res.status(200).json({
        currentDayCount: currentDayCount,
        previousDayCount: previousDayCount,
        percentageChange: percentageChange
      });
    });
  });
});

// Function to format date as 'YYYY-MM-DD'
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


function inactivePercent(previousValue, currentValue) {
  if (previousValue === 0 && currentValue === 0) {
    return 0;  // No change
  } else if (previousValue === 0) {
    return currentValue * 100;  // Percentage increase (currentValue is not zero)
  } else if (currentValue === 0) {
    return -previousValue * 100;  // Percentage decrease (previousValue is not zero)
  } else {
    return ((currentValue - previousValue) / previousValue) * 100;
  }
}

module.exports = router;