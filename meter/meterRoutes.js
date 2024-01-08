const express = require('express');
const router = express.Router();
const energyController = require('./meterControllers');

router.post('/energy', energyController.getEnergyByDRN);
router.post('/energy_day', energyController.getCurrentDayEnergyByDRN);

module.exports = router;
