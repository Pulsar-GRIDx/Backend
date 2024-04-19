const express = require('express');
const router = express.Router();
const winston = require('winston');
const NodeCache = require('node-cache');


//Import dotenv
const dotenv = require('dotenv'); // Import dotenv
const connection = require("../config/db");



//Configure dotenv
dotenv.config();


// Create a new cache instance
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

router.post('/getSuburbChartRevenue', async (req, res) => {
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
  const getWeeklyTokensByDrn = 'SELECT SUM(token_amount) as total_token_amount FROM STSTokesInfo WHERE DRN = ? AND display_msg = "Accept" AND date_time BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE()';
  //Monthly Query
  const getMonthlyTokensByDrn = 'SELECT SUM(token_amount) as total_token_amount FROM STSTokesInfo WHERE DRN = ? AND display_msg = "Accept" AND MONTH(date_time) = MONTH(CURDATE()) AND YEAR(date_time) = YEAR(CURDATE())';
  //Yearly Query
  const getYearlyTokensByDrn = 'SELECT SUM(token_amount) as total_token_amount FROM STSTokesInfo WHERE DRN = ? AND display_msg = "Accept" AND YEAR(date_time) = YEAR(CURDATE())';

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
      const weeklyTokenData = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          connection.query(getWeeklyTokensByDrn, [drn], (err, tokenData) => {
            if (err) reject(err);
            else resolve(tokenData.length > 0 ? tokenData[0] : { total_token_amount: 0 });
          });
        });
      }));
//Monthly data
      const monthlyTokenData = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          connection.query(getMonthlyTokensByDrn, [drn], (err, tokenData) => {
            if (err) reject(err);
            else resolve(tokenData.length > 0 ? tokenData[0] : { total_token_amount: 0 });
          });
        });
      }));
//Yearly data
      const yearlyTokenData = await Promise.all(drns.map(async (drn) => {
        return new Promise((resolve, reject) => {
          connection.query(getYearlyTokensByDrn, [drn], (err, tokenData) => {
            if (err) reject(err);
            else resolve(tokenData.length > 0 ? tokenData[0] : { total_token_amount: 0 });
          });
        });
      }));

      //Calculate weekly totals
      const totalWeeklyTokens = weeklyTokenData.reduce((total, record) => {
        if (record.total_token_amount !== 0) {
          return total + Number(record.total_token_amount);
        } else {
          return total;
        }
      }, 0);
     //Calculate monthly totals
      const totalMonthlyTokens = monthlyTokenData.reduce((total, record) => {
        if (record.total_token_amount !== 0) {
          return total + Number(record.total_token_amount);
        } else {
          return total;
        }
      }, 0);
     //Calculate yearly totals
      const totalYearlyTokens = yearlyTokenData.reduce((total, record) => {
        if (record.total_token_amount !== 0) {
          return total + Number(record.total_token_amount);
        } else {
          return total;
        }
      }, 0);

      suburbsWeekly[suburb] = totalWeeklyTokens;
      suburbsMonthly[suburb] = totalMonthlyTokens;
      suburbsYearly[suburb] = totalYearlyTokens;

      setCachedResult(suburb, {weekly: totalWeeklyTokens, monthly: totalMonthlyTokens, yearly: totalYearlyTokens});
    }));

    res.json({ suburbsWeekly, suburbsMonthly, suburbsYearly });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});


module.exports = router;