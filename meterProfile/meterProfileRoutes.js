const express = require('express');
const router = express.Router();
const meterProfileContoller = require('./meterProfileContoller');
const {authenticateToken} = require('../admin/authMiddllware')

router.use(authenticateToken);


//Endpoint to get meter reset history
router.get('/meterResetHistory/:DRN', meterProfileContoller.getMeterResetHistory);
//Endpoint to get meter calibration history
router.get('/meterCalibrationHistory/:DRN', meterProfileContoller.getMeterCalibrationHistory);
//Router to get meter control history
router.get('/meterControlHistory/:DRN', meterProfileContoller.getMeterMainsControlHistory);
//Router to get meter state history
router.get('/meterStateHistory/:DRN', meterProfileContoller.getMeterMainsStateHistory);
//Router to get heater control history
router.get('/heaterControlHistory/:DRN', meterProfileContoller.getMeterHeaterControlHistory);
//Router to get heater state history
router.get('/heaterStateHistory/:DRN', meterProfileContoller.getMeterHeaterStateHistory);
//Router to get sts token history 
router.get('/stsTokenHistory/:DRN', meterProfileContoller.getMeterSTSTokenHistory);
//Router to get token information
router.get('/tokenInformation/:DRN', meterProfileContoller.getTokenInformation);

module.exports = router;