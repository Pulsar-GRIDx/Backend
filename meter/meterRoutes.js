const express = require('express');
const router = express.Router();
const energyController = require('./meterControllers');

router.post('/currentAndLastWeekEnergy:DRN', energyController.getEnergyByDRN);
router.post('/CurrentDayEnergy:DRN', energyController.getCurrentDayEnergyByDRN);
router.get('/activeInactiveMeters' , energyController.getAllActiveAndInactiveMeters);
router.get('/tokenAmount', energyController.getTokenAmount);
router.get('/totalTokensBought', energyController.getTokenCount);
router.get('/totalEnergyAmount', energyController.getTotalEnergyAmount);
router.get('/weeklyDataAmount', energyController.getEnergyAmount);
module.exports = router;
