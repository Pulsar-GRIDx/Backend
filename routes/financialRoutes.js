const express = require('express');
const router = express.Router();
const financialContoller = require('../financial/financialContoller');
// const convertDataToMockTree = require('../meter/meterControllers');
const authenticateTokenAndGetAdmin_ID = require('../middleware/authenticateTokenAndGet Admin_ID');


//Get current Day revenue
router.get('/currentDayRevenue',financialContoller.getCurrentDayTokenAmount);
//Get Current Month revenue
router.get('/currentMonthRevenue', financialContoller.getCurrentMonthTokenAmount);
//Get current Year revenue
router.get('/currentYearRevenue', financialContoller.getCurrentYearTokenAmount);


module.exports = router;