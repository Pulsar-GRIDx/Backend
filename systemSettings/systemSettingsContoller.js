const { error } = require('winston');
const systemSettingsService = require('./systemSettingsService');


class SystemController {
  constructor() {
      this.systemService = new systemSettingsService();
  }


  //Voltage trigger
  getVoltageTriggerDefinition(req, res) {
    this.systemService.getVoltageTriggerDefinition((error, triggerResults, statusResults) => {
        if (error) {
            return res.status(500).send(error);
        }
        // Check if the status results have any data
        if (!statusResults.length) {
            return res.status(404).send({ message: 'No status found for the trigger.' });
        }

        // Extract the upper and lower threshold from the trigger definition
        const isActive = statusResults[0].IsActive;
        const triggerDefinition = triggerResults[0]['SQL Original Statement'];
        const regexLower = /IF NEW\.voltage\s*<=\s*(\d+)/;
        const regexUpper = /IF NEW\.voltage\s*>=\s*(\d+)/;
        const regexInsert = /INSERT INTO MeterNotifications \(DRN, AlarmType, Alarm, Urgency_Type, Type\)\s*VALUES \(.+?\);/g;

        const matchUpper = triggerDefinition.match(regexUpper);
        const matchLower = triggerDefinition.match(regexLower);
        const matchInserts = [...triggerDefinition.matchAll(regexInsert)];

        if (matchUpper && matchLower && matchInserts.length > 0) {
            const upperThreshold = matchUpper[1];
            const lowerThreshold = matchLower[1];
            const types = matchInserts.map(match => {
                const values = match[0].split('VALUES ')[1];
                const typeString = values.split(', ')[5].split(')')[0]; // Fixed index for the 'Type' value

                return typeString;
            });

            const uniqueTypes = [...new Set(types)];
            const uniqueType = uniqueTypes[0];

            // Send the thresholds and types to the user
            res.send({
                upperThreshold: upperThreshold,
                lowerThreshold: lowerThreshold,
                type: uniqueType,
                Active: isActive
            });
        } else {
            res.send('No match found');
        }
    });
}


