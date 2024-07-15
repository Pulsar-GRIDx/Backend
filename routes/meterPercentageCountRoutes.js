const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../admin/authMiddllware');


//Import dotenv
const dotenv = require('dotenv'); // Import dotenv
const connection = require("../config/db");
const { error } = require('winston');



//Configure dotenv
dotenv.config();
// Protected routes
router.use(authenticateToken);

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

// // Function to calculate percentage change
// function calculatePercentageChange(previousValue, currentValue) {
//   if (previousValue === 0) {
//     return currentValue === 0 ? 0 : 100;
//   }

//   return ((currentValue - previousValue) / previousValue) * 100;
// }


router.get('/active_state_count', (req, res) => {
  // Get the current date and previous date
  const now = new Date();
  const currentDate = formatDate(now);
  const previousDate = formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)); // 24 hours ago
  console.log(currentDate,previousDate);
  // Query to count unique DRNs in active state for the current day
  connection.query(`
    SELECT COUNT(DISTINCT DRN) AS currentDayCount
    FROM MeterLoadControl
    WHERE mains_state = '1' AND DATE(date_time) = '${currentDate}'
  `, (err, currentResults) => {
    if (err) {
      console.error('Error fetching current day count:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const currentDayCount = currentResults[0].currentDayCount;

    // Query to count unique DRNs in active state for the previous day
    connection.query(`
      SELECT COUNT(DISTINCT DRN) AS previousDayCount
      FROM MeterLoadControl
      WHERE mains_state = '1' AND DATE(date_time) = '${previousDate}'
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
  console.log(currentDate,previousDate);

  // Query to count unique DRNs in active state for the current day
  connection.query(`
    SELECT COUNT(DISTINCT DRN) AS currentDayCount
    FROM MeterLoadControl
    WHERE mains_state = '0' AND DATE(date_time) = '${currentDate}'
  `, (err, currentResults) => {
    if (err) {
      console.error('Error fetching current day count:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const currentDayCount = currentResults[0].currentDayCount;

    // Query to count unique DRNs in active state for the previous day
    connection.query(`
      SELECT COUNT(DISTINCT DRN) AS previousDayCount
      FROM MeterLoadControl
      WHERE mains_state = '0' AND DATE(date_time) = '${previousDate}'
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

// // Function to format date as 'YYYY-MM-DD'
// function formatDate(date) {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }


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


//Day Increase or Decrease
router.get('/powerIncreaseOrDecrease', (req, res) => {

  // Define SQL queries to fetch current and previous day, month, and year data
  const currentDayAndPreviousDay = `
  SELECT 
    DATE(t.date_time) as date, 
    ABS(SUM(t.final_units - t.initial_units)) as day_consumption
  FROM (
    SELECT 
      DRN, 
      date_time, 
      MIN(CAST(units AS DECIMAL(10, 2))) as initial_units,
      MAX(CAST(units AS DECIMAL(10, 2))) as final_units
    FROM 
      MeterCumulativeEnergyUsage
    WHERE 
      DATE(date_time) = CURDATE()
    GROUP BY 
      DRN, 
      DATE(date_time)
  ) t
`;
  const currentMonthAndPreviousMonth = `
    SELECT ABS(SUM(daily_power_consumption)) AS month_consumption
    FROM DailyPowerConsumption
    WHERE MONTH(date) = MONTH(CURDATE())
  `;
  const currentYearAndPreviousYear = `
    SELECT ABS(SUM(daily_power_consumption)) AS year_consumption
    FROM DailyPowerConsumption
    WHERE YEAR(date) = YEAR(CURDATE())
  `;
  const previousDay = `
    SELECT ABS(SUM(daily_power_consumption)) AS day_consumption
    FROM DailyPowerConsumption
    WHERE DATE(date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
  `;
  const previousMonth = `
    SELECT ABS(SUM(daily_power_consumption)) AS month_consumption
    FROM DailyPowerConsumption
    WHERE YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE()) - 1
  `;
  const previousYear = `
    SELECT ABS(SUM(daily_power_consumption)) AS year_consumption
    FROM DailyPowerConsumption
    WHERE YEAR(date) = YEAR(CURDATE()) - 1
  `;

  // Execute the SQL queries and calculate percentage increase/decrease
  Promise.all([
    executeQuery(currentDayAndPreviousDay),
    executeQuery(currentMonthAndPreviousMonth),
    executeQuery(currentYearAndPreviousYear),
    executeQuery(previousDay),
    executeQuery(previousMonth),
    executeQuery(previousYear)
    
  ])
  .then(results => {
    console.log('Query results:', results); 
    const currentDayConsumption = results[0][0].day_consumption;
    const currentMonthConsumption = results[1][0].month_consumption;
    const currentYearConsumption = results[2][0].year_consumption;
    const previousDayConsumption = results[3][0].day_consumption;
    const previousMonthConsumption = results[4][0].month_consumption;
    const previousYearConsumption = results[5][0].year_consumption;

    

    const day = calculatePercentageChange(currentDayConsumption, previousDayConsumption);
    const month = calculatePercentageChange(currentMonthConsumption, previousMonthConsumption);
    const year = calculatePercentageChange(currentYearConsumption, previousYearConsumption);

    // Send the percentage increase/decrease as JSON response
    res.status(200).json({ day : day.toFixed(2), month : month.toFixed(2), year : year.toFixed(2) });
  })
  .catch(error => {
    console.error('Error querying the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  });
});

// Function to execute SQL queries
function executeQuery(query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
        console.log(results);
      }
    });
  });
}

// // Function to calculate percentage change

// function calculatePercentageChange(currentValue, previousValue) {
//   return (((currentValue - previousValue) / previousValue) * 100).toFixed(2);
// }







//Suburb percentage increases
router.post('/suburbAdvancedPowerIncreaseOrDecrease', (req, res) => {
  const suburbs = req.body.suburbs;
  console.log(suburbs);

  // Define SQL query to fetch current and previous day data
  const currentDayAndPreviousDay = `
    SELECT 
      SUM(IF(DATE(record_date) = CURDATE(), final_units - initial_units, 0)) as currentDayTotal,
      SUM(IF(DATE(record_date) = DATE_SUB(CURDATE(), INTERVAL 1 DAY), final_units - initial_units, 0)) as previousDayTotal
    FROM (
      SELECT 
        DRN,
        DATE(date_time) as record_date,
        MIN(CAST(units AS DECIMAL)) as initial_units,
        MAX(CAST(units AS DECIMAL)) as final_units
      FROM 
        MeterCumulativeEnergyUsage
      WHERE 
        YEAR(date_time) IN (YEAR(CURDATE()), YEAR(CURDATE()) - 1)
      GROUP BY 
        DRN, 
        DATE(date_time)
    ) t
    WHERE t.DRN IN (
        SELECT DRN
        FROM MeterLocationInfoTable
        WHERE Suburb IN (?)
    );
  `;
    

  const currentMonthAndPreviousMonth = `
    SELECT 
      SUM(IF(MONTH(record_date) = MONTH(CURDATE()), final_units - initial_units, 0)) as currentMonthTotal,
      SUM(IF(MONTH(record_date) = MONTH(CURDATE()) - 1, final_units - initial_units, 0)) as previousMonthTotal
    FROM (
      SELECT 
        DRN,
        DATE(date_time) as record_date,
        MIN(CAST(units AS DECIMAL)) as initial_units,
        MAX(CAST(units AS DECIMAL)) as final_units
      FROM 
        MeterCumulativeEnergyUsage
      WHERE 
        YEAR(date_time) IN (YEAR(CURDATE()), YEAR(CURDATE()) - 1)
      GROUP BY 
        DRN, 
        DATE(date_time)
    ) t
    WHERE t.DRN IN (
        SELECT DRN
        FROM MeterLocationInfoTable
        WHERE Suburb = ?
    )
  `;

  const currentYearAndPreviousYear = `
    SELECT 
      SUM(IF(YEAR(record_date) = YEAR(CURDATE()), final_units - initial_units, 0)) as currentYearTotal,
      SUM(IF(YEAR(record_date) = YEAR(CURDATE()) - 1, final_units - initial_units, 0)) as previousYearTotal
    FROM (
      SELECT 
        DRN,
        DATE(date_time) as record_date,
        MIN(CAST(units AS DECIMAL)) as initial_units,
        MAX(CAST(units AS DECIMAL)) as final_units
      FROM 
        MeterCumulativeEnergyUsage
      WHERE 
        YEAR(date_time) IN (YEAR(CURDATE()), YEAR(CURDATE()) - 1)
      GROUP BY 
        DRN, 
        DATE(date_time)
    ) t
    WHERE t.DRN IN (
        SELECT DRN
        FROM MeterLocationInfoTable
        WHERE Suburb = ?
    )
  `;

  // Execute the SQL queries to fetch current and previous data
  Promise.all([
    executeQuery(currentDayAndPreviousDay, [suburbs]),
    executeQuery(currentMonthAndPreviousMonth, [suburbs]),
    executeQuery(currentYearAndPreviousYear, [suburbs])
  ])
  .then(results => {
    console.log(results);
    const currentDayTotal = results[0][0].currentDayTotal;
    const previousDayTotal = results[0][0].previousDayTotal;
    const currentMonthTotal = results[1][0].currentMonthTotal;
    const previousMonthTotal = results[1][0].previousMonthTotal;
    const currentYearTotal = results[2][0].currentYearTotal;
    const previousYearTotal = results[2][0].previousYearTotal;

    // Calculate percentage increase or decrease for day, month, and year
    const dayPercentage = calculatePercentageChange(currentDayTotal, previousDayTotal);
    const monthPercentage = calculatePercentageChange(currentMonthTotal, previousMonthTotal);
    const yearPercentage = calculatePercentageChange(currentYearTotal, previousYearTotal);

    // Send the percentage increase/decrease as JSON response
    res.status(200).json({ dayPercentage, monthPercentage, yearPercentage });
  })
  .catch(error => {
    console.error('Error querying the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  });
});

// // Function to execute SQL queries
// function executeQuery(query, values) {
//   return new Promise((resolve, reject) => {
//     connection.query(query, values, (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// }

// Function to calculate percentage change
function calculatePercentageChange(currentValue, previousValue) {
  if (previousValue === 0) return 0; // Avoid division by zero
  const newValue = (((currentValue - previousValue) / previousValue) * 100).toFixed(2)
  return parseFloat(newValue);
}


//---------------------------------------------------------------------System Token increase or decrease -----------------------------------------------------------------//

router.get('/tokenAmountIncreaseOrDecrease', (req, res) => {
  // Define SQL queries to fetch current and previous day, month, and year data for token amount
  const getCurrentDayTokenAmount = "SELECT COALESCE(SUM(token_amount), 0) as total_token_amount FROM STSTokesInfo WHERE DATE(date_time) = CURDATE() AND display_msg = 'Accept'";
  const getCurrentMonthTokenAmount = "SELECT COALESCE(SUM(token_amount), 0) as total_token_amount FROM STSTokesInfo WHERE MONTH(date_time) = MONTH(CURDATE()) AND display_msg = 'Accept'";
  const getCurrentYearTokenAmount = "SELECT COALESCE(SUM(token_amount), 0) as total_token_amount FROM STSTokesInfo WHERE YEAR(date_time) = YEAR(CURDATE()) AND display_msg = 'Accept'";
  const getPreviousDayTokenAmount = "SELECT COALESCE(SUM(token_amount), 0) as total_token_amount FROM STSTokesInfo WHERE DATE(date_time) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND display_msg = 'Accept'";
  const getPreviousMonthTokenAmount = "SELECT COALESCE(SUM(token_amount), 0) as total_token_amount FROM STSTokesInfo WHERE YEAR(date_time) = YEAR(CURDATE()) AND MONTH(date_time) = MONTH(CURDATE()) - 1 AND display_msg = 'Accept'";
  const getPreviousYearTokenAmount = "SELECT COALESCE(SUM(token_amount), 0) as total_token_amount FROM STSTokesInfo WHERE YEAR(date_time) = YEAR(CURDATE()) - 1 AND display_msg = 'Accept'";

  // Execute the SQL queries to fetch current and previous data for token amount
  Promise.all([
    executeQuery(getCurrentDayTokenAmount),
    executeQuery(getCurrentMonthTokenAmount),
    executeQuery(getCurrentYearTokenAmount),
    executeQuery(getPreviousDayTokenAmount),
    executeQuery(getPreviousMonthTokenAmount),
    executeQuery(getPreviousYearTokenAmount)
  ])
  .then(results => {
    const currentDayTokenAmount = results[0][0].total_token_amount;
    const currentMonthTokenAmount = results[1][0].total_token_amount;
    const currentYearTokenAmount = results[2][0].total_token_amount;
    const previousDayTokenAmount = results[3][0].total_token_amount;
    const previousMonthTokenAmount = results[4][0].total_token_amount;
    const previousYearTokenAmount = results[5][0].total_token_amount;

    // Calculate percentage increase or decrease for token amount for day, month, and year
    const dayPercentage = calculatePercentageChange(currentDayTokenAmount, previousDayTokenAmount);
    const monthPercentage = calculatePercentageChange(currentMonthTokenAmount, previousMonthTokenAmount);
    const yearPercentage = calculatePercentageChange(currentYearTokenAmount, previousYearTokenAmount);

    // Send the percentage increase/decrease as JSON response
    res.json({ 
      dayPercentage,
      monthPercentage,
      yearPercentage
    });
  })
  .catch(error => {
    console.error('Error querying the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  });
});

// Function to execute SQL queries
function executeQuery(query, values) {
  return new Promise((resolve, reject) => {
    connection.query(query, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// // Function to calculate percentage change
// function calculatePercentageChange(currentValue, previousValue) {
//   if (previousValue === 0) return 0; // Avoid division by zero
//   const newValue = (((currentValue - previousValue) / previousValue) * 100).toFixed(2);
//   return parseFloat(newValue);
// }


//------------------------------------------------------------------------Suburb Token Increase or decrease ----------------------------------------------//
router.post('/suburbRevenueIncreaseOrDecrease', (req, res) => {
  const suburbs = req.body.suburbs;
  console.log(suburbs);

  // Define SQL query to fetch current and previous day, month, and year data for revenue
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

  // Define SQL query to fetch previous day revenue
  const getPreviousDayRevenue = `
    SELECT 
      SUM(IF(DATE(date_time) = DATE_SUB(CURDATE(), INTERVAL 1 DAY), token_amount, 0)) as previousDayRevenue
    FROM STSTokesInfo
    WHERE DRN IN (
      SELECT DRN
      FROM MeterLocationInfoTable
      WHERE Suburb IN (?)
    )
  `;

  // Define SQL query to fetch previous month revenue
  const getPreviousMonthRevenue = `
    SELECT 
      SUM(IF(MONTH(date_time) = MONTH(CURDATE()) - 1 AND YEAR(date_time) = YEAR(CURDATE()), token_amount, 0)) as previousMonthRevenue
    FROM STSTokesInfo
    WHERE DRN IN (
      SELECT DRN
      FROM MeterLocationInfoTable
      WHERE Suburb IN (?)
    )
  `;

  // Define SQL query to fetch previous year revenue
  const getPreviousYearRevenue = `
    SELECT 
      SUM(IF(YEAR(date_time) = YEAR(CURDATE()) - 1, token_amount, 0)) as previousYearRevenue
    FROM STSTokesInfo
    WHERE DRN IN (
      SELECT DRN
      FROM MeterLocationInfoTable
      WHERE Suburb IN (?)
    )
  `;

  // Execute the SQL queries to fetch current and previous data for revenue
  Promise.all([
    executeQuery(query, [suburbs]),
    executeQuery(getPreviousDayRevenue, [suburbs]),
    executeQuery(getPreviousMonthRevenue, [suburbs]),
    executeQuery(getPreviousYearRevenue, [suburbs])
  ])
  .then(results => {
    const currentDayRevenue = results[0][0].currentDayRevenue;
    const currentMonthRevenue = results[0][0].currentMonthRevenue;
    const currentYearRevenue = results[0][0].currentYearRevenue;
    const previousDayRevenue = results[1][0].previousDayRevenue;
    const previousMonthRevenue = results[2][0].previousMonthRevenue;
    const previousYearRevenue = results[3][0].previousYearRevenue;

    // Calculate percentage increase or decrease for revenue for day, month, and year
    const dayPercentage = calculatePercentageChange(currentDayRevenue, previousDayRevenue);
    const monthPercentage = calculatePercentageChange(currentMonthRevenue, previousMonthRevenue);
    const yearPercentage = calculatePercentageChange(currentYearRevenue, previousYearRevenue);

    // Send the percentage increase/decrease as JSON response
    return res.status(200).json({ 
      dayPercentage,
      monthPercentage,
      yearPercentage
    });
  })
  .catch(error => {
    console.error('Error querying the database:', error);
    res.status(500).json({ error: 'Internal server error' });
  });
});

// // Function to execute SQL queries
// function executeQuery(query, values) {
//   return new Promise((resolve, reject) => {
//     connection.query(query, values, (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(results);
//       }
//     });
//   });
// }

// // Function to calculate percentage change
// function calculatePercentageChange(currentValue, previousValue) {
//   if (previousValue === 0) return 0; // Avoid division by zero
//   const newValue = (((currentValue - previousValue) / previousValue) * 100).toFixed(2);
//   return parseFloat(newValue);
// }





///Ration time periods 
router.get('/time-periods-ratios', (req, res) => {
  const sql = `
  SELECT 
  tokens.tokensBoughtToday,
  units.unitsUsedToday,
  ROUND(IF(tokens.tokensBoughtToday = 0, 0, (units.unitsUsedToday / tokens.tokensBoughtToday) * 100), 2) as percentageUsedToday,
  tokens.tokensBoughtThisMonth,
  units.unitsUsedThisMonth,
  ROUND(IF(tokens.tokensBoughtThisMonth = 0, 0, (units.unitsUsedThisMonth / tokens.tokensBoughtThisMonth) * 100), 2) as percentageUsedThisMonth,
  tokens.tokensBoughtThisYear,
  units.unitsUsedThisYear,
  ROUND(IF(tokens.tokensBoughtThisYear = 0, 0, (units.unitsUsedThisYear / tokens.tokensBoughtThisYear) * 100), 2) as percentageUsedThisYear
FROM (
  SELECT 
    ABS(COALESCE(SUM(IF(DATE(date_time) = CURDATE(), token_amount, 0)), 0)) as tokensBoughtToday,
    ABS(COALESCE(SUM(IF(MONTH(date_time) = MONTH(CURDATE()), token_amount, 0)), 0)) as tokensBoughtThisMonth,
    ABS(COALESCE(SUM(IF(YEAR(date_time) = YEAR(CURDATE()), token_amount, 0)), 0)) as tokensBoughtThisYear
  FROM 
    STSTokesInfo
  WHERE 
    display_msg = 'Accept' AND YEAR(date_time) = YEAR(CURDATE()) 
) AS tokens,
(
  SELECT 
    ABS(COALESCE(SUM(IF(DATE(date) = CURDATE(), daily_power_consumption, 0)), 0)) as unitsUsedToday,
    ABS(COALESCE(SUM(IF(MONTH(date) = MONTH(CURDATE()), daily_power_consumption, 0)), 0)) as unitsUsedThisMonth,
    ABS(COALESCE(SUM(IF(YEAR(date) = YEAR(CURDATE()), daily_power_consumption, 0)), 0)) as unitsUsedThisYear
  FROM 
    DailyPowerConsumption
) AS units

  `;

  connection.query(sql, (err, result) => {
    if (err) throw err;
    return res.status(200).send(result);
  });
});

//Ration current week 
router.get('/WeekRatio', (req, res) => {
  const getCurrentWeekRatio = `
  SELECT 
  DATE_FORMAT(tokens.date, '%Y-%m-%d') AS date,
  tokens.tokensBoughtThisDay,
  units.unitsUsedThisDay,
  ROUND(IF(COALESCE(tokens.tokensBoughtThisDay, 0) = 0, 0, (COALESCE(units.unitsUsedThisDay, 0) / COALESCE(tokens.tokensBoughtThisDay, 0)) * 100),2 ) as percentageUsedThisDay
FROM (
  SELECT 
    DATE(date_time) as date,
    COALESCE(SUM(token_amount), 0) as tokensBoughtThisDay
  FROM 
    STSTokesInfo
  WHERE 
    display_msg = 'Accept' AND WEEK(date_time, 1) = WEEK(CURDATE(), 1) AND MONTH(date_time) = MONTH(CURDATE()) AND  YEAR(date_time) = YEAR(CURDATE())  
  GROUP BY 
    DATE(date_time)
) AS tokens
LEFT JOIN (
  SELECT 
    DATE(date) as date,
    ABS(COALESCE(SUM(daily_power_consumption), 0)) as unitsUsedThisDay
  FROM 
    DailyPowerConsumption
  WHERE 
    WEEK(date, 1) = WEEK(CURDATE(), 1) AND YEAR(date) = YEAR(CURDATE())
  GROUP BY 
    DATE(date)
) AS units
ON tokens.date = units.date
`;

  const getLastWeekRatio = `
  SELECT 
  DATE_FORMAT(tokens.date, '%Y-%m-%d') AS date,
  tokens.tokensBoughtThisDay,
  units.unitsUsedThisDay,
  ROUND(IF(COALESCE(tokens.tokensBoughtThisDay, 0) = 0, 0, (COALESCE(units.unitsUsedThisDay, 0) / COALESCE(tokens.tokensBoughtThisDay, 0)) * 100), 2) as percentageUsedThisDay
FROM (
  SELECT 
    DATE(date_time) as date,
    COALESCE(SUM(token_amount), 0) as tokensBoughtThisDay
  FROM 
    STSTokesInfo
  WHERE 
    display_msg = 'Accept' AND WEEK(date_time, 1) = WEEK(CURDATE(), 1) - 1 AND  MONTH(date_time) = MONTH(CURDATE()) AND YEAR(date_time) = YEAR(CURDATE())  
  GROUP BY 
    DATE(date_time)
) AS tokens
LEFT JOIN (
  SELECT 
    DATE(date) as date,
    ABS(COALESCE(SUM(daily_power_consumption), 0)) as unitsUsedThisDay
  FROM 
    DailyPowerConsumption
  WHERE 
    WEEK(date, 1) = WEEK(CURDATE(), 1) - 1 AND YEAR(date) = YEAR(CURDATE())
  GROUP BY 
    DATE(date)
) AS units
ON tokens.date = units.date
`;

  connection.query(getCurrentWeekRatio, (error, currentWeekResults) => {
    if (error) throw error;
    
    connection.query(getLastWeekRatio, (err, lastWeekResults) => {
      if (err) throw err;
      
      const response = {
        currentWeek: currentWeekResults,
        lastWeek: lastWeekResults
      };

      return res.status(200).json(response);
    });
  });
});



//Current and last  year months
router.get('/monthRatios', (req, res) => {

  // All the months of the current year
  const getCurrentYear = `SELECT 
  tokens.month,
  tokens.tokensBoughtThisMonth,
  units.unitsUsedThisMonth,
  ROUND(IF(COALESCE(tokens.tokensBoughtThisMonth, 0) = 0, 0, (COALESCE(units.unitsUsedThisMonth, 0) / COALESCE(tokens.tokensBoughtThisMonth, 0)) * 100), 2) as percentageUsedThisMonth
FROM (
  SELECT 
    MONTH(date_time) as month,
    COALESCE(SUM(token_amount), 0) as tokensBoughtThisMonth
  FROM 
    STSTokesInfo
  WHERE 
    display_msg = 'Accept' AND YEAR(date_time) = YEAR(CURDATE())
  GROUP BY 
    MONTH(date_time)
) AS tokens
LEFT JOIN (
  SELECT 
    MONTH(date) as month,
    ABS(COALESCE(SUM(daily_power_consumption), 0)) as unitsUsedThisMonth
  FROM 
    DailyPowerConsumption
  WHERE 
    YEAR(date) = YEAR(CURDATE())
  GROUP BY 
    MONTH(date)
) AS units
ON tokens.month = units.month
`;

  // All the months of the last year
  const getLastYear = `SELECT 
  tokens.month,
  tokens.tokensBoughtThisMonth,
  units.unitsUsedThisMonth,
  ROUND(IF(COALESCE(tokens.tokensBoughtThisMonth, 0) = 0, 0, (COALESCE(units.unitsUsedThisMonth, 0) / COALESCE(tokens.tokensBoughtThisMonth, 0)) * 100), 2) as percentageUsedThisMonth
FROM (
  SELECT 
    MONTH(date_time) as month,
    COALESCE(SUM(token_amount), 0) as tokensBoughtThisMonth
  FROM 
    STSTokesInfo
  WHERE 
    display_msg = 'Accept' AND YEAR(date_time) = YEAR(CURDATE()) - 1
  GROUP BY 
    MONTH(date_time)
) AS tokens
LEFT JOIN (
  SELECT 
    MONTH(date) as month,
    ABS(COALESCE(SUM(daily_power_consumption), 0)) as unitsUsedThisMonth
  FROM 
    DailyPowerConsumption
  WHERE 
    YEAR(date) = YEAR(CURDATE()) - 1
  GROUP BY 
    MONTH(date)
) AS units
ON tokens.month = units.month
`;

  connection.query(getCurrentYear, (error, currentYearResults) => {
    if (error) throw error;

    connection.query(getLastYear, (error, lastYearResults) => {
      if (error) throw error;

      const response = { currentYear: currentYearResults, lastYear: lastYearResults };
     return res.status(200).json(response);
    });
  });
});




module.exports = router;