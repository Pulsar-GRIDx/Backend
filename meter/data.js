// Function to get weekly and monthly data
exports.getWeekMonthData = () => {
  const getCurrentWeek = () => {
    const today = new Date();
    const days = Math.floor((today - new Date(today.getFullYear(), 0, 1)) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + 1) / 7);
  };
  
  // Function to get the current month
  const getCurrentMonth = () => {
    return new Date().getMonth() + 1; // Months are zero-based, so add 1
  };
  
 
  // Get the current week and month
  const currentWeek = getCurrentWeek();
  const currentMonth = getCurrentMonth();

  // Query for the current week
  const getCurrentWeekData = `
    SELECT active_energy, DATE(date_time) as date_time
    FROM MeterCumulativeEnergyUsage
    WHERE YEARWEEK(date_time, 1) = YEARWEEK(CURDATE(), 1)
  `;

  // Query for the last week
  const getLastWeekData = currentWeek === 1 ? `
    SELECT active_energy, DATE(date_time) as date_time
    FROM MeterCumulativeEnergyUsage
    WHERE YEARWEEK(date_time, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)
  ` : '';

  // Query for the current month
  const getCurrentMonthData = `
    SELECT active_energy, DATE(date_time) as date_time
    FROM MeterCumulativeEnergyUsage
    WHERE YEAR(date_time) = YEAR(CURDATE()) AND MONTH(date_time) = MONTH(CURDATE())
  `;

  // Query for the last month
  const getLastMonthData = currentMonth === 1 ? `
    SELECT active_energy, DATE(date_time) as date_time
    FROM MeterCumulativeEnergyUsage
    WHERE YEAR(date_time) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(date_time) = MONTH(CURDATE() - INTERVAL 1 MONTH)
  ` : '';

  return new Promise((resolve, reject) => {
    Promise.all([
      getData(getCurrentWeekData),
      getData(getLastWeekData),
      getData(getCurrentMonthData),
      getData(getLastMonthData)
    ])
    .then(([currentWeekData, lastWeekData, currentMonthData, lastMonthData]) => {
      resolve({
        currentWeekData,
        lastWeekData,
        currentMonthData,
        lastMonthData
      });
    })
    .catch(err => reject(err));
  });
};