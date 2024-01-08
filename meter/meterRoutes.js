const express = require('express');
const router = express.Router();
const energyController = require('./meterControllers');

router.post('/energy:DRN', energyController.getEnergyByDRN);

module.exports = router;
