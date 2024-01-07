const express = require('express');
const router = express.Router();
const energyController = require('./meterControllers');

router.get('/energy', energyController.getEnergyByDRN);

module.exports = router;
