const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const NodeCache = require('node-cache');

const dotenv = require('dotenv'); // Import dotenv
const connection = require("../db");
const db = require('../db');

dotenv.config();
const config = process.env;
const enviroment = process.env;
// Set up Winston logger with console and file transports

// Set up Winston logger with console and file transports
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // You can perform any necessary cleanup here before exiting
  process.exit(1);
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
  // You can perform any necessary cleanup here before exiting
  process.exit(1);
});
//Get Signin router
router.get('/signin', (req, res) => {
    res.sendFile(__dirname + '/signin.html');
  });

  //Get Signup router
  router.get('/signup', (req, res) => {
    res.status(200).json({ message: 'Welome' });
  });

  
// Get user profile router
router.get('/profile/:UserID', (req, res) => {
  const { UserID } = req.params;
  console.log(UserID);

  if (!UserID) {
    return res.status(400).json({ error: 'Invalid UserID' });
  }

  // Query the database to retrieve user profile
  connection.query('SELECT FirstName, Email FROM SystemUsers WHERE UserID = ?', [UserID], (err, results) => {
    if (err) {
      console.error('Error retrieving user profile:', err);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send the user profile data as JSON response
    const userProfile = results[0];
    res.status(200).json({userProfile ,
      redirect: `/protected?token=${encodeURIComponent(token)}`});
  });
});




// Router to get all the details of the users from the database
router.get('/allUsers', (req, res) => {
  // Query the database to get the users
  connection.query('SELECT UserID, FirstName,Email,lastName FROM SystemUsers', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Send the list of users as a JSON response
    res.status(200).type({ users: results 
      });
  });
});

router.get('/allAdmins', (req, res) => {
  // Query the database to get the users
  connection.query('SELECT Admin_ID, Username ,FirstName, LastName, Password, Email, IsActive, AccessLevel FROM SystemAdmins', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Send the list of users as a JSON response
    res.status(200).json({ users: results });
  });
});

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




// Create a new cache instance
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });


router.post('/getSuburbEnergy', async (req, res) => {
  const suburbs = req.body.suburbs;

  const getCachedResult = (suburb) => cache.get(suburb);

  const setCachedResult = (suburb, result) => {
    cache.set(suburb, result);
  };

  const getDrnsBySuburb = 'SELECT DRN FROM MeterLocationInfoTable WHERE Suburb = ?';
  const getEnergyByDrn = 'SELECT active_energy FROM MeterCumulativeEnergyUsage WHERE DRN = ? AND DATE(date_time) = DATE(NOW()) ORDER BY date_time DESC LIMIT 1';

  try {
    const results = await Promise.all(suburbs.map(async (suburb) => {
      // Check if result is already cached
      const cachedResult = getCachedResult(suburb);
      if (cachedResult) {
        return cachedResult;
      }

      const drns = await new Promise((resolve, reject) => {
        db.query(getDrnsBySuburb, [suburb], (err, drnData) => {
          if (err) reject(err);
          else resolve(drnData.map((record) => record.DRN));
          console.log(drnData);
        });
      });

      const energyData = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          db.query(getEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { active_energy: null });
            console.log(energyData);
          });
        });
      }));

      const totalEnergy = energyData.reduce((total, record) => {
        if (record.active_energy !== null) {
          return total + Number(record.active_energy);
        } else {
          return total;
        }
      }, 0);

      const result = { [suburb]: totalEnergy };

      // Cache the result for future use
      setCachedResult(suburb, result);

      return result;
    }));

    res.json(Object.assign({}, ...results));
  } catch (err) {
    console.log('Error querying the database:', err);
    return res.status(500).send({ error: 'Database query failed', details: err });
  }
});

module.exports = router;