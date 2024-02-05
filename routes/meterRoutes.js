const express = require('express');
const router = express.Router();
const energyController = require('../meter/meterControllers');
const db = require('../config/db');

//Get all ProcessedTokens By DRN//
router.get('/allProcessedTokensByDRN:DRN', energyController.getAllProcessedTokens);
//Weekly and Monthly data for the entire system//
router.get('/meterWeekAndMonthData:DRN', energyController.getDRNDATA);
//Getting all processed Tokens for a specific DRN//
router.get('/getAllProcessedTokensByDRN:DRN' , energyController.getAllProcessedTokens);
//Getting the daily energy consumption for a specific meter///
router.get('/meterDataByDRN:DRN' , energyController.getDailyMeterEnergy);
//Getting all active and inactive meters/// 
router.get('/activeInactiveMeters' , energyController.getAllActiveAndInactiveMeters);
//Getting the token amount in the system//
router.get('/tokenAmount', energyController.getTokenAmount);
//Getting the total tokens bought in the system//
router.get('/totalTokensBought', energyController.getTokenCount);
//Getting the whole energyConsumption in the system//
router.get('/totalEnergyAmount', energyController.getTotalEnergyAmount);
//Getting the Weeky and Monthly energyConsumption in the system//
router.get('/weeklyDataAmount', energyController.getEnergyAmount);
//Getting the current day energyConsumption in the system//
router.get('/currentDayEnergy', energyController.getCurrentDayEnergy);
//Creating a new meter //
router.post('/insertMeterData', energyController.insertData);
//Getting the energyConsumption in the system perSuburb//
router.get('/suburbEnergy', energyController.getSuburbEnergy);
///Inserting a new Transformer//
router.post('/insertTransformer', energyController.insertTransformerData);




module.exports = router;
