const db = require('../config/db'); // replace './db' with the path to your database connection file
//------------------------------------------All time perionds-------------------------------------//

exports.getTokenAmounts = () => {
  const getCurrentDayTokenAmount = "SELECT COALESCE(SUM(token_amount), 0) as total_token_amount FROM STSTokesInfo WHERE DATE(date_time) = CURDATE() AND display_msg = 'Accept'";
  const getCurrentMonthTokenAmount = "SELECT COALESCE(SUM(token_amount), 0) as total_token_amount FROM STSTokesInfo WHERE MONTH(date_time) = MONTH(CURRENT_DATE()) AND display_msg = 'Accept'";
  const getCurrentYearTokenAmount = "SELECT COALESCE(SUM(token_amount), 0) as total_token_amount FROM STSTokesInfo WHERE YEAR(date_time) = YEAR(CURRENT_DATE()) AND display_msg = 'Accept'";

  return new Promise((resolve, reject) => {
    db.query(getCurrentDayTokenAmount, (err, dayResult) => {
      if (err) reject(err);
      else {
        db.query(getCurrentMonthTokenAmount, (err, monthResult) => {
          if (err) reject(err);
          else {
            db.query(getCurrentYearTokenAmount, (err, yearResult) => {
              if (err) reject(err);
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