const energyService = require('./meterService');

exports.getEnergyByDRN = function(req, res) {
  const DRN = req.body;

  energyService.getEnergyByDRN(DRN, (err, data) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.json(data);
  });
};

exports.getCurrentDayEnergyByDRN = function(req, res) {
  const DRN = req.body;

  energyService.getCurrentDayEnergyByDRN(DRN, (err, data) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.json(data);
  });
};