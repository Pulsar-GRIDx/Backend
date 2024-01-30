const express = require('express');
const router = express.Router();
const energyController = require('./meterControllers');


//Weekly and Monthly data for the entire system//
router.get('/meterWeekAndMonthData:DRN', energyController.getMeterWeeklyAndMonthlyDataByDRN);
//Getting all processed Tokens for a specific DRN//
router.get('/getAllProcessedTokensByDRN:DRN' , energyController.getAllProcessedTokens);
//Getting the daily energy consumption for a specific meter///
router.get('/meterDataByDRN:DRN' , energyController.getDailyMeterEnergy);
//Getting all active and inactive meters/// 
router.get('/activeInactiveMeters' , energyController.getAllActiveAndInactiveMeters);
router.get('/tokenAmount', energyController.getTokenAmount);
router.get('/totalTokensBought', energyController.getTokenCount);
router.get('/totalEnergyAmount', energyController.getTotalEnergyAmount);
router.get('/weeklyDataAmount', energyController.getEnergyAmount);
router.get('/currentDayEnergy', energyController.getCurrentDayEnergy);
router.post('/insertMeterData', energyController.insertData);
router.get('/suburbEnergy', energyController.getSuburbEnergy);

module.exports = router;
