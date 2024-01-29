const express = require('express');
const router = express.Router();
const energyController = require('./meterControllers');

router.get('/meterWeekAndMonthData:DRN', energyController.getMeterWeeklyAndMonthlyDataByDRN);
router.get('/metercurrentDayEnergy:DRN', energyController.getMeterCurrentDayEnergyByDRN);
router.get('/activeInactiveMeters' , energyController.getAllActiveAndInactiveMeters);
router.get('/tokenAmount', energyController.getTokenAmount);
router.get('/totalTokensBought', energyController.getTokenCount);
router.get('/totalEnergyAmount', energyController.getTotalEnergyAmount);
router.get('/weeklyDataAmount', energyController.getEnergyAmount);
router.get('/currentDayEnergy', energyController.getCurrentDayEnergy);
router.post('/insertMeterData', energyController.insertData);
router.get('/suburbEnergy', energyController.getSuburbEnergy);

module.exports = router;
