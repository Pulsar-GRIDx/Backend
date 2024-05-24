class SystemService {
  constructor() {
      this.db = require('../config/db');
        // Assuming db.getdb() returns a connection object
  }

  getVoltageTriggerDefinition(callback) {
    this.db.query('SHOW CREATE TRIGGER LowAndHighVoltageTrigger;', (error, triggerResults) => {
        if (error) {
            return callback(error);
        }
        this.db.query(`SELECT IsActive FROM TriggerStatus WHERE TriggerName ='LowAndHighVoltageTrigger'`, (error, statusResults) => {
            if (error) {
                return callback(error);
            }
            callback(null, triggerResults, statusResults);
        });
    });
}

updateVoltageTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) {
  const triggerDefinition = `
      CREATE TRIGGER LowAndHighVoltageTrigger
      AFTER INSERT ON MeteringPower
      FOR EACH ROW
      BEGIN
      DECLARE isActive BOOLEAN;
    
      -- Check if the trigger is active
      SELECT IsActive INTO isActive FROM TriggerStatus WHERE TriggerName = ${TriggerName};
      
      IF isActive THEN
          IF NEW.voltage >= ${newUpperThreshold} THEN
              INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
              VALUES (NEW.DRN, 'Meter Voltage', CONCAT('High Voltage: ', NEW.voltage), 2, '${type}');
          END IF;

          IF NEW.voltage <= ${newLowerThreshold} THEN
              INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
              VALUES (NEW.DRN, 'Meter Voltage', CONCAT('Low Voltage: ', NEW.voltage), 2, '${type}');
          END IF;
      END IF;
      END;
        
  `;
  const updateTriggerStatus = `
      INSERT INTO TriggerStatus (TriggerName, IsActive)
      VALUES ('${TriggerName}', ${IsActive})
      ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);
  `;

  this.db.query('DROP TRIGGER IF EXISTS LowAndHighVoltageTrigger;', (error, results) => {
      if (error) return callback(error);

      this.db.query(triggerDefinition, (error, results) => {
          if (error) return callback(error);

          this.db.query(updateTriggerStatus, (error, results) => {
              if (error) return callback(error);
              callback(null, 'Trigger and status updated successfully!');
          });
      });
  });
}



//Current threshold
getCurrentTriggerDefinition(callback) {
  this.db.query('SHOW CREATE TRIGGER CurrentOverload;', (error, triggerResults) =>{

    if (error) {
      return callback(error);
  }
  this.db.query(`SELECT IsActive FROM TriggerStatus WHERE TriggerName = 'CurrentOverload';`, (error, statusResults) => {
      if (error) {
          return callback(error);
      }
      callback(null, triggerResults, statusResults);
  });
});

}

updateCurrentTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) {
  const triggerDefinition = `
    
    CREATE TRIGGER CurrentOverload
    AFTER INSERT ON MeteringPower
    FOR EACH ROW
    BEGIN
        DECLARE sum_current DECIMAL(18,2);
        DECLARE isActive BOOLEAN;

        -- Check if the trigger is active
        SELECT IsActive INTO isActive FROM TriggerStatus WHERE TriggerName = '${TriggerName}';
        IF isActive THEN
            -- Calculate the sum of the last 10 current values for the current DRN
            SELECT SUM(current) INTO sum_current
            FROM (
                SELECT current
                FROM MeteringPower
                WHERE DRN = NEW.DRN
                ORDER BY id DESC
                LIMIT 10
            ) AS subquery;

            -- Check if the sum exceeds the threshold
            IF sum_current >= ${newUpperThreshold} THEN
                INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
                VALUES (NEW.DRN, 'Meter Current', CONCAT('Too much current overload: ', sum_current), 2, '${type}');
            END IF;

            -- Check if the sum is below the lower threshold
            IF sum_current <= ${newLowerThreshold} THEN
                INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
                VALUES (NEW.DRN, 'Meter Current', CONCAT('Low current: ', sum_current), 2, '${type}');
            END IF;
        END IF;
    END;
  `;

  const updateTriggerStatus = `
    INSERT INTO TriggerStatus (TriggerName, IsActive)
    VALUES ('${TriggerName}', ${IsActive})
    ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);
  `;

  this.db.query('DROP TRIGGER IF EXISTS CurrentOverload', (error, results, fields) => {
    if (error) return callback(error);

    this.db.query(triggerDefinition, (error, results) => {
      if (error) return callback(error);

      this.db.query(updateTriggerStatus, [TriggerName, IsActive], (error, results) => {
        if (error) return callback(error);
        callback(null, 'Trigger and status updated successfully!');
      });
    });
  });
}


