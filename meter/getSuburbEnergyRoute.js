const express = require('express');
const router = express.Router();
const winston = require('winston');
const NodeCache = require('node-cache');


//Import dotenv
const dotenv = require('dotenv'); // Import dotenv
const connection = require("../config/db");



//Configure dotenv
dotenv.config();


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
  const getWeeklyEnergyByDrn = 'SELECT apparent_power FROM MeteringPower WHERE DRN = ? AND date_time >= CURDATE() - INTERVAL 6 DAY GROUP BY DRN ';
  //Monthly Query
  const getMonthlyEnergyByDrn = 'SELECT apparent_power FROM MeteringPower WHERE DRN = ? AND date_time >= CURDATE() - INTERVAL 30 DAY GROUP BY DRN  ';
  //Yearly Query
  const getYearlyEnergyByDrn = 'SELECT apparent_power FROM MeteringPower WHERE DRN = ? AND date_time >= CURDATE() - INTERVAL 365 DAY GROUP BY DRN ';

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
        connection.query(getDrnsBySuburb, [suburb], (err, drnData) => {
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
          connection.query(getWeeklyEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { apparent_power: 0 });
            console.log(energyData);
          });
        });
      }));
//Monthly data
      const monthlyEnergyData = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          connection.query(getMonthlyEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { active_energy: 0 });
            console.log(energyData);
          });
        });
      }));
//Yearly data
      const yearlyEnergyByDrn = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          connection.query(getYearlyEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { active_energy: 0 });
            console.log(energyData);
          });
        });
      }))

      const totalWeeklyEnergy = weeklyEnergyData.reduce((total, record) => {
        if (record.apparent_power !== 0) {
          return total + Number(record.apparent_power) ;
        } else {
          return total;
        }
      }, 0);

      const totalMonthlyEnergy = monthlyEnergyData.reduce((total, record) => {
        if (record.apparent_power !== 0) {
          return total + Number(record.apparent_power);
        } else {
          return total;
        }
      }, 0);

      const totalYearlyEnergy = yearlyEnergyByDrn.reduce((total, record) => {
        if (record.apparent_power !== 0) {
          return total + Number(record.apparent_power);
        } else {
          return total;
        }
      }, 0);

      // Round the total energy values to two decimal places
      const roundedWeeklyEnergy = parseFloat(totalWeeklyEnergy.toFixed(2));
      const roundedMonthlyEnergy = parseFloat(totalMonthlyEnergy.toFixed(2));
      const roundedYearlyEnergy = parseFloat(totalYearlyEnergy.toFixed(2));

      const result = { weekly: roundedWeeklyEnergy, monthly: roundedMonthlyEnergy, yearly: roundedYearlyEnergy };

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
      const energyQuery = 'SELECT DATE(date_time) as date, SUM(apparent_power) as total FROM MeteringPower WHERE date_time BETWEEN ? AND ? GROUP BY DATE(date_time)';
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
                              voltage: voltageAndCurrentRecord ? voltageAndCurrentRecord.voltage : 0,
                              current: voltageAndCurrentRecord ? voltageAndCurrentRecord.current : 0,
                          };
                      });
                      resolve(results);
                  }
              });
          }
      });
  });
}



async function getActiveEnergy(startDate, endDate) {
  return new Promise((resolve, reject) => {
      const query = `SELECT DATE(date_time) as day, SUM(apparent_power) as total_apparent_power FROM MeteringPower WHERE date_time >= ? AND date_time < ? GROUP BY day`;
      connection.query(query, [startDate, endDate], (err, results) => {
          if (err) return reject(err);
          resolve(results);
      });
  });
}

router.get('/active-energy', async (req, res) => {
  const now = new Date();
  const startOfCurrentWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const startOfLastWeek = new Date(startOfCurrentWeek - 7 * 24 * 60 * 60 * 1000);
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const activeEnergyThisWeek = await getActiveEnergy(startOfCurrentWeek, now);
  const activeEnergyLastWeek = await getActiveEnergy(startOfLastWeek, startOfCurrentWeek);
  const activeEnergyThisMonth = await getActiveEnergy(startOfCurrentMonth, now);
  const activeEnergyLastMonth = await getActiveEnergy(startOfLastMonth, startOfCurrentMonth);

  res.json({
      thisWeek: activeEnergyThisWeek,
      lastWeek: activeEnergyLastWeek,
      thisMonth: activeEnergyThisMonth,
      lastMonth: activeEnergyLastMonth
  });
});

module.exports = router;