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