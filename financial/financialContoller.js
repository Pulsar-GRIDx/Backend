const financialService = require('./financialService'); // replace './tokenService' with the path to your service file

exports.getCurrentDayTokenAmount = (req, res) => {
  financialService.getCurrentDayTokenAmount()
    .then(totalTokenAmount => {
      res.json({ totalTokenAmount });
    })
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};
///--------------------------------------------------CurrentMonth Revenue----------------------------------//
exports.getCurrentMonthTokenAmount = (req, res) => {
  financialService.getCurrentMonthTokenAmount()
    .then(totalTokenAmount => {
      res.json({ totalTokenAmount });
    })
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};
///--------------------------------------------Current Year revenue -------------------------------//
exports.getCurrentYearTokenAmount = (req, res) => {
  financialService.getCurrentYearTokenAmount()
    .then(totalTokenAmount => {
      res.json({ totalTokenAmount });
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
      const monthlyTokenAmount = monthlyData.reduce((acc, record) => {
        if (!acc[record.year]) {
          acc[record.year] = {};
        }
        acc[record.year][record.month] = Number(record.total_token_amount);
        return acc;
      }, {});
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
      const weeklyTokenAmount = { lastweek: {}, currentweek: {} };
      const currentWeekNumber = new Date().getWeek();
      
      weeklyData.forEach(record => {
        const weekKey = record.week === currentWeekNumber ? 'currentweek' : 'lastweek';
        weeklyTokenAmount[weekKey][record.day] = Number(record.total_token_amount);
      });

      res.json(weeklyTokenAmount);
    })
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};