const express = require('express');
const router = express.Router();
const energyController = require('./meterControllers');

router.post('/currentAndLastWeekEnergy:DRN', energyController.getEnergyByDRN);
router.post('/CurrentDayEnergy:DRN', energyController.getCurrentDayEnergyByDRN);
router.get('/activeInactiveMeters' , energyController.getAllActiveAndInactiveMeters);
module.exports = router;