//Active Power

getActivePowerTriggerDefinition(callback) {
  this.db.query('SHOW CREATE TRIGGER HighAndLowActivePower;', (error, triggerResults) =>{


    if (error) {
      return callback(error);
  }
  this.db.query(`SELECT IsActive FROM TriggerStatus WHERE TriggerName = 'HighAndLowActivePower';`, (error, statusResults) => {
      if (error) {
          return callback(error);
      }
      callback(null, triggerResults, statusResults);
  });
  });
}



updateActivePowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive,  callback) {
  const triggerDefinition = `
  CREATE TRIGGER HighAndLowActivePower
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
     DECLARE sum_current DECIMAL(18,2);
     DECLARE isActive BOOLEAN;

    -- Check if the trigger is active
     SELECT IsActive INTO isActive FROM TriggerStatus WHERE TriggerName = '${TriggerName}';
    IF isActive THEN

    IF NEW.active_power >= ${newUpperThreshold} THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Active Power', CONCAT('High active power: ', NEW.active_power), 1,${type});
    END IF;
    IF NEW.active_power <= ${newLowerThreshold} THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Active Power', CONCAT('Low active power: ', NEW.active_power), 2,${type});
    END IF;
  END IF;

END;
  `;

  //GET STATUS
  const updateTriggerStatus = `
    INSERT INTO TriggerStatus (TriggerName, IsActive)
    VALUES ('${TriggerName}', ${IsActive})
    ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);
  `;

  this.db.query('DROP TRIGGER IF EXISTS HighAndLowActivePower;', (error, results, fields) => {
      if (error) return callback(error);
      this.db.query(triggerDefinition, (error, results) => {
        if (error) return callback(error);
  
        this.db.query(updateTriggerStatus, [TriggerName, IsActive], (error, results) => {
          if (error) return callback(error);
          callback(null, 'Trigger and status updated successfully!');
        });
      });
    });
}

//Reactive Power
getReactivePowerTriggerDefinition(callback) {
  this.db.query('SHOW CREATE TRIGGER ReacTivePowerTrigger;', (error, triggerResults)=>{
    if (error) {
      return callback(error);
  }
  this.db.query(`SELECT IsActive FROM TriggerStatus WHERE TriggerName = 'ReacTivePowerTrigger';`, (error, statusResults) => {
      if (error) {
          return callback(error);
      }
      callback(null, triggerResults, statusResults);
    });    
  });
}

updateReactivePowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive,  callback) {
  const triggerDefinition = `
  CREATE TRIGGER ReacTivePowerTrigger
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
DECLARE isActive BOOLEAN;

-- Check if the trigger is active
 SELECT IsActive INTO isActive FROM TriggerStatus WHERE TriggerName = '${TriggerName}';
IF isActive THEN 
    IF NEW.reactive_power >= ${newUpperThreshold} THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter reactive_power', CONCAT('High reactive_power: ', NEW.reactive_power), 2,${type});
    END IF;

    IF NEW.reactive_power <= ${newLowerThreshold} THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter reactive_power', CONCAT('Low reactive_power: ', NEW.reactive_power), 2,${type});
    END IF;
    END IF;  
END;
  `;
  //GET STATUS
  const updateTriggerStatus = `
    INSERT INTO TriggerStatus (TriggerName, IsActive)
    VALUES ('${TriggerName}', ${IsActive})
    ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);
  `;

  this.db.query('DROP TRIGGER IF EXISTS ReacTivePowerTrigger;', (error, results, fields) => {
    if (error) return callback(error);
    this.db.query(triggerDefinition, (error, results) => {
      if (error) return callback(error);

      this.db.query(updateTriggerStatus, [TriggerName, IsActive], (error, results) => {
        if (error) return callback(error);
        callback(null, 'Trigger and status updated successfully!');
      });
    });
  });
}


//Apparent power
getApparentPowerTriggerDefinition(callback) {
  this.db.query('SHOW CREATE TRIGGER ApparentPowerTrigger;', (error, triggerResults)=>{
    if (error) {
      return callback(error);
  }
  this.db.query(`SELECT IsActive FROM TriggerStatus WHERE TriggerName = 'ApparentPowerTrigger';`, (error, statusResults) => {
      if (error) {
          return callback(error);
      }
      callback(null, triggerResults, statusResults);
  });

  });
}

updateApparentPowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) {
  const triggerDefinition = `
  CREATE TRIGGER ApparentPowerTrigger
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
DECLARE isActive BOOLEAN;

-- Check if the trigger is active
 SELECT IsActive INTO isActive FROM TriggerStatus WHERE TriggerName = '${TriggerName}';
IF isActive THEN
    IF NEW.apparent_power >= ${newUpperThreshold} THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter apparent_power', CONCAT('High apparent_power: ', NEW.reactive_power), 1,${type});
    END IF;

    IF NEW.apparent_power <= ${newLowerThreshold} THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter apparent_power', CONCAT('Low apparent_power: ', NEW.reactive_power), 1,${type});
    END IF;
    END IF;  
END
  `;
  //GET STATUS
  const updateTriggerStatus = `
    INSERT INTO TriggerStatus (TriggerName, IsActive)
    VALUES ('${TriggerName}', ${IsActive})
    ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);
  `;

  this.db.query('DROP TRIGGER IF EXISTS ApparentPowerTrigger;', (error, results, fields) => {
    if (error) return callback(error);
    this.db.query(triggerDefinition, (error, results) => {
      if (error) return callback(error);

      this.db.query(updateTriggerStatus, [TriggerName, IsActive], (error, results) => {
        if (error) return callback(error);
        callback(null, 'Trigger and status updated successfully!');
      });
    });
  });
}

//Power Factor
getPowerFactorTriggerDefinition(callback) {
  this.db.query('SHOW CREATE TRIGGER PowerFactorCorrection;', (error, triggerResults) =>{
    if (error) {
      return callback(error);
  }
  this.db.query(`SELECT IsActive FROM TriggerStatus WHERE TriggerName = 'PowerFactorCorrection';`, (error, statusResults) => {
      if (error) {
          return callback(error);
      }
      callback(null, triggerResults, statusResults);
  });
  });
}

updatePowerFactorTriggerDefinition(newLowerThreshold, type, TriggerName, IsActive,  callback) {
  const triggerDefinition = `
  CREATE TRIGGER PowerFactorCorrection
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
DECLARE isActive BOOLEAN;

-- Check if the trigger is active
 SELECT IsActive INTO isActive FROM TriggerStatus WHERE TriggerName = '${TriggerName}';
  IF isActive THEN
    IF NEW.power_factor <= ${newLowerThreshold} THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Power Factor', CONCAT('Low/bad power factor: ', NEW.power_factor), 1,${type});
    END IF;
  END IF;  
END;

  `;
  //GET STATUS
  const updateTriggerStatus = `
    INSERT INTO TriggerStatus (TriggerName, IsActive)
    VALUES ('${TriggerName}', ${IsActive})
    ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);
  `;

  this.db.query('DROP TRIGGER IF EXISTS PowerFactorCorrection;', (error, results, fields) => {
    if (error) return callback(error);
    this.db.query(triggerDefinition, (error, results) => {
      if (error) return callback(error);

      this.db.query(updateTriggerStatus, [TriggerName, IsActive], (error, results) => {
        if (error) return callback(error);
        callback(null, 'Trigger and status updated successfully!');
      });
    });
  });
}

//Temperature
getTemperatureTriggerDefinition(callback) {
  this.db.query('SHOW CREATE TRIGGER TemperatureWarning;', (error, triggerResults)=>{
    if (error) {
      return callback(error);
  }
  this.db.query(`SELECT IsActive FROM TriggerStatus WHERE TriggerName = 'TemperatureWarning';`, (error, statusResults) => {
      if (error) {
          return callback(error);
      }
      callback(null, triggerResults, statusResults);
  });
  });
}

updateTemperatureTriggerDefinition(newUpperThreshold, type, TriggerName, IsActive,  callback) {
  const triggerDefinition = `
  CREATE TRIGGER TemperatureWarning
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
DECLARE isActive BOOLEAN;

-- Check if the trigger is active
 SELECT IsActive INTO isActive FROM TriggerStatus WHERE TriggerName = '${TriggerName}';
  IF isActive THEN
    IF NEW.temperature >= ${newUpperThreshold} THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Temperature', CONCAT('High temperature: ', NEW.temperature), 1,${type});
    END IF;
  END IF;  
END;

  `;
//GET STATUS
const updateTriggerStatus = `
INSERT INTO TriggerStatus (TriggerName, IsActive)
VALUES ('${TriggerName}', ${IsActive})
ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);
`;

  this.db.query('DROP TRIGGER IF EXISTS TemperatureWarning;', (error, results, fields) => {
    if (error) return callback(error);
    this.db.query(triggerDefinition, (error, results) => {
      if (error) return callback(error);

      this.db.query(updateTriggerStatus, [TriggerName, IsActive], (error, results) => {
        if (error) return callback(error);
        callback(null, 'Trigger and status updated successfully!');
      });
    });
  });
}


