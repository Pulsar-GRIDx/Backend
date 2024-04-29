const express = require('express');
const router = express.Router();
const settingContoller = require('./settingsContoller');
const {authenticateToken} = require('../admin/authMiddllware')

router.use(authenticateToken);


//Endpoint to get meter reset history
router.get('/meterResetHistory', settingContoller.getMeterResetHistory);
//Endpoint to get meter calibration history
router.get('/meterCalibrationHistory', settingContoller.getMeterCalibrationHistory);
//Router to get meter control history
router.get('/meterControlHistory', settingContoller.getMeterMainsControlHistory);
//Router to get meter state history
router.get('/meterStateHistory', settingContoller.getMeterMainsStateHistory);
//Router to get heater control history
router.get('/heaterControlHistory', settingContoller.getMeterHeaterControlHistory);
//Router to get heater state history
router.get('/heaterStateHistory', settingContoller.getMeterHeaterStateHistory);
//Router to get sts token history 
router.get('/stsTokenHistory', settingContoller.getMeterSTSTokenHistory);

module.exports = router;