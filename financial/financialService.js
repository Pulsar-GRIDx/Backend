const db = require('../config/db'); // replace './db' with the path to your database connection file
//------------------------------------------All time perionds-------------------------------------//

exports.getTokenAmounts = () => {
  const getCurrentDayTokenAmount = "SELECT COALESCE(SUM(token_amount), 0) as total_token_amount FROM STSTokesInfo WHERE DATE(date_time) = CURDATE() AND display_msg = 'Accept'";
  const getCurrentMonthTokenAmount = "SELECT COALESCE(SUM(token_amount), 0) as total_token_amount FROM STSTokesInfo WHERE MONTH(date_time) = MONTH(CURRENT_DATE()) AND display_msg = 'Accept'";
  const getCurrentYearTokenAmount = "SELECT COALESCE(SUM(token_amount), 0) as total_token_amount FROM STSTokesInfo WHERE YEAR(date_time) = YEAR(CURRENT_DATE()) AND display_msg = 'Accept'";

  return new Promise((resolve, reject) => {
    db.query(getCurrentDayTokenAmount, (err, dayResult) => {
      if (err) {
        console.error('Error querying the database:', err);
        reject(err); // Reject the promise with the error
      }
      else {
        db.query(getCurrentMonthTokenAmount, (err, monthResult) => {
          if (err) {
        console.error('Error querying the database:', err);
        reject(err); // Reject the promise with the error
      }
          else {
            db.query(getCurrentYearTokenAmount, (err, yearResult) => {
              if (err) {
        console.error('Error querying the database:', err);
        reject(err); // Reject the promise with the error
      }
              else {
                resolve({
                  day: dayResult[0].total_token_amount,
                  month: monthResult[0].total_token_amount,
                  year: yearResult[0].total_token_amount
                });
              }
            });
          }
        });
      }
    });
  });
};



