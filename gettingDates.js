// Function to get the current week
const getCurrentWeek = () => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const days = Math.floor((today - firstDayOfYear) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
    return week;
  };
  
  // Function to get the current month
  const getCurrentMonth = () => {
    const today = new Date();
    return today.getMonth() + 1; 
  };
  // Function to get the last week
  const getLastWeek = () => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const days = Math.floor((today - firstDayOfYear) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
    return week - 1; // subtract 1 to get the last week
  };
  
  // Function to get the last month
  const getLastMonth = () => {
    const today = new Date();
    const month = today.getMonth() + 1; // getMonth() is zero-based
    return month === 1 ? 12 : month - 1; // if current month is January, last month is December
  };
  
  // ...
  
  const week = getCurrentWeek();
  const month = getCurrentMonth();

  
  // Controller function
  exports.getMeterDataByDRN = (req, res) => {
    const DRN = req.params.DRN;
    Promise.all([
      exports.getWeeklyData(DRN),
      exports.getMonthlyData(DRN),
      energyService.getMeterVoltageAndCurrent(DRN),
      // Other data fetching functions...
    ])
    .then(([weeklyData, monthlyData, /* other data */]) => {
      try {
        const weeklyTotals = exports.calculateTotals(weeklyData);
        const monthlyTotals = exports.calculateTotals(monthlyData);
        // Other calculations...
  
        // Prepare response
        const response = {
          weeklyTotals,
          monthlyTotals,
          // Other totals...
        };
  
        res.json(response);
      } catch (err) {
        console.log('Error processing the data:', err);
        return res.status(500).send({ error: 'Data processing failed', details: err });
      }
    })
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
  };