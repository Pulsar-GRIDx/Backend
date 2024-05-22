const express = require('express');
const router = express.Router();
const systemSettingsContoller = require('../systemSettings/systemSettingsContoller');
const authenticateTokenAndGetAdmin_ID = require('../middleware/authenticateTokenAndGet Admin_ID');
const { authenticateToken } = require('../admin/authMiddllware');

const systemController = new systemSettingsContoller();

//Get Voltage thresholds
router.get('/getVoltageThresholds',authenticateToken, (req, res) => systemController.getVoltageTriggerDefinition(req, res));
//Set Voltage thresholds
router.put('/updateVoltageThresholds',authenticateToken, (req, res) => systemController.updateVoltageThresholds(req, res));
//Get Current thresholds
router.get('/getCurrentThresholds',authenticateToken, (req, res ) => systemController.getCurrentTriggerDefinition(req, res));
//Set Current thresholds
router.put('/updateCurrentThresholds',authenticateToken, (req, res ) => systemController.updateCurrentThresholds(req, res));
//Get ActivePower thresholds
router.get('/getActivePowerThresholds',authenticateToken, (req, res ) => systemController.getActivePowerTriggerDefinition(req, res));
//Set ActivePower thresholds
router.put('/updateActivePowerThresholds',authenticateToken, (req, res ) => systemController.updateActivePowerThresholds(req, res));
//Get ReactivePower thresholds
router.get('/getReactivePowerThresholds',authenticateToken, (req, res ) => systemController.getReactivePowerTriggerDefinition(req, res));
//Set ReactivePower thresholds
router.put('/updateReactivePowerThresholds',authenticateToken, (req, res ) => systemController.updateReactivePowerThresholds(req, res));
//Get apparentPower thresholds
router.get('/getApparentPowerThresholds',authenticateToken, (req, res ) => systemController.getApparentPowerTriggerDefinition(req, res));
//Set ApparentPower thresholds
router.put('/updateApparentPowerThresholds',authenticateToken, (req, res ) => systemController.updateApparentPowerThresholds(req, res));
//Get PowerFactor thresholds
router.get('/getPowerFactorThresholds',authenticateToken, (req, res ) => systemController.getPowerFactorTriggerDefinition(req, res));
//Set PowerFactor thresholds
router.put('/updatePowerFactorThresholds',authenticateToken, (req, res ) => systemController.updatePowerFactorThresholds(req, res));
//Get Temperature thresholds
router.get('/getTemperatureThresholds',authenticateToken, (req, res ) => systemController.getTemperatureTriggerDefinition(req, res));
//Set Temperature thresholds
router.put('/updateTemperatureThresholds',authenticateToken, (req, res ) => systemController.updateTemperatureThresholds(req, res));
// Get LowEnergyUnits thresholds
router.get('/getLowEnergyUnitsThresholds', authenticateToken, (req, res) => systemController.getLowEnergyUnitsTriggerDefinition(req, res));
// Set LowEnergyUnits thresholds
router.put('/updateLowEnergyUnitsThresholds', authenticateToken, (req, res) => systemController.updateLowEnergyUnitsThresholds(req, res));
// Get FrequencyDeviation thresholds
router.get('/getFrequencyDeviationThresholds', authenticateToken, (req, res) => systemController.getFrequencyDeviationTriggerDefinition(req, res));
// Set FrequencyDeviation thresholds
router.put('/updateFrequencyDeviationThresholds', authenticateToken, (req, res) => systemController.updateFrequencyDeviationThresholds(req, res));

module.exports = router ;

