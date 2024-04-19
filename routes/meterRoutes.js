const express = require('express');
const router = express.Router();
const energyController = require('../meter/meterControllers');
// const convertDataToMockTree = require('../meter/meterControllers');
const authenticateTokenAndGetAdmin_ID = require('../middleware/authenticateTokenAndGet Admin_ID');

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
router.post('/insertMeterData',authenticateTokenAndGetAdmin_ID, energyController.insertData);
//Getting the energyConsumption in the system perSuburb//
router.get('/suburbEnergy', energyController.getSuburbEnergy);
///Inserting a new Transformer//
router.post('/insertTransformer',authenticateTokenAndGetAdmin_ID, energyController.insertTransformerData);
// //GridTology //
router.post('/gridTopology'  ,energyController.fetchDRNs);
//Get all energy time periods
router.get("/energy-time-periods", energyController.getEnergyData);

router.get('/yearly/currentAndLastYearMonthEnergyTotal' ,energyController.getMonthlyEnergyForCurrentAndLastYear);
//CurrentAndLastWeek With the day starting on Monday 
router.get('/weekly/currentAndLastWeekEnergyTotal' ,energyController.getWeeklyEnergyForCurrentAndLastWeek);
//Get hourly power consumption
router.get('/hourlyPowerConsumption', energyController.getHourlyPowerConsumption);
//Current hour average voltage and current 
router.get('/average-current-voltage', energyController.getAverageCurrentAndVoltage);
//Hourly energy
router.get('/last-apparent-power', energyController.getSumApparentPower);
//Get surburb time periods
router.post('/suburb-time-periods', energyController.getTimePeriodApparentPowerBySuburb);
//serach by weekly power
router.post('/search-by-weekly-power', energyController.getWeeklyApparentPowerBySuburb);
//search by Surburb monthly power
router.post('/search-by-monthly-power', energyController.getYearlyApparentPowerBySuburb);

module.exports = router;
