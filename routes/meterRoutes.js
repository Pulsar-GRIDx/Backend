const express = require('express');
const router = express.Router();
const energyController = require('../meter/meterControllers');
const db = require('../config/db');
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



////////////////////////
// GET route to fetch DRNs based on location name
// router.get('/fetch-drns/:locationName', (req, res) => {
//     const locationName = req.params.locationName;

//     // Query to select transformers and associated DRNs based on location name
//     const query = `
//         SELECT TI.DRN ,Name AS TransformerDRN, MLIT.DRN AS MeterDRN
//         FROM TransformerInformation TI
//         LEFT JOIN MeterLocationInfoTable MLIT ON TI.DRN = MLIT.PowerSupply
//         WHERE TI.LocationName = ?
//     `;

//     // Execute the query
//     db.query(query, [locationName], (error, results, fields) => {
//         if (error) {
//             res.status(500).json({ error: 'An error occurred while fetching data' });
//         } else {
//             // Transform the results into the desired format
//             const transformersWithDRNs = {};

//             results.forEach(row => {
//                 const transformerDRN = row.TransformerDRN;
//                 const meterDRN = row.MeterDRN;

//                 // If the transformer does not exist in the object, initialize it
//                 if (!transformersWithDRNs.hasOwnProperty(transformerDRN)) {
//                     transformersWithDRNs[transformerDRN] = [];
//                 }

//                 // Push the meter DRN into the array of the corresponding transformer
//                 if (meterDRN) {
//                     transformersWithDRNs[transformerDRN].push(meterDRN);
//                 }
//             });

//             // Send the transformers with associated meters as JSON response
//             res.status(200).json({ [locationName]: transformersWithDRNs });
//         }
//     });
// });





module.exports = router;
