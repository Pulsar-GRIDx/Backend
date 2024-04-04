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