//---------------------------------------------------Get financial stats for all the months of last year and current year------------------------//
exports.getMonthlyTokenAmountForCurrentAndLastYear = () => {
  const getMonthlyTokenAmountForCurrentAndLastYear = `
    SELECT 
      YEAR(date_time) as year,
      MONTH(date_time) as month,
      SUM(token_amount) as total_token_amount
    FROM 
      STSTokesInfo 
    WHERE 
      YEAR(date_time) IN (YEAR(CURRENT_DATE()), YEAR(CURRENT_DATE()) - 1)
      AND display_msg = 'Accept'
    GROUP BY 
      YEAR(date_time),
      MONTH(date_time)
  `;
  return new Promise((resolve, reject) => {
    db.query(getMonthlyTokenAmountForCurrentAndLastYear,
       (err, monthlyData) => {
      if (err) {
        console.error('Error querying the database:', err);
        reject(err); // Reject the promise with the error
      }
      else resolve(monthlyData);
    });
  });
};
//--------------------------------------------------------Current and last week financial data--------------------------//
exports.getWeeklyTokenAmountForCurrentAndLastWeek = () => {
  const getWeeklyTokenAmountForCurrentAndLastWeek = `
    SELECT 
      YEAR(date_time) as year,
      WEEK(date_time, 1) as week,
      DAYNAME(date_time) as day,
      SUM(token_amount) as total_token_amount
    FROM 
      STSTokesInfo 
    WHERE 
      WEEK(date_time, 1) IN (WEEK(CURRENT_DATE(), 1), WEEK(CURRENT_DATE(), 1) - 1)
      AND display_msg = 'Accept'
    GROUP BY 
      YEAR(date_time),
      WEEK(date_time, 1),
      DAYNAME(date_time)
  `;
  return new Promise((resolve, reject) => {
    db.query(getWeeklyTokenAmountForCurrentAndLastWeek,
       (err, weeklyData) => {
      if (err) {
        console.error('Error querying the database:', err);
        reject(err); // Reject the promise with the error
      }
      else resolve(weeklyData);
    });
  });
};
//Hourly revenue
exports.getTotalRevenuePerHour = function(callback) {
  const query = `
    WITH RECURSIVE hours AS (
      SELECT 0 AS hour
      UNION ALL
      SELECT hour + 1
      FROM hours
      WHERE hour < 23
    )
    SELECT hours.hour, COALESCE(SUM(token_amount), 0) as total_revenue
    FROM hours
    LEFT JOIN STSTokesInfo
    ON HOUR(date_time) = hours.hour AND DATE(date_time) = CURDATE() AND display_msg = 'Accept'
    GROUP BY hours.hour
    ORDER BY hours.hour
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    // Extract only the total_revenue from each row and return as an array
    const revenues = results.map(row => row.total_revenue);
    callback(null, revenues);
  });
}

//Suburb Time periods
exports.getRevenueByTimePeriodsBySuburb = function(suburbs, callback) {
  console.log(suburbs);
  const query = `
    SELECT 
      SUM(IF(DATE(date_time) = CURDATE(), token_amount, 0)) as currentDayRevenue,
      SUM(IF(MONTH(date_time) = MONTH(CURDATE()) AND YEAR(date_time) = YEAR(CURDATE()), token_amount, 0)) as currentMonthRevenue,
      SUM(IF(YEAR(date_time) = YEAR(CURDATE()), token_amount, 0)) as currentYearRevenue
    FROM STSTokesInfo
    WHERE DRN IN (
      SELECT DRN
      FROM MeterLocationInfoTable
      WHERE Suburb IN (?)
    )
  `;

  db.query(query, [suburbs], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    if (results.length === 0) {
      return callback(null, { currentDayRevenue: 0, currentMonthRevenue: 0, currentYearRevenue: 0 });
    }

    callback(null, results[0]);
  });
}

//Weekly Suburb Revenue
exports.getWeeklyRevenueBySuburb = function(suburbs, callback) {
  
  const query = `
    SELECT 
      DAYOFWEEK(date_time) as dayOfWeek,
      SUM(IF(WEEK(date_time, 1) = WEEK(CURDATE(), 1), token_amount, 0)) as currentWeekRevenue,
      SUM(IF(WEEK(date_time, 1) = WEEK(CURDATE(), 1) - 1 AND YEAR(date_time) = YEAR(CURDATE()), token_amount, 0)) as lastWeekRevenue
    FROM STSTokesInfo
    WHERE DRN IN (
      SELECT DRN
      FROM MeterLocationInfoTable
      WHERE Suburb IN (?)
    )
    GROUP BY DAYOFWEEK(date_time)
    ORDER BY DAYOFWEEK(date_time);
  `;

  db.query(query, [suburbs], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    // Initialize arrays for current and last week revenues
    let currentWeekRevenue = Array(7).fill(0);
    let lastWeekRevenue = Array(7).fill(0);

    // Fill the arrays with the query results
    results.forEach(result => {
      
      let dayOfWeek = (result.dayOfWeek + 5) % 7;
      currentWeekRevenue[dayOfWeek] = result.currentWeekRevenue;
      lastWeekRevenue[dayOfWeek] = result.lastWeekRevenue;
    });

    callback(null, { currentWeekRevenue, lastWeekRevenue });
  });
}
//Yearly Suburb revenue
exports.getYearlyRevenueBySuburb = function(suburbs, callback) {
  const query = `
    SELECT 
      MONTH(date_time) as month,
      SUM(IF(YEAR(date_time) = YEAR(CURDATE()), token_amount, 0)) as currentYearRevenue,
      SUM(IF(YEAR(date_time) = YEAR(CURDATE()) - 1, token_amount, 0)) as lastYearRevenue
    FROM STSTokesInfo
    WHERE DRN IN (
      SELECT DRN
      FROM MeterLocationInfoTable
      WHERE Suburb IN (?)
    )
    GROUP BY MONTH(date_time)
    ORDER BY MONTH(date_time);
  `;

  db.query(query, [suburbs], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    // Initialize arrays for current and last year revenues
    let currentYearRevenue = Array(12).fill(0);
    let lastYearRevenue = Array(12).fill(0);

    // Fill the arrays with the query results
    results.forEach(result => {
      // MySQL's MONTH function returns 1 for January, 2 for February, ..., 12 for December
      let month = result.month - 1; // Adjust it to make January be 0, February be 1, ..., December be 11
      currentYearRevenue[month] = result.currentYearRevenue;
      lastYearRevenue[month] = result.lastYearRevenue;
    });

    callback(null, { currentYearRevenue, lastYearRevenue });
  });
}
