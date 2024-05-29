const express = require('express');
const router = express.Router();
const energyController = require('../meter/meterControllers');
const authenticateTokenAndGetAdmin_ID = require('../middleware/authenticateTokenAndGet Admin_ID');
const { authenticateToken } = require('../admin/authMiddllware');


// Routes that require authentication and admin ID

// Creating a new meter
router.post('/insertMeterData', authenticateTokenAndGetAdmin_ID, energyController.insertData);

// Inserting a new Transformer
router.post('/insertTransformer', authenticateTokenAndGetAdmin_ID, energyController.insertTransformerData);

// // Routes that require only authentication

// router.use(authenticateToken);

// Getting the energyConsumption in the system perSuburb
router.get('/suburbEnergy',  authenticateToken,energyController.getSuburbEnergy);

// Get all ProcessedTokens By DRN
router.get('/allProcessedTokensByDRN:DRN',  authenticateToken,energyController.getAllProcessedTokens);

// Weekly and Monthly data for the entire system
router.get('/meterWeekAndMonthData:DRN',  authenticateToken,energyController.getDRNDATA);

// Getting all processed Tokens for a specific DRN
router.get('/getAllProcessedTokensByDRN:DRN' ,  authenticateToken,energyController.getAllProcessedTokens);

// Getting the daily energy consumption for a specific meter
router.get('/meterDataByDRN:DRN' ,  authenticateToken,energyController.getDailyMeterEnergyByDRN);

// Getting all active and inactive meters
router.get('/activeInactiveMeters' ,  authenticateToken,energyController.getAllActiveAndInactiveMeters);

// Get total meters
router.get('/totalMeters' ,  authenticateToken,energyController.getTotalMeters);

// Getting the token amount in the system
router.get('/tokenAmount',  authenticateToken,energyController.getTokenAmount);

// Getting the total tokens bought in the system
router.get('/totalTokensBought',  authenticateToken,energyController.getTokenCount);

// Getting the whole energyConsumption in the system
// router.get('/totalEnergyAmount',  authenticateToken,energyController.getTotalEnergyAmount);

// Getting the Weeky and Monthly energyConsumption in the system
router.get('/weeklyDataAmount',  authenticateToken,energyController.getEnergyAmount);

// Getting the current day energyConsumption in the system
router.get('/currentDayEnergy',  authenticateToken,energyController.getCurrentDayEnergy);

// GridTology
router.post('/gridTopology',  authenticateToken,energyController.fetchDRNs);

// Get all energy time periods
router.get("/energy-time-periods",  authenticateToken,energyController.getEnergyData);

router.get('/yearly/currentAndLastYearMonthEnergyTotal' , authenticateToken,energyController.getMonthlyEnergyForCurrentAndLastYear);

// CurrentAndLastWeek With the day starting on Monday
router.get('/weekly/currentAndLastWeekEnergyTotal' , authenticateToken,energyController.getWeeklyEnergyForCurrentAndLastWeek);

// Get hourly power consumption
router.get('/hourlyPowerConsumption',  authenticateToken,energyController.getHourlyPowerConsumption);

// Current hour average voltage and current
router.get('/average-current-voltage',  authenticateToken,energyController.getAverageCurrentAndVoltage);

// Hourly energy
router.get('/last-apparent-power',  authenticateToken,energyController.getSumApparentPower);

// Get surburb time periods
router.post('/suburb-time-periods',  authenticateToken,energyController.getTimePeriodApparentPowerBySuburb);

// Search by weekly power
router.post('/search-by-weekly-power', authenticateToken, energyController.getWeeklyApparentPowerBySuburb);

// Search by Surburb monthly power
router.post('/search-by-monthly-power',  authenticateToken,energyController.getYearlyApparentPowerBySuburb);
//Get System processed tokens
router.get('/get-system-processed-tokens' , authenticateToken,energyController.getAllSystemProcessedTokensController);
//Total Tranformers
router.get('/total-tranformers', authenticateToken,energyController.getTotalTransformers);

module.exports = router;
