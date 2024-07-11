const express = require('express');
const router = express.Router();
const winston = require('winston');
const NodeCache = require('node-cache');

const { authenticateToken } = require('../admin/authMiddllware');


// Import dotenv
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
// Create a new cache instance
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

router.post('/getSuburbEnergy', authenticateToken, async (req, res) => {
  const suburbs = req.body.suburbs;

  if (!Array.isArray(suburbs)) {
    return res.status(400).json({ error: 'Invalid suburbs data. Expecting an array.' });
  }

  const getCachedResult = (suburb) => cache.get(suburb);

  const setCachedResult = (suburb, result) => {
    cache.set(suburb, result);
  };


  // Query to get DRNs by suburb
const getDrnsBySuburb = 'SELECT DISTINCT DRN FROM MeterLocationInfoTable WHERE Suburb = ?';

// Weekly Query
const getWeeklyEnergyByDrn = `
  SELECT 
    DATE(date_time) as record_date,
    MIN(CAST(units AS DECIMAL(10, 2))) as initial_units,
    MAX(CAST(units AS DECIMAL(10, 2))) as final_units
  FROM 
    MeterCumulativeEnergyUsage
  WHERE 
    DRN = ? AND 
    date_time BETWEEN DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND CURDATE()
  GROUP BY 
    DATE(date_time)
`;

// Monthly Query
const getMonthlyEnergyByDrn = `
  SELECT 
    DATE(date_time) as record_date,
    MIN(CAST(units AS DECIMAL(10, 2))) as initial_units,
    MAX(CAST(units AS DECIMAL(10, 2))) as final_units
  FROM 
    MeterCumulativeEnergyUsage
  WHERE 
    DRN = ? AND 
    date_time BETWEEN DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND CURDATE()
  GROUP BY 
    DATE(date_time)
`;

// Yearly Query
const getYearlyEnergyByDrn = `
  SELECT 
    DATE(date_time) as record_date,
    MIN(CAST(units AS DECIMAL(10, 2))) as initial_units,
    MAX(CAST(units AS DECIMAL(10, 2))) as final_units
  FROM 
    MeterCumulativeEnergyUsage
  WHERE 
    DRN = ? AND 
    date_time BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 YEAR) AND CURDATE()
  GROUP BY 
    DATE(date_time)
`;

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
            resolve(drnData.map((record) => record.DRN));
          }
        });
      });

      // Weekly data
      const weeklyEnergyData = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          connection.query(getWeeklyEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { initial_units: 0, final_units: 0 });
          });
        });
      }));

      // Monthly data
      const monthlyEnergyData = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          connection.query(getMonthlyEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { initial_units: 0, final_units: 0 });
          });
        });
      }));

      // Yearly data
      const yearlyEnergyByDrn = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          connection.query(getYearlyEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { initial_units: 0, final_units: 0 });
          });
        });
      }));

      // Calculate weekly totals
      const totalWeeklyEnergy = weeklyEnergyData.reduce((total, record) => {
        return total + Number(record.final_units) - Number(record.initial_units);
      }, 0);

      // Calculate monthly totals
      const totalMonthlyEnergy = monthlyEnergyData.reduce((total, record) => {
        return total + Number(record.final_units) - Number(record.initial_units);
      }, 0);

      // Calculate yearly totals
      const totalYearlyEnergy = yearlyEnergyByDrn.reduce((total, record) => {
        return total + Number(record.final_units) - Number(record.initial_units);
      }, 0);

      // Round the total energy values to two decimal places
      const roundedWeeklyEnergy = parseFloat(totalWeeklyEnergy.toFixed(2));
      const roundedMonthlyEnergy = parseFloat(totalMonthlyEnergy.toFixed(2));
      const roundedYearlyEnergy = parseFloat(totalYearlyEnergy.toFixed(6));

      const result = { weekly: roundedWeeklyEnergy, monthly: roundedMonthlyEnergy, yearly: roundedYearlyEnergy };

      suburbsWeekly[suburb] = result.weekly;
      suburbsMonthly[suburb] = result.monthly;
      suburbsYearly[suburb] = result.yearly;

      setCachedResult(suburb, result);
    }));

    return res.status(200).json({ suburbsWeekly, suburbsMonthly, suburbsYearly });


    
  } catch (err) {
    console.log('Error querying the database:', err);
    return res.status(500).json({ error: 'An error occurred while querying the database.' });
  }
});



//Hourly consumption for suburbs

// 'SELECT DRN FROM MeterLocationInfoTable WHERE Suburb = ?';
//   const getHourlyEnergyByDrn = `
//     SELECT HOUR(date_time) as hour, apparent_power
//     FROM (
//       SELECT DRN, apparent_power, date_time, ROW_NUMBER() OVER (PARTITION BY DRN, HOUR(date_time) ORDER BY date_time DESC) as rn
//       FROM MeteringPower
//       WHERE DRN = ? AND DATE(date_time) = CURDATE()
//     ) t
//     WHERE t.rn = 1
//   `;



router.post('/getSuburbHourlyEnergy', authenticateToken, async (req, res) => {
  const suburbs = req.body.suburbs;

  if (!Array.isArray(suburbs)) {
    return res.status(400).json({ error: 'Invalid suburbs data. Expecting an array.' });
  }

  const getDrnsBySuburb = 'SELECT DRN FROM MeterLocationInfoTable WHERE Suburb = ?';
  
  const getEnergyByDrn = `
    SELECT HOUR(date_time) as hour, final_units - initial_units as power_consumption
    FROM (
      SELECT 
        DRN,
        date_time,
        MIN(CAST(units AS DECIMAL(10, 2))) as initial_units,
        MAX(CAST(units AS DECIMAL(10, 2))) as final_units
      FROM 
        MeterCumulativeEnergyUsage
      WHERE 
        DRN = ? AND 
        DATE(date_time) = CURDATE()
      GROUP BY 
        HOUR(date_time)
    ) t
  `;

  let suburbEnergy = {};

  try {
    await Promise.all(suburbs.map(async (suburb) => {
      let totalEnergy = 0;

      const drns = await new Promise((resolve, reject) => {
        connection.query(getDrnsBySuburb, [suburb], (err, drnData) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(drnData.map((record) => record.DRN));
          }
        });
      });

      await Promise.all(drns.map(async (drn) => {
        const energyData = await new Promise((resolve, reject) => {
          connection.query(getEnergyByDrn, [drn], (err, data) => {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              resolve(data);
            }
          });
        });

        energyData.forEach(record => {
          totalEnergy += Number(record.power_consumption);
        });
      }));

      // Round the total energy value to two decimal places
      totalEnergy = parseFloat(totalEnergy.toFixed(2));

      suburbEnergy[suburb] = totalEnergy;
    }));

    res.json({ data: suburbEnergy });
  } catch (err) {
    console.log('Error querying the database:', err);
    return res.status(500).send({ error: 'Database query failed', details: err.message || err });
  }
});

  
module.exports = router;