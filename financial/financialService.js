const db = require('../config/db'); // replace './db' with the path to your database connection file

exports.getCurrentDayTokenAmount = () => {
  const getCurrentDayTokenAmount = "SELECT SUM(token_amount) as total_token_amount FROM STSTokesInfo WHERE DATE(date_time) = CURDATE() AND display_msg = 'Accept'";
  return new Promise((resolve, reject) => {
    db.query(getCurrentDayTokenAmount,
       (err, result) => {
      if (err) reject(err);
      else resolve(result[0].total_token_amount);
    });
  });
};
//-------------------------------------------------------------Current Month Revenue  ---------------------------------------//
exports.getCurrentMonthTokenAmount = () => {
  const getCurrentMonthTokenAmount = "SELECT SUM(token_amount) as total_token_amount FROM STSTokesInfo WHERE MONTH(date_time) = MONTH(CURRENT_DATE()) AND display_msg = 'Accept'";
  return new Promise((resolve, reject) => {
    db.query(getCurrentMonthTokenAmount,
       (err, result) => {
      if (err) reject(err);
      else resolve(result[0].total_token_amount);
    });
  });
};
///---------------------------------------------------Current Year Total Revenue --------------------------------------//
exports.getCurrentYearTokenAmount = () => {
  const getCurrentYearTokenAmount = "SELECT SUM(token_amount) as total_token_amount FROM STSTokesInfo WHERE YEAR(date_time) = YEAR(CURRENT_DATE()) AND display_msg = 'Accept'";
  return new Promise((resolve, reject) => {
    db.query(getCurrentYearTokenAmount,
       (err, result) => {
      if (err) reject(err);
      else resolve(result[0].total_token_amount);
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
      if (err) reject(err);
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
      if (err) reject(err);
      else resolve(weeklyData);
    });
  });
};