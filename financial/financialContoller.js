const financialService = require('./financialService'); 


//---------------------------------------------All time periods------------------------------//
exports.getTokenAmounts = (req, res) => {
  financialService.getTokenAmounts()
    .then(tokenAmounts => {
      res.json(tokenAmounts);
    })
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};

//---------------------------------------------------Get financial stats for all the months of last year and current year------------------------//
exports.getMonthlyTokenAmountForCurrentAndLastYear = (req, res) => {
  financialService.getMonthlyTokenAmountForCurrentAndLastYear()
    .then(monthlyData => {
      const monthlyTokenAmount = { Last: new Array(12).fill(0), Current: new Array(12).fill(0) };
      const currentYear = new Date().getFullYear();
      
      monthlyData.forEach(record => {
        const yearKey = record.year === currentYear ? 'Current' : 'Last';
        const monthIndex = record.month - 1;
        monthlyTokenAmount[yearKey][monthIndex] = Number(record.total_token_amount);
      });

      res.json({ monthlyTokenAmount });
    })
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};

//--------------------------------------------------Current and last week financial data --------------------------//
exports.getWeeklyTokenAmountForCurrentAndLastWeek = (req, res) => {
  financialService.getWeeklyTokenAmountForCurrentAndLastWeek()
    .then(weeklyData => {
      const weeklyTokenAmount = { lastweek: new Array(7).fill(0), currentweek: new Array(7).fill(0) };
      const currentWeekNumber = new Date().getWeek();
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      weeklyData.forEach(record => {
        const weekKey = record.week === currentWeekNumber ? 'currentweek' : 'lastweek';
        const dayIndex = daysOfWeek.indexOf(record.day);
        weeklyTokenAmount[weekKey][dayIndex] = Number(record.total_token_amount);
      });

      res.json(weeklyTokenAmount);
    })
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};