//Units

getLowEnergyUnitsTriggerDefinition(callback) {
  this.db.query('SHOW CREATE TRIGGER LowEnergyUnits;', (error, triggerResults)=>{
      if (error) {
          return callback(error);
      }
      this.db.query(`SELECT IsActive FROM TriggerStatus WHERE TriggerName = 'LowEnergyUnits';`, (error, statusResults) => {
          if (error) {
              return callback(error);
          }
          callback(null, triggerResults, statusResults);
      });
  });
}

updateLowEnergyUnitsTriggerDefinition(newLowerThreshold, newUpperThreshold, type, TriggerName, IsActive,  callback) {
  const triggerDefinition = `
  CREATE TRIGGER LowEnergyUnits
AFTER INSERT ON MeterCumulativeEnergyUsage
FOR EACH ROW
BEGIN
DECLARE urgency_type INT DEFAULT 0;
DECLARE isActive BOOLEAN;
    
-- Check if the trigger is active
SELECT IsActive INTO isActive FROM TriggerStatus WHERE TriggerName = ${TriggerName};

IF isActive THEN
    

    IF NEW.units BETWEEN ${newLowerThreshold} AND ${newUpperThreshold} THEN
        IF NEW.units <= 20 THEN
            SET urgency_type = 1;
        ELSEIF NEW.units <= 25 THEN
            SET urgency_type = 2;
        ELSE
            SET urgency_type = 3;
        END IF;

        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Units', CONCAT('Low units remaining: ', NEW.units), urgency_type, '${type}');
    END IF;
  END IF;  
END;
  `;

  const updateTriggerStatus = `
      INSERT INTO TriggerStatus (TriggerName, IsActive)
      VALUES ('${TriggerName}', ${IsActive})
      ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);
  `;

  this.db.query('DROP TRIGGER IF EXISTS LowEnergyUnits;', (error, results, fields) => {
      if (error) return callback(error);
      this.db.query(triggerDefinition, (error, results) => {
        if (error) return callback(error);

        this.db.query(updateTriggerStatus, (error, results) => {
            if (error) return callback(error);
            callback(null, 'Trigger and status updated successfully!');
        });
    });
});
}
//Frequency
getFrequencyDeviationTriggerDefinition(callback) {
  this.db.query('SHOW CREATE TRIGGER FrequencyDeviation;', (error, triggerResults)=>{
    if (error) {
      return callback(error);
  }
  this.db.query(`SELECT IsActive FROM TriggerStatus WHERE TriggerName = 'FrequencyDeviation';`, (error, statusResults) => {
      if (error) {
          return callback(error);
      }
      callback(null, triggerResults, statusResults);
  });
  });
}

updateFrequencyDeviationTriggerDefinition(newLowerThreshold, type, TriggerName, IsActive, callback) {
  const triggerDefinition = `
  CREATE TRIGGER FrequencyDeviation
AFTER INSERT ON MeteringPower
FOR EACH ROW
BEGIN
DECLARE isActive BOOLEAN;

-- Check if the trigger is active
 SELECT IsActive INTO isActive FROM TriggerStatus WHERE TriggerName = '${TriggerName}';
  IF isActive THEN
    IF NEW.frequency < ${newLowerThreshold} THEN
        INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type)
        VALUES (NEW.DRN, 'Meter Frequency', CONCAT('Low frequency: ', NEW.frequency), 1, ${type});
    END IF;
  END IF;   
END;
  `;

  //GET STATUS
const updateTriggerStatus = `
INSERT INTO TriggerStatus (TriggerName, IsActive)
VALUES ('${TriggerName}', ${IsActive})
ON DUPLICATE KEY UPDATE IsActive = VALUES(IsActive);
`;

  this.db.query('DROP TRIGGER IF EXISTS FrequencyDeviation;', (error, results, fields) => {
    if (error) return callback(error);
    this.db.query(triggerDefinition, (error, results) => {
      if (error) return callback(error);

      this.db.query(updateTriggerStatus, [TriggerName, IsActive], (error, results) => {
        if (error) return callback(error);
        callback(null, 'Trigger and status updated successfully!');
      });
    });
  });
}



}
module.exports = SystemService;
