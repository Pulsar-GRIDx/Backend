const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const authenticateTokenAndGetAdmin_ID = require('../middleware/authenticateTokenAndGet Admin_ID');
const NodeCache = require('node-cache');

const dotenv = require('dotenv'); // Import dotenv
const connection = require("../config/db");
const db = require("../config/db");

dotenv.config();
// const config = process.env;
// const enviroment = process.env;
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



// router.use(authenticateTokenAndGetAdmin_ID);
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






// Create a new cache instance
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });


router.post('/getSuburbEnergy', async (req, res) => {
  const suburbs = req.body.suburbs;

  if (!Array.isArray(suburbs)) {
    return res.status(400).json({ error: 'Invalid suburbs data. Expecting an array.' });
  }

  const getCachedResult = (suburb) => cache.get(suburb);

  const setCachedResult = (suburb, result) => {
    cache.set(suburb, result);
  };

  const getDrnsBySuburb = 'SELECT DRN FROM MeterLocationInfoTable WHERE Suburb = ?';
  //Weekly Query
  const getWeeklyEnergyByDrn = 'SELECT active_energy FROM MeterCumulativeEnergyUsage WHERE DRN = ? AND date_time >= CURDATE() - INTERVAL 6 DAY GROUP BY DRN ORDER BY date_time DESC LIMIT 1';
  //Monthly Query
  const getMonthlyEnergyByDrn = 'SELECT active_energy FROM MeterCumulativeEnergyUsage WHERE DRN = ? AND date_time >= CURDATE() - INTERVAL 30 DAY GROUP BY DRN ORDER BY date_time DESC LIMIT 1';
  //Yearly Query
  const getYearlyEnergyByDrn = 'SELECT active_energy FROM MeterCumulativeEnergyUsage WHERE DRN = ? AND date_time >= CURDATE() - INTERVAL 365 DAY GROUP BY DRN ORDER BY date_time DESC LIMIT 1';

  let suburbsWeekly = {};
  let suburbsMonthly = {};
  let suburbsYearly = {};

  try {
    await Promise.all(suburbs.map(async (suburb) => {
      const cachedResult = getCachedResult(suburb);
      if (cachedResult) {
        suburbsWeekly[suburb] = cachedResult.weekly;
        suburbsMonthly[suburb] = cachedResult.monthly;
        suburbsYearly[suburb] = cachedResult.yearly;
        return;
      }
      const drns = await new Promise((resolve, reject) => {
        db.query(getDrnsBySuburb, [suburb], (err, drnData) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log(drnData);
            resolve(drnData.map((record) => record.DRN));
          }
        });
      });
//Weekly data
      const weeklyEnergyData = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          db.query(getWeeklyEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { active_energy: null });
            console.log(energyData);
          });
        });
      }));
//Monthly data
      const monthlyEnergyData = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          db.query(getMonthlyEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { active_energy: null });
            console.log(energyData);
          });
        });
      }));
//Yearly data
      const yearlyEnergyByDrn = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          db.query(getYearlyEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { active_energy: null });
            console.log(energyData);
          });
        });
      }))

      const totalWeeklyEnergy = weeklyEnergyData.reduce((total, record) => {
        if (record.active_energy !== null) {
          return total + Number(record.active_energy);
        } else {
          return total;
        }
      }, 0);

      const totalMonthlyEnergy = monthlyEnergyData.reduce((total, record) => {
        if (record.active_energy !== null) {
          return total + Number(record.active_energy);
        } else {
          return total;
        }
      }, 0);

      const totalYearlyEnergy = yearlyEnergyByDrn.reduce((total, record) => {
        if (record.active_energy !== null) {
          return total + Number(record.active_energy);
        } else {
          return total;
        }
      }, 0);

      const result = { weekly: totalWeeklyEnergy, monthly: totalMonthlyEnergy , yearly: totalYearlyEnergy};

      suburbsWeekly[suburb] = result.weekly;
      suburbsMonthly[suburb] = result.monthly;
      suburbsYearly[suburb] = result.yearly;

      setCachedResult(suburb, result);
    }));

    res.json({ suburbsWeekly, suburbsMonthly ,suburbsYearly});
  } catch (err) {
    console.log('Error querying the database:', err);
    return res.status(500).send({ error: 'Database query failed', details: err.message || err });
  }
});




// Function to get active energy totals
async function getActiveEnergyTotalsAndVoltageCurrent(startDate, endDate) {
  return new Promise((resolve, reject) => {
      const energyQuery = 'SELECT DATE(date_time) as date, SUM(active_energy) as total FROM MeterCumulativeEnergyUsage WHERE date_time BETWEEN ? AND ? GROUP BY DATE(date_time)';
      const voltageAndCurrentQuery = "SELECT voltage, current, DATE(date_time) as date_time FROM MeteringPower WHERE date_time BETWEEN ? AND ?";

      connection.query(energyQuery, [startDate, endDate], (error, energyResults) => {
          if (error) {
              reject(error);
          } else {
              connection.query(voltageAndCurrentQuery, [startDate, endDate], (error, voltageAndCurrentResults) => {
                  if (error) {
                      reject(error);
                  } else {
                      const results = energyResults.map(energyRecord => {
                          const voltageAndCurrentRecord = voltageAndCurrentResults.find(record => record.date_time === energyRecord.date);
                          return {
                              date: energyRecord.date,
                              totalActiveEnergy: energyRecord.total,
                              voltage: voltageAndCurrentRecord ? voltageAndCurrentRecord.voltage : null,
                              current: voltageAndCurrentRecord ? voltageAndCurrentRecord.current : null,
                          };
                      });
                      resolve(results);
                  }
              });
          }
      });
  });
}



// router.get('/weeklyDataAmount', async (req, res) => {
//   const now = new Date();
//   const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
//   const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - now.getDay()));
//   const startOfLastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
//   const endOfLastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 1);
//   const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//   const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//   const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//   const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

//   const currentWeekResult = await getActiveEnergyTotalsAndVoltageCurrent(startOfWeek, endOfWeek);
//   const lastWeekResult = await getActiveEnergyTotalsAndVoltageCurrent(startOfLastWeek, endOfLastWeek);
//   const currentMonthResult = await getActiveEnergyTotalsAndVoltageCurrent(startOfMonth, endOfMonth);
//   const lastMonthResult = await getActiveEnergyTotalsAndVoltageCurrent(startOfLastMonth, endOfLastMonth);

//   const currentweekVoltageTotal = currentWeekResult.reduce((total, record) => total + record.voltage, 0);
//   const currentweekCurrentTotal = currentWeekResult.reduce((total, record) => total + record.current, 0);

//   res.json({
//       currentWeekResult,
//       lastWeekResult,
//       currentMonthResult,
//       lastMonthResult,
//       currentweekVoltageTotal,
//       currentweekCurrentTotal
//   });
// });


module.exports = router;