  updateVoltageThresholds(req, res) {
      const newUpperThreshold = req.body.newUpperThreshold;
      const newLowerThreshold = req.body.newLowerThreshold;
      const type = req.body.type;
      const IsActive = req.body.IsActive;
      const TriggerName = 'LowAndHighVoltageTrigger';

      if(!newLowerThreshold || !newUpperThreshold || !type ){
      console.error('Invalid request');
      res.status(400).json({ error: 'Thresholds, type, and IsActive cannot be empty.' });
      return;
      }

      this.systemService.updateVoltageTriggerDefinition(newUpperThreshold, newLowerThreshold , type , TriggerName , IsActive , (error, results, fields) => {
          if (error) res.status(500).send(error);
          else res.send('Thresholds updated successfully!');
        
      });
  }


//Current trigger

getCurrentTriggerDefinition(req, res) {
  this.systemService.getCurrentTriggerDefinition((error, triggerResults, statusResults) => {
    if (error) {
        return res.status(500).send(error);
    }
    // Check if the status results have any data
    if (!statusResults.length) {
        return res.status(404).send({ message: 'No status found for the trigger.' });
    }
          // Extract the upper and lower threshold from the trigger definition
          const isActive = statusResults[0].IsActive;
          const triggerDefinition = triggerResults[0]['SQL Original Statement'];
          // console.log(triggerDefinition);
          const regexLower = /IF sum_current\s*<=\s*(\d+)/;
          const regexUpper = /IF sum_current\s*>=\s*(\d+)/;
          const regexInsert = /INSERT INTO MeterNotifications \(DRN, AlarmType, Alarm, Urgency_Type, Type\)\s*VALUES \(.+?\);/g;
          
          const matchUpper = triggerDefinition.match(regexUpper);
          const matchLower = triggerDefinition.match(regexLower);
          const matchInserts = [...triggerDefinition.matchAll(regexInsert)];
          
          if (matchUpper && matchLower && matchInserts.length > 0) {
              const upperThreshold = matchUpper[1];
              const lowerThreshold = matchLower[1];
              const types = matchInserts.map(match => {
                const values = match[0].split('VALUES ')[1];
                  const typeString = values.split(', ')[5].split(')')[0];
                  
                  return typeString;
            });
            
            
            const uniqueTypes = [...new Set(types)];
            const uniqueType = uniqueTypes[0];

              // Send the thresholds and types to the user
              res.send({upperThreshold: upperThreshold , lowerThreshold: lowerThreshold ,type: uniqueType , IsActive : isActive });
          } else {
              res.send('No match found');
          }
          

          
      }
  )};



updateCurrentThresholds(req, res) {
    const newUpperThreshold = req.body.newUpperThreshold;
    const newLowerThreshold = req.body.newLowerThreshold;
    const type = req.body.type;
    const IsActive = req.body.IsActive;
    const TriggerName = 'CurrentOverload';

    if(!newLowerThreshold || !newUpperThreshold || !type){
    console.error('Invalid request');
    res.status(400).json({error: 'Thresholds cannot be empty.'});
    return;
    }

    this.systemService.updateCurrentTriggerDefinition(newUpperThreshold, newLowerThreshold , type , TriggerName , IsActive, (error, results, fields) => {
        if (error) res.status(500).send(error);
        else res.send('Thresholds updated successfully!');
    });
}

//Active power
getActivePowerTriggerDefinition(req, res) {
  this.systemService.getActivePowerTriggerDefinition((error,  triggerResults, statusResults) => {
    if (error) {
        return res.status(500).send(error);
    }
    // Check if the status results have any data
    if (!statusResults.length) {
        return res.status(404).send({ message: 'No status found for the trigger.' });
    }
          // Extract the upper and lower threshold from the trigger definition
          const isActive = statusResults[0].IsActive;
          const triggerDefinition = triggerResults[0]['SQL Original Statement'];

        const regexLower = /IF NEW\.active_power\s*<=\s*(\d+)/;
        const regexUpper = /IF NEW\.active_power\s*>=\s*(\d+)/;
        const regexInsert = /INSERT INTO MeterNotifications \(DRN, AlarmType, Alarm, Urgency_Type, Type\)\s*VALUES \(.+?,.+?,.+?,.+?,\s*(.+?)\);/g;


const matchUpper = triggerDefinition.match(regexUpper);
const matchLower = triggerDefinition.match(regexLower);
const matchInserts = [...triggerDefinition.matchAll(regexInsert)];
// console.log(matchInserts);


if (matchUpper && matchLower && matchInserts.length > 0) {
    const upperThreshold = matchUpper[1];
    const lowerThreshold = matchLower[1];
    const types = matchInserts.map(match => {
      const typeString = match[1].trim().replace(/['";]+/g, ''); // This now gets the type and removes any quotes or semicolons
      return typeString;
    });
  

    const uniqueTypes = [...new Set(types)];
    const uniqueType = uniqueTypes[0];

    // Send the thresholds and types to the user
    res.send({upperThreshold: upperThreshold , lowerThreshold: lowerThreshold ,type: uniqueType.split(',')[1] ,Active : isActive});
} else {
    res.send('No match found');
}

          

          
      }
  )};



updateActivePowerThresholds(req, res) {
    const newUpperThreshold = req.body.newUpperThreshold;
    const newLowerThreshold = req.body.newLowerThreshold;
    const type = req.body.type;
    const IsActive = req.body.IsActive;
    const TriggerName = 'HighAndLowActivePower';

    if(!newLowerThreshold || !newUpperThreshold || !type){
    console.error('Invalid request');
    res.status(400).json({error: 'Thresholds cannot be empty.'});
    return;
    }

    this.systemService.updateActivePowerTriggerDefinition(newUpperThreshold, newLowerThreshold , type , TriggerName , IsActive,(error, results, fields) => {
        if (error) res.status(500).send(error);
        else res.send('Thresholds updated successfully!');
    });
}

//Reactive Power
getReactivePowerTriggerDefinition(req, res) {
  this.systemService.getReactivePowerTriggerDefinition((error, triggerResults, statusResults ) => {
    if (error) {
        return res.status(500).send(error);
    }
    // Check if the status results have any data
    if (!statusResults.length) {
        return res.status(404).send({ message: 'No status found for the trigger.' });
    }
           // Extract the upper and lower threshold from the trigger definition
           const isActive = statusResults[0].IsActive;
           const triggerDefinition = triggerResults[0]['SQL Original Statement'];
          // console.log(triggerDefinition);
          const regexLower = /IF NEW\.reactive_power\s*<=\s*(\d+)/;
          const regexUpper = /IF NEW\.reactive_power\s*>=\s*(\d+)/;
          const regexInsert = /INSERT INTO MeterNotifications \(DRN, AlarmType, Alarm, Urgency_Type, Type\)\s*VALUES \(.+?,.+?,.+?,.+?,\s*(.+?)\);/g;
          
          const matchUpper = triggerDefinition.match(regexUpper);
          const matchLower = triggerDefinition.match(regexLower);
          const matchInserts = [...triggerDefinition.matchAll(regexInsert)];
          
          if (matchUpper && matchLower && matchInserts.length > 0) {
              const upperThreshold = matchUpper[1];
              const lowerThreshold = matchLower[1];
              const types = matchInserts.map(match => {
                const values = match[1]; // This now includes the entire VALUES clause without the parentheses
                const valueItems = values.split(', ');
                const typeString = valueItems[valueItems.length - 1].replace(/['";]+/g, ''); // This now gets the last item and removes any quotes or semicolons
                
                return typeString;
                
              });
              // console.log(types);
              
              
              
              
              
            // console.log(types);
            
            const uniqueTypes = [...new Set(types)];
            const uniqueType = uniqueTypes[0];

              // Send the thresholds and types to the user
              res.send({upperThreshold: upperThreshold , lowerThreshold: lowerThreshold ,type: uniqueType.split(',')[1] , Active : isActive});
          } else {
              res.send('No match found');
          }
          

          
      }
  )};



updateReactivePowerThresholds(req, res) {
    const newUpperThreshold = req.body.newUpperThreshold;
    const newLowerThreshold = req.body.newLowerThreshold;
    const type = req.body.type;
    const IsActive = req.body.IsActive;
    const TriggerName = 'ReacTivePowerTrigger';

    if(!newLowerThreshold || !newUpperThreshold || !type){
    console.error('Invalid request');
    res.status(400).json({error: 'Thresholds cannot be empty.'});
    return;
    }

    this.systemService.updateReactivePowerTriggerDefinition(newUpperThreshold, newLowerThreshold , type , TriggerName , IsActive, (error, results, fields) => {
        if (error) res.status(500).send(error);
        else res.send('Thresholds updated successfully!');
    });
}
//Apparent Power
getApparentPowerTriggerDefinition(req, res) {
  this.systemService.getApparentPowerTriggerDefinition((error, triggerResults, statusResults ) => {
    if (error) {
        return res.status(500).send(error);
    }
    // Check if the status results have any data
    if (!statusResults.length) {
        return res.status(404).send({ message: 'No status found for the trigger.' });
    }
           // Extract the upper and lower threshold from the trigger definition
           const isActive = statusResults[0].IsActive;
           const triggerDefinition = triggerResults[0]['SQL Original Statement'];
          // console.log(triggerDefinition);
          const regexLower = /IF NEW\.apparent_power\s*<=\s*(\d+)/;
          const regexUpper = /IF NEW\.apparent_power\s*>=\s*(\d+)/;
          const regexInsert = /INSERT INTO MeterNotifications \(DRN, AlarmType, Alarm, Urgency_Type, Type\)\s*VALUES \((.+?)\);/g;
          
          const matchUpper = triggerDefinition.match(regexUpper);
          const matchLower = triggerDefinition.match(regexLower);
          const matchInserts = [...triggerDefinition.matchAll(regexInsert)];
          
          if (matchUpper && matchLower && matchInserts.length > 0) {
              const upperThreshold = matchUpper[1];
              const lowerThreshold = matchLower[1];
              const types = matchInserts.map(match => {
                const values = match[1]; // This now includes the entire VALUES clause without the parentheses
                const valueItems = values.split(', ');
              
                if (valueItems.length >= 5) {
                  const typeString = valueItems[4].replace(/['";]+/g, ''); // This now gets the fifth item and removes any quotes or semicolons
                  return typeString;
                }
              });
              
              
            // console.log(types);
            
            const uniqueTypes = [...new Set(types)];
            const uniqueType = uniqueTypes[0];

              // Send the thresholds and types to the user
              res.send({upperThreshold: upperThreshold , lowerThreshold: lowerThreshold ,type: uniqueType.split(',')[1] , Active : isActive});
          } else {
              res.send('No match found');
          }
          

          
      }
  )};



updateApparentPowerThresholds(req, res) {
    const newUpperThreshold = req.body.newUpperThreshold;
    const newLowerThreshold = req.body.newLowerThreshold;
    const type = req.body.type;
    const IsActive = req.body.IsActive;
    const TriggerName = 'ApparentPowerTrigger';

    if(!newLowerThreshold || !newUpperThreshold || !type){
    console.error('Invalid request');
    res.status(400).json({error: 'Thresholds cannot be empty.'});
    return;
    }

    this.systemService.updateApparentPowerTriggerDefinition(newUpperThreshold, newLowerThreshold , type , TriggerName , IsActive, (error, results, fields) => {
        if (error) res.status(500).send(error);
        else res.send('Thresholds updated successfully!');
    });
}

//Power Factor
getPowerFactorTriggerDefinition(req, res) {
  this.systemService.getPowerFactorTriggerDefinition((error, triggerResults, statusResults) => {
    if (error) {
        return res.status(500).send(error);
    }
    // Check if the status results have any data
    if (!statusResults.length) {
        return res.status(404).send({ message: 'No status found for the trigger.' });
    }

    // Extract the upper and lower threshold from the trigger definition
    const isActive = statusResults[0].IsActive;
    const triggerDefinition = triggerResults[0]['SQL Original Statement'];
          
          const regexLower = /IF NEW\.power_factor\s*<=\s*(\d+(\.\d+)?)/;


          
          const regexInsert = /INSERT INTO MeterNotifications \(DRN, AlarmType, Alarm, Urgency_Type, Type\)\s*VALUES \((.+?)\);/g;
          
          
          const matchLower = triggerDefinition.match(regexLower);
          // console.log(matchLower);
          const matchInserts = [...triggerDefinition.matchAll(regexInsert)];
          // console.log(matchLower);  
          // console.log(matchInserts);
          
          if (matchLower && matchInserts.length > 0) {
              
              const lowerThreshold = matchLower[1];
              const types = matchInserts.map(match => {
                const values = match[1]; // This now includes the entire VALUES clause without the parentheses
                const valueItems = values.split(', ');
                if (valueItems.length >= 5) {
                  const typeString = valueItems[4].replace(/['";]+/g, ''); // This now gets the fifth item and removes any quotes or semicolons
                  return typeString;
                }
              });
              
              
              
            // console.log(types);
            
            const uniqueTypes = [...new Set(types)];
            const uniqueType = uniqueTypes[0];

              // Send the thresholds and types to the user
              res.send({ lowerThreshold: lowerThreshold ,type: uniqueType.split(',')[1] ,Active : isActive });
          } else {
              res.send('No match found');
          }
          

          
      }
  )};



updatePowerFactorThresholds(req, res) {
    // const newUpperThreshold = req.body.newUpperThreshold;
    const newLowerThreshold = req.body.newLowerThreshold;
    const type = req.body.type;
    const IsActive = req.body.IsActive;
    const TriggerName = 'PowerFactorCorrection';


    if(!newLowerThreshold || !type){
    console.error('Invalid request');
    res.status(400).json({error: 'Thresholds cannot be empty.'});
    return;
    }

    this.systemService.updatePowerFactorTriggerDefinition( newLowerThreshold , type, TriggerName , IsActive , (error, results, fields) => {
        if (error) res.status(500).send(error);
        else res.send('Thresholds updated successfully!');
    });
}
//Temperature
getTemperatureTriggerDefinition(req, res) {
  this.systemService.getTemperatureTriggerDefinition((error, triggerResults, statusResults) => {
    if (error) {
        return res.status(500).send(error);
    }
    // Check if the status results have any data
    if (!statusResults.length) {
        return res.status(404).send({ message: 'No status found for the trigger.' });
    }

    // Extract the upper and lower threshold from the trigger definition
    const isActive = statusResults[0].IsActive;
    const triggerDefinition = triggerResults[0]['SQL Original Statement'];
          // console.log(triggerDefinition);
          
          const regexUpper = /IF NEW\.temperature\s*>=\s*(\d+(\.\d+)?)/;


          
          const regexInsert = /INSERT INTO MeterNotifications \(DRN, AlarmType, Alarm, Urgency_Type, Type\)\s*VALUES \((.+?)\);/g;
          
          
          const matchUpper = triggerDefinition.match(regexUpper);
          // console.log(matchUpper);
          const matchInserts = [...triggerDefinition.matchAll(regexInsert)];
          // console.log(matchUpper);
          // console.log(matchInserts);
          
          if (matchUpper && matchInserts.length > 0) {
              
              const UpperThreshold = matchUpper[1];
              const types = matchInserts.map(match => {
                const values = match[1]; // This now includes the entire VALUES clause without the parentheses
                const valueItems = values.split(', ');
                if (valueItems.length >= 5) {
                  const typeString = valueItems[4].replace(/['";]+/g, ''); // This now gets the fifth item and removes any quotes or semicolons
                  return typeString;
                }
              });
              
              
              
            // console.log(types);
            
            const uniqueTypes = [...new Set(types)];
            const uniqueType = uniqueTypes[0];

              // Send the thresholds and types to the user
              res.send({ UpperThreshold: UpperThreshold,type: uniqueType.split(',')[1] , Active : isActive });
          } else {
              res.send('No match found');
          }
          

          
      }
  )};



updateTemperatureThresholds(req, res) {
  const newUpperThreshold = req.body.newUpperThreshold;
  const type = req.body.type;
  const IsActive = req.body.IsActive;
  const TriggerName = 'TemperatureWarning';

  if (!newUpperThreshold || !type) {
      console.error('Invalid request');
      res.status(400).json({ error: 'Threshold and type cannot be empty.' });
      return;
  }

  // Assuming this.systemService.updateTemperatureTriggerDefinition is properly defined elsewhere
  this.systemService.updateTemperatureTriggerDefinition(newUpperThreshold, type,TriggerName , IsActive , (error, results, fields) => {
      if (error) {
          console.error('Error updating thresholds:', error);
          res.status(500).send(error);
      } else {
          res.send('Thresholds updated successfully!');
      }
  });
}
//Units
getLowEnergyUnitsTriggerDefinition(req, res) {
  this.systemService.getLowEnergyUnitsTriggerDefinition((error,  triggerResults, statusResults) => {
    if (error) {
        return res.status(500).send(error);
    }
    // Check if the status results have any data
    if (!statusResults.length) {
        return res.status(404).send({ message: 'No status found for the trigger.' });
    }

    // Extract the upper and lower threshold from the trigger definition
    const isActive = statusResults[0].IsActive;
    const triggerDefinition = triggerResults[0]['SQL Original Statement'];
          
          const regexLower = /IF NEW\.units BETWEEN (\d+(\.\d+)?) AND (\d+(\.\d+)?)/;
          const regexInsert = /INSERT INTO MeterNotifications \(DRN, AlarmType, Alarm, Urgency_Type, Type\)\s*VALUES \(.+?,.+?,.+?,.+?,\s*'(.+?)'\);/g;
          
          const matchLower = triggerDefinition.match(regexLower);
          const matchInserts = [...triggerDefinition.matchAll(regexInsert)];
          
          
          if (matchLower && matchInserts.length > 0) {
              const lowerThreshold = matchLower[1];
              const upperThreshold = matchLower[3];
              const types = matchInserts.map(match => {
                // This now includes the entire VALUES clause without the parentheses
                const typeString = match[1].trim().replace(/['";]+/g, ''); // This now gets the type and removes any quotes or semicolons
                return typeString;
              });
              
              const uniqueTypes = [...new Set(types)];
             
              const uniqueType = uniqueTypes[0];

              // Send the thresholds and types to the user
              res.send({ lowerThreshold: lowerThreshold, upperThreshold: upperThreshold, type: uniqueType , Active : isActive});
          } else {
              res.send('No match found');
          }
      }
  )};


updateLowEnergyUnitsThresholds(req, res) {
  const newLowerThreshold = req.body.newLowerThreshold;
  const newUpperThreshold = req.body.newUpperThreshold;
  const type = req.body.type;
  const IsActive = req.body.IsActive;
  const TriggerName = 'LowEnergyUnits';

  if (!newLowerThreshold || !newUpperThreshold || !type) {
      console.error('Invalid request');
      res.status(400).json({ error: 'Thresholds and type cannot be empty.' });
      return;
  }

  this.systemService.updateLowEnergyUnitsTriggerDefinition(newUpperThreshold, newLowerThreshold , type , TriggerName , IsActive ,  (error, results, fields) => {
      if (error) {
          console.error('Error updating thresholds:', error);
          res.status(500).send(error);
      } else {
          res.send('Thresholds updated successfully!');
      }
  });
}
//Frequency
getFrequencyDeviationTriggerDefinition(req, res) {
  this.systemService.getFrequencyDeviationTriggerDefinition((error, triggerResults, statusResults) => {
    if (error) {
        return res.status(500).send(error);
    }
    // Check if the status results have any data
    if (!statusResults.length) {
        return res.status(404).send({ message: 'No status found for the trigger.' });
    }

    // Extract the upper and lower threshold from the trigger definition
    const isActive = statusResults[0].IsActive;
    const triggerDefinition = triggerResults[0]['SQL Original Statement'];
          
          const regexLower = /IF NEW\.frequency\s*<\s*(\d+(\.\d+)?)/;
          const regexInsert = /INSERT INTO MeterNotifications \(DRN, AlarmType, Alarm, Urgency_Type, Type\)\s*VALUES \(.+?,.+?,.+?,.+?,(.+?)\);/g;
          
          const matchLower = triggerDefinition.match(regexLower);
          const matchInserts = [...triggerDefinition.matchAll(regexInsert)];
          
          if (matchLower && matchInserts.length > 0) {
              const lowerThreshold = matchLower[1];
              const types = matchInserts.map(match => {
                const typeString = match[1].trim().replace(/['";]+/g, ''); // This now gets the type and removes any quotes or semicolons
                return typeString;
              });
              
              const uniqueTypes = [...new Set(types)];
              const uniqueType = uniqueTypes[0];

              // Send the thresholds and types to the user
              res.send({ lowerThreshold: lowerThreshold, type: uniqueType.split(',')[1] , Active : isActive  });
          } else {
              res.send('No match found');
          }
      }
  )};


updateFrequencyDeviationThresholds(req, res) {
  const newLowerThreshold = req.body.newLowerThreshold;
  const type = req.body.type;
  const IsActive = req.body.IsActive;
const TriggerName = 'FrequencyDeviation';

  if (!newLowerThreshold || !type) {
      console.error('Invalid request');
      res.status(400).json({ error: 'Threshold and type cannot be empty.' });
      return;
  }

  this.systemService.updateFrequencyDeviationTriggerDefinition(newLowerThreshold, type, TriggerName , IsActive ,(error, results, fields) => {
      if (error) {
          console.error('Error updating thresholds:', error);
          res.status(500).send(error);
      } else {
          res.send('Thresholds updated successfully!');
      }
  });
}
}

module.exports = SystemController;