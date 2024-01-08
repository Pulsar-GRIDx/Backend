const energyService = require('./meterService');

exports.getEnergyByDRN = function(req, res) {
  const DRN = req.params.DRN;

  energyService.getEnergyByDRN(DRN, (err, data) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.json(data);
  });
};