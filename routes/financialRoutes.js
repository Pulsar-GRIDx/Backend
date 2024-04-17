const express = require('express');
const router = express.Router();
const financialContoller = require('../financial/financialContoller');
// const convertDataToMockTree = require('../meter/meterControllers');
const authenticateTokenAndGetAdmin_ID = require('../middleware/authenticateTokenAndGet Admin_ID');


//Get current Day revenue
router.get('/time-periods',financialContoller.getTokenAmounts);

//Get current year and last year financial revenue
router.get('/currentAndLastYearMonthRevenueTotal', financialContoller.getMonthlyTokenAmountForCurrentAndLastYear);
//Get current and last week finacial data //
router.get('/currentAndLastWeek', financialContoller.getWeeklyTokenAmountForCurrentAndLastWeek);
//Hourly Revenue for the current day
router.get('/hourlyRevenue',financialContoller.getTotalRevenuePerHour);
//Suburb time periods 
router.post('/suburbTimePeriod', financialContoller.getTimePeriodRevenueBySuburb);
//suburbWeeklyRevenue
router.post('/suburbWeeklyRevenue',financialContoller.getWeeklyRevenueBySuburb);
//Yearly suburb revenue
router.post('/suburbYearlyRevenue', financialContoller.getYearlyRevenueBySuburb);


module.exports = router;