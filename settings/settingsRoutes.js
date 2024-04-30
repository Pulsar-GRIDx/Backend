const express = require('express');
const router = express.Router();
const settingContoller = require('./settingsContoller');
const {authenticateToken} = require('../admin/authMiddllware')

router.use(authenticateToken);


//Endpoint to get meter reset history
router.get('/meterResetHistory/:DRN', settingContoller.getMeterResetHistory);
//Endpoint to get meter calibration history
router.get('/meterCalibrationHistory/:DRN', settingContoller.getMeterCalibrationHistory);
//Router to get meter control history
router.get('/meterControlHistory/:DRN', settingContoller.getMeterMainsControlHistory);
//Router to get meter state history
router.get('/meterStateHistory/:DRN', settingContoller.getMeterMainsStateHistory);
//Router to get heater control history
router.get('/heaterControlHistory/:DRN', settingContoller.getMeterHeaterControlHistory);
//Router to get heater state history
router.get('/heaterStateHistory/:DRN', settingContoller.getMeterHeaterStateHistory);
//Router to get sts token history 
router.get('/stsTokenHistory/:DRN', settingContoller.getMeterSTSTokenHistory);
//Router to get token information
router.get('/tokenInformation/:DRN', settingContoller.getTokenInformation);

module.exports = router;