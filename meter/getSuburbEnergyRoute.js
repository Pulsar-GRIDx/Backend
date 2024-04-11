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
  const getYearlyEnergyByDrn = `SELECT apparent_power 
  FROM MeteringPower 
  WHERE DRN = ? 
    AND date_time >= DATE_FORMAT(NOW() - INTERVAL 12 MONTH, '%Y-01-01') 
    AND date_time <= NOW()
  GROUP BY DRN;
  
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
//Weekly data
      const weeklyEnergyData = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          connection.query(getWeeklyEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { apparent_power: 0 });
            
          });
        });
      }));
//Monthly data
      const monthlyEnergyData = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          connection.query(getMonthlyEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { apparent_power: 0 });
            
          });
        });
      }));
//Yearly data
      const yearlyEnergyByDrn = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          connection.query(getYearlyEnergyByDrn, [drn], (err, energyData) => {
            if (err) reject(err);
            else resolve(energyData.length > 0 ? energyData[0] : { apparent_power: 0 });
           
          });
        });
      }))


      //Calculate weekly totals
      const totalWeeklyEnergy = weeklyEnergyData.reduce((total, record) => {
        if (record.apparent_power !== 0) {
          return total + Number(record.apparent_power) ;
        } else {
          return total;
        }
      }, 0);
     //Calculate monthly totals
      const totalMonthlyEnergy = monthlyEnergyData.reduce((total, record) => {
        if (record.apparent_power !== 0) {
          return total + Number(record.apparent_power);
        } else {
          return total;
        }
      }, 0);
     //Calculate yearly totals
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
      const roundedYearlyEnergy = parseFloat(totalYearlyEnergy.toFixed(6));

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


//Hourly consumption for suburbs

router.get('/getSuburbHourlyEnergy', async (req, res) => {
  const suburbs = req.body.suburbs;

  if (!Array.isArray(suburbs)) {
    return res.status(400).json({ error: 'Invalid suburbs data. Expecting an array.' });
  }

  const getDrnsBySuburb = 'SELECT DRN FROM MeterLocationInfoTable WHERE Suburb = ?';
  const getHourlyEnergyByDrn = `
    SELECT HOUR(date_time) as hour, apparent_power
    FROM (
      SELECT DRN, apparent_power, date_time, ROW_NUMBER() OVER (PARTITION BY DRN, HOUR(date_time) ORDER BY date_time DESC) as rn
      FROM MeteringPower
      WHERE DRN = ? AND DATE(date_time) = CURDATE()
    ) t
    WHERE t.rn = 1
  `;

  let hourlyEnergy = new Array(24).fill(0);

  try {
    await Promise.all(suburbs.map(async (suburb) => {
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
          connection.query(getHourlyEnergyByDrn, [drn], (err, data) => {
            if (err) {
              console.log(err);
              reject(err);
            } else {
              resolve(data);
            }
          });
        });

        energyData.forEach(record => {
          hourlyEnergy[record.hour] += Number(record.apparent_power);
        });
      }));
    }));

    // Round the total energy values to two decimal places
    hourlyEnergy = hourlyEnergy.map(value => parseFloat(value.toFixed(2)));

    res.json({ data: hourlyEnergy });
  } catch (err) {
    console.log('Error querying the database:', err);
    return res.status(500).send({ error: 'Database query failed', details: err.message || err });
  }
});

module.exports = router;