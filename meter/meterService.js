const db = require('../config/db');
//Total meters
exports.getAllTotalMeters = function() {
  const getAllTotalMeters = `SELECT COUNT(DISTINCT DRN) as totalMeters FROM MeterProfileReal`;

  return new Promise((resolve, reject) => {
    db.query(getAllTotalMeters, (err, results) => {
      if (err) {
        console.error('Error querying the database:', err);
        reject(err); // Reject the promise with the error
      } else if (results.length === 0) {
        console.error('No results');
        resolve({ totalMeters: 0 }); // Resolve the promise with 0 if no results
      } else {
        resolve(results[0]); // Resolve the promise with the first result
      }
    });
  });
};
//Total tranformers 

exports.getTotalTransformers = () =>{
  const getTotalTransformers = `SELECT COUNT(DRN) as totalTransformers FROM TransformerInformation`;

  return new Promise((resolve, reject) =>{
    db.query(getTotalTransformers,(err,results) =>{
      if (err) {
        console.error('Error querying the database:', err);
        reject(err);
        
      } else {
        resolve(results[0]);
        
      }
    });
  });
};

///-------------------------------------Active Inactive meters-----------------------------------------------------///
exports.getAllActiveAndInactiveMeters = function(callback) {
  const getTotal = `SELECT COUNT(DISTINCT DRN) as totalMeters FROM MeterProfileReal`;
  const getAllActiveAndInactiveMeters = `
      SELECT DRN, mains_state
      FROM (
          SELECT DRN, mains_state, ROW_NUMBER() OVER (PARTITION BY DRN ORDER BY date_time DESC) as rn
          FROM MeterLoadControl
          WHERE DATE(date_time) = CURDATE()
      ) t
      WHERE t.rn = 1`;

  db.query(getAllActiveAndInactiveMeters, (err, results) => {
      if (err) {
          console.log('Error querying the database:', err);
          return callback({ error: 'Error querying the database:', details: err });
      }

      if (results.length === 0) {
          console.log('No data found');
          return callback({ error: 'No data found' });
      }

      // Count occurrences of '0' and '1' in the 'mains_state' column
      const inactiveMetersCount = results.filter(row => row.mains_state === '0').length;
      const activeMetersCount = results.filter(row => row.mains_state === '1').length;

      // Retrieve the total count of meters
      db.query(getTotal, (err, totalResult) => {
          if (err) {
              console.log('Error querying the database:', err);
              return callback({ error: 'Database query failed', details: err });
          }
          
          const totalMeters = totalResult[0].totalMeters;

          // Calculate the count of inactive meters using the total count
          const inactiveMeters = totalMeters - activeMetersCount;

          // Pass the counts to the callback function
          callback(null, { inactiveMeters:inactiveMeters,  activeMeters:activeMetersCount });
      });
  });
};


//-------------------------------------------TokenAmount Api---------------------------------------//
exports.getTokenAmount = function(currentDate, callback) {
  // Query for records where display_msg is 'Accept' and date_time is the current date
  const getCurrentData = "SELECT token_amount FROM STSTokesInfo WHERE display_msg = 'Accept' AND date_time = ?";
  // Query for all previous records
  const getPreviousData = "SELECT token_amount FROM STSTokesInfo WHERE display_msg = 'Accept' AND date_time < ?";
  // Query for the earliest date_time in the database
  const getStartDate = "SELECT MIN(date_time) as startDate FROM STSTokesInfo";

  db.query(getCurrentData, [currentDate], (err, currentData) => {
    if (err) return callback(err);
    db.query(getPreviousData, [currentDate], (err, previousData) => {
      if (err) return callback(err);
      db.query(getStartDate, [], (err, startDateResult) => {
        if (err) return callback(err);
        callback(null, { currentData, previousData, startDateResult});
      });
    });
  });
};
//-------------------------------------------------TokenCount Api-------------------------------------//
exports.getTokenCount = function(currentDate, callback) {
  const getCurrentData = "SELECT display_msg FROM STSTokesInfo WHERE display_msg = 'Accept' AND date_time = ?";
  const getPreviousData = "SELECT display_msg FROM STSTokesInfo WHERE display_msg = 'Accept' AND date_time < ?";
  const getStartDate = "SELECT MIN(date_time) as startDate FROM STSTokesInfo";

  db.query(getCurrentData, [currentDate], (err, currentData) => {
    if (err) return callback(err);
    db.query(getPreviousData, [currentDate], (err, previousData) => {
      if (err) return callback(err);
      db.query(getStartDate, [], (err, startDateResult) => {
        if (err) return callback(err);
        callback(null, { currentData, previousData, startDateResult});
      });
    });
  });
};

//-------------------------------------------------Total Energy Consumption-----------------------------//
exports.getCurrentData = () => {
  function getCurrentDate() {
    const currentDate = new Date();
    return currentDate;
  }
  
  // Example usage:
  const currentDate = getCurrentDate();
  
  
  const getCurrentData = "SELECT apparent_power, DATE(date_time) as date_time FROM MeteringPower WHERE DATE(date_time) = CURDATE()";
  return new Promise((resolve, reject) => {
    db.query(getCurrentData, [currentDate],(err, currentData) => {
      if (err) reject(err);
      else resolve(currentData);
      // console.log(currentData);
    });
  });
};

exports.getStartDate = () => {
  const getStartDate = "SELECT MIN(date_time) AS startDate FROM MeteringPower";
  
  return new Promise((resolve, reject) => {
    db.query(getStartDate, (err, startDateResult) => {
      if (err) reject(err);
      
      else resolve(startDateResult);
      
    
   
    });
  });
};

exports.getPreviousData = (startDateResult) => {
  
  const getPreviousData = "SELECT apparent_power, DATE(date_time) as date_time FROM MeteringPower WHERE DATE(date_time) >= ?";
  return new Promise((resolve, reject) => {
    db.query(getPreviousData, [startDateResult], (err, allData) => {
      if (err) reject(err);
      else resolve(allData);
      // console.log(allData);
    });
  });
};

exports.calculateTotalss = (allData) => {
  return allData.reduce((acc, record) => {
    const date = record.date_time;
    const energy = Number(record.apparent_power) / 1000 ;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += energy;
    return acc;
  }, {});
};


//-------------------------------------------------Current And last Week API-------------------------------------//
exports.getSystemCurrentWeekData = () => {
  const query = `
    SELECT DATE(date_time) as date, SUM(apparent_power) as total_apparent_power
    FROM MeteringPower
    WHERE
        WEEKDAY(date_time) BETWEEN 0 AND 6 AND
        WEEK(date_time, 1) = WEEK(CURDATE(), 1) 
    GROUP BY date
  `;

  return new Promise((resolve, reject) => {
    db.query(query, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

exports.getSystemLastWeekData = () => {
  const query = `
    SELECT DATE(date_time) as date, SUM(apparent_power) as total_apparent_power
    FROM MeteringPower
    WHERE
        WEEKDAY(date_time) BETWEEN 0 AND 6 AND
        WEEK(date_time, 1) = WEEK(CURDATE(), 1) - 1 
    GROUP BY date
  `;

  return new Promise((resolve, reject) => {
    db.query(query,(err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};



exports.getSystemCurrentMonthData = () => {
  const query = `
    SELECT DATE(date_time) as date, SUM(apparent_power) as total_apparent_power
    FROM MeteringPower
    WHERE
        YEAR(date_time) = YEAR(CURDATE()) AND MONTH(date_time) = MONTH(CURDATE()) 
    GROUP BY date
  `;

  return new Promise((resolve, reject) => {
    db.query(query,(err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

exports.getSystemLastMonthData = () => {
  const query = `
    SELECT DATE(date_time) as date, SUM(apparent_power) as total_apparent_power
    FROM MeteringPower
    WHERE
        YEAR(date_time) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(date_time) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
    GROUP BY date
  `;

  return new Promise((resolve, reject) => {
    db.query(query, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};


exports.CalculateSystemData = (allData) => {
  return allData.reduce((acc, record) => {
    const date = record.date.toISOString().split('T')[0];
    const energy = Number(record.total_apparent_power) / 1000 ;
    acc[date] = (acc[date] || 0) + energy;
    return acc;
  }, {});
};





exports.getSystemVoltageAndCurrent = () => {
  const getVoltageAndCurrentQuery = "SELECT voltage, current, DATE(date_time) as date_time FROM MeteringPower WHERE DATE(date_time) = CURDATE()";
  // console.log(CURDATE());
  return new Promise((resolve, reject) => {
    db.query(getVoltageAndCurrentQuery, (err, current , voltage) => {
      if (err) reject(err);
      else resolve(current , voltage);
      // console.log(current,voltage);
    });
  });
};

////
exports.calculateSystemVoltageAndCurrent = (readings) => {
  if (!readings || !Array.isArray(readings) || readings.length === 0) {
    return new Error("Invalid or empty readings data");
  }

  // Initialize separate accumulators for voltage and current
  const result = readings.reduce((acc, record) => {
    const voltage = Number(record.voltage) || 0;
    const current = Number(record.current) || 0;

    // Accumulate voltage and current separately
    acc.totalVoltage = (acc.totalVoltage || 0) + voltage;
    acc.totalCurrent = (acc.totalCurrent || 0) + current;

    // Count the number of readings
    acc.count = (acc.count || 0) + 1;

    return acc;
  }, {});

  // Calculate the average voltage
  const totalVoltage = result.totalVoltage / result.count;
  const totalCurrent = (result.totalCurrent / result.count).toFixed(2);

  return {
    totalVoltage,
    totalCurrent:parseFloat(totalCurrent),
  };
};


exports.getStartDate = () => {
  const getStartDate = "SELECT MIN(date_time) AS startDate FROM MeteringPower";
  
  return new Promise((resolve, reject) => {
    db.query(getStartDate, (err, startDateResult) => {
      if (err) reject(err);
      
      else resolve(startDateResult);
      console.log(startDateResult);
      
    
   
    });
  });
};

//------------------------------------------------CurrentDayActiveEnergy----------------------------------------------------------------------//

exports.getCurrentDayData = () => {
  const getCurrentDayData = `
  SELECT 
  t.DRN, 
  t.final_units - t.initial_units as power_consumption
FROM (
  SELECT 
    DRN, 
    date_time, 
    MIN(CAST(units AS DECIMAL(10, 2))) as initial_units,
    MAX(CAST(units AS DECIMAL(10, 2))) as final_units,
    ROW_NUMBER() OVER (PARTITION BY DRN ORDER BY date_time DESC) as rn
  FROM 
  MeterCumulativeEnergyUsage
  WHERE 
    DATE(date_time) = CURDATE() AND 
    HOUR(date_time) = HOUR(NOW())
  GROUP BY 
    DRN, 
    HOUR(date_time)
) t
WHERE 
  t.rn = 1

  `;
  
  return new Promise((resolve, reject) => {
    db.query(getCurrentDayData, (err, currentDayData) => {
      if (err) {
        
        reject(err);
        console.error('Error querying the database:', err);
      }
      else resolve(currentDayData);
    });
  });
};

//----------------------------------------------InsertMeterData---------------------------------------------------------------------------//
exports.insertIntoMeterRealInfo = (data) => {
  const meterRealInfoData = {
    DRN: data.DRN,
    Surname: data.Surname,
    Name: data.Name,
    City: data.City,
    Streetname: data.Streetname,
    Housenumber: data.Housenumber,
    Simnumber: data.Simnumber,
    Usercategory: data.Usercategory,
    
  };
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO MeterProfileReal SET ?', meterRealInfoData, (err) => {
      if (err) {
        reject(err);  
        console.error('Error querying the database:', err);}
      else resolve();
    });
    // console.log(meterRealInfoData);
  });
};

exports.insertIntoAnotherTable = (data) => {
  const anotherTableData = {
    DRN: data.DRN,
    Longitude: data.Meterlng,
    Lat: data.Meterlat,
    pLng: data.Transformerlng,
    pLat: data.Transformerlat,
    PowerSupply: data.TransformerDRN,
    Type: data.Usercategory,
    Suburb: data.Suburb,
  };
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO MeterLocationInfoTable SET ?', anotherTableData, (err) => {
      if (err) {
        reject(err);  
        console.error('Error querying the database:', err);}
      else resolve();
    });
    
  });
};



//------------------------------------------------------totalEnergyPerSuberb--------------------------------------------------------//
exports.getDrnsBySuburb = (suburbs) => {
  const getDrnsBySuburb = 'SELECT DRN FROM MeterLocations WHERE Suburb = ?';
  return new Promise((resolve, reject) => {
    db.query(getDrnsBySuburb, [suburbs], (err, DRN) => {
      if (err) {
        reject(err);  
        console.error('Error querying the database:', err);}
      else resolve(DRN.map(record => record.DRN));
     
    });
  });
};

exports.getEnergyByDrn = (suburb, drn) => {
  const getEnergyByDrn = 'SELECT apparent_power FROM MeterEnergyUsageSummary WHERE DRN = ? AND DATE(date_time) = DATE(NOW()) ORDER BY date_time DESC LIMIT 1';
  return new Promise((resolve, reject) => {
    db.query(getEnergyByDrn, [drn], (err, energyData) => {
      if (err) {
        reject(err);  
        console.error('Error querying the database:', err);}
      else {
        console.log(`Query results for DRN ${drn} in suburb ${suburb}:`, energyData);
        if (energyData.length > 0) {
          console.log('apparent_power:', energyData[0].apparent_power);
        }
        resolve(energyData) / 1000;
      }
    });
  });
};


//-------------------------------------------------------------GetSpecificMeterWeeklyAndMonthlyData------------------------------------------------//

exports.getCurrentWeekData = (DRN) => {
  const query = `
   
SELECT 
DATE(t.date_time) as date, 
SUM(t.final_units - t.initial_units) as total_energy_consumption
FROM (
SELECT 
  DRN, 
  date_time, 
  MIN(CAST(units AS DECIMAL(10, 2))) as initial_units,
  MAX(CAST(units AS DECIMAL(10, 2))) as final_units
FROM 
  MeterCumulativeEnergyUsage
WHERE 
  DRN = ? AND 
  WEEKDAY(date_time) BETWEEN 0 AND 6 AND
  WEEK(date_time, 1) = WEEK(CURDATE(), 1)
GROUP BY 
  DRN, 
  DATE(date_time)
) t
GROUP BY 
DATE(t.date_time)

  `;

  return new Promise((resolve, reject) => {
    db.query(query, [DRN],(err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      // console.log(data);
      }
    });
  });
};

exports.getLastWeekData = (DRN) => {
  const query = `
  SELECT 
  DATE(t.date_time) as date, 
  SUM(t.final_units - t.initial_units) as total_energy_consumption
FROM (
  SELECT 
    DRN, 
    date_time, 
    MIN(CAST(units AS DECIMAL(10, 2))) as initial_units,
    MAX(CAST(units AS DECIMAL(10, 2))) as final_units
  FROM 
  MeterCumulativeEnergyUsage
  WHERE 
    DRN = ? AND 
    WEEKDAY(date_time) BETWEEN 0 AND 6 AND
    WEEK(date_time, 1) = WEEK(CURDATE(), 1) - 1
  GROUP BY 
    DRN, 
    DATE(date_time)
) t
GROUP BY 
  DATE(t.date_time)

  `;

  return new Promise((resolve, reject) => {
    db.query(query, [DRN],(err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

//DRN CurrentMonth and LastMonth

exports.getCurrentMonthData = (DRN) => {
  const query = `
    
SELECT 
DATE(t.date_time) as date, 
SUM(t.final_units - t.initial_units) as total_energy_consumption
FROM (
SELECT 
  DRN, 
  date_time, 
  MIN(CAST(units AS DECIMAL(10, 2))) as initial_units,
  MAX(CAST(units AS DECIMAL(10, 2))) as final_units
FROM 
  MeterCumulativeEnergyUsage
WHERE 
  DRN = ? AND 
  YEAR(date_time) = YEAR(CURDATE()) AND 
  MONTH(date_time) = MONTH(CURDATE())
GROUP BY 
  DRN, 
  DATE(date_time)
) t
GROUP BY 
DATE(t.date_time)

  `;

  return new Promise((resolve, reject) => {
    db.query(query, [DRN],(err, data) => {
      if (err) {
        reject(err);  
        console.error('Error querying the database:', err);} else {
        resolve(data);
      }
    });
  });
};

exports.getLastMonthData = (DRN) => {
  const query = `
  SELECT 
  DATE(t.date_time) as date, 
  SUM(t.final_units - t.initial_units) as total_energy_consumption
FROM (
  SELECT 
    DRN, 
    date_time, 
    MIN(CAST(units AS DECIMAL(10, 2))) as initial_units,
    MAX(CAST(units AS DECIMAL(10, 2))) as final_units
  FROM 
    MeterCumulativeEnergyUsage
  WHERE 
    DRN = ? AND 
    YEAR(date_time) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND 
    MONTH(date_time) = MONTH(CURDATE() - INTERVAL 1 MONTH)
  GROUP BY 
    DRN, 
    DATE(date_time)
) t
GROUP BY 
  DATE(t.date_time)

  `;

  return new Promise((resolve, reject) => {
    db.query(query, [DRN],(err, data) => {
      if (err) {
        reject(err);  
        console.error('Error querying the database:', err);} else {
        resolve(data);
      }
    });
  });
};



exports.CalculateDrnData = (allData) => {
  return allData.reduce((acc, record) => {
    const date = record.date.toISOString().split('T')[0];
    const energy = Number(record.total_energy_consumption) ;
    acc[date] = (acc[date] || 0) + energy;
    return acc;
  }, {});
};




exports.getDRNVoltageAndCurrent = (DRN) => {
  const getVoltageAndCurrentQuery = "SELECT voltage, current, DATE(date_time) as date_time FROM MeteringPower WHERE DATE(date_time) = CURDATE() AND DRN = ?";
  // console.log(CURDATE());
  return new Promise((resolve, reject) => {
    db.query(getVoltageAndCurrentQuery, [DRN],(err, current , voltage) => {
      if (err) {
        reject(err);  
        console.error('Error querying the database:', err);}
      else resolve(current , voltage);
      // console.log(current,voltage);
    });
  });
};



////////

exports.calculateDRNVoltageAndCurrent = (readings) => {
  if (!readings || !Array.isArray(readings) || readings.length === 0) {
    return new Error("Invalid or empty readings data");
  }

  // Initialize separate accumulators for voltage and current
  const result = readings.reduce((acc, record) => {
    const voltage = Number(record.voltage) || 0;
    const current = Number(record.current) || 0;
   
    // Accumulate voltage and current separately
    acc.totalVoltage = (acc.totalVoltage || 0) + voltage;
    acc.totalCurrent = (acc.totalCurrent || 0) + current;

    // Count the number of readings
    acc.count = (acc.count || 0) + 1;

    return acc;
  }, {});

  // Calculate the average voltage and current
  const averageVoltage = result.totalVoltage / result.count;
  const averageCurrent = result.totalCurrent / result.count;
  
  // Return the average values
  return {
    totalVoltage: averageVoltage,
    totalCurrent: parseFloat(averageCurrent.toFixed(2)) // Convert to float and round to 2 decimal places
  };
};


////


exports.getDailyMeterEnergyByDRN = (DRN) => {
  const getMetaData = `
    SELECT 
      (MAX(CAST(units AS DECIMAL(10, 2))) - MIN(CAST(units AS DECIMAL(10, 2)))) AS power_consumption
    FROM 
      MeterCumulativeEnergyUsage
    WHERE 
      DRN = ? AND 
      DATE(date_time) = CURDATE()
  `;

  return new Promise((resolve, reject) => {
    db.query(getMetaData, [DRN], (err, power_consumption) => {
      if (err) {
        reject(err);  
        console.error('Error querying the database:', err);}
      else resolve(power_consumption);
      
    });
  });
};


exports.getDRNStartDate = (DRN) => {
  const getStartDate = "SELECT MIN(date_time) AS startDate FROM MeteringPower WHERE DRN = ?";
  
  return new Promise((resolve, reject) => {
    db.query(getStartDate, [DRN],(err, startDateResult) => {
      if (err) reject(err);
      
      else resolve(startDateResult);
      
    
   
    });
  });
};

///-------------------------------------GetAllProcessedTokensByDRN-----------------------------//
exports.getAllProcessedTokens =(DRN) =>{
  const getAllProcessedTokens = "SELECT token_id ,date_time ,token_amount FROM STSTokesInfo WHERE DRN  = ? AND display_msg = 'Accept' ";
  return new Promise((resolve ,reject) =>{
    db.query(getAllProcessedTokens, [DRN],(err,processedTokens)=>{
      if (err) {
        reject(err);  
        console.error('Error querying the database:', err);}
      else resolve(processedTokens);
      // console.log(processedTokens);

    });
  });
};


//-------------------------------------Inserting New Transformer --------------------------------//
exports.insertIntoTransformerRealInfo = (TransformerData) => {
  const transformerRealInfoData = {
    DRN:TransformerData.DRN,
    LocationName:TransformerData.LocationName,
    Name:TransformerData.Name,
    Type:TransformerData.Type,
    pLat:TransformerData.pLat,
    pLng:TransformerData.pLng,
    Status:TransformerData.Status,
    PowerSupply:TransformerData.PowerSupply,
    powerRating:TransformerData.powerRating,
    city:TransformerData.City
  };
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO TransformerInformation SET ?', transformerRealInfoData, (err) => {
      if (err) {
        reject(err);  
        console.error('Error querying the database:', err);}
      else resolve();
    });
    
  });
};


// Grid Topology

// Function to get active power
exports.getGridTopologyActivePower = (meterDRN) => {
  // console.log(meterDRN);
  return new Promise((resolve, reject) => {
    const getActiveEnergy = `SELECT apparent_power FROM MeteringPower WHERE DATE(date_time) = CURDATE() AND DRN = ? ORDER BY date_time DESC LIMIT 1
  `;

    db.query(getActiveEnergy, [meterDRN], (err, results) => {
      if (err) {
        reject(err);  
        console.error('Error querying the database:', err);}
         else {
        // Convert active energy to numerical type
        const numericActiveEnergy = results.map(result => parseFloat(result.apparent_power / 1000)) ;
        resolve(numericActiveEnergy[0]); // Assuming there's only one result per meter DRN
      }
    });
  });
};

// Function to fetch DRNs
exports.fetchDRNs = async (city) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT TI.LocationName, TI.Name AS TransformerName, MLIT.DRN AS MeterDRN
      FROM TransformerInformation TI
      LEFT JOIN MeterLocationInfoTable MLIT ON TI.DRN = MLIT.PowerSupply
      WHERE TI.city = ?
    `;
    db.query(query, [city], async (error, results) => {
      if (error) {
        reject(err);  
        console.error('Error querying the database:', error);} else {
        try {
          const data = {};
          for (const row of results) {
            const locationName = row.LocationName;
            const transformerName = row.TransformerName;
            const meterDRN = row.MeterDRN;
            
            // Initialize active energy to 0
            if (!data.hasOwnProperty(locationName)) {
              data[locationName] = { transformers: {}, active_energy: 0 };
            }
            if (!data[locationName].transformers.hasOwnProperty(transformerName)) {
              data[locationName].transformers[transformerName] = { meters: [], active_energy: 0 };
            }
            
            if (meterDRN) {
              let activeEnergy = await exports.getGridTopologyActivePower(meterDRN);
              activeEnergy = isNaN(activeEnergy) ? 0 : activeEnergy; // Treat NaN as 0
              
              // Update active energy for meters, transformers, and location
              const meterData = { DRN: meterDRN, active_energy: activeEnergy };
              data[locationName].transformers[transformerName].meters.push(meterData);
              data[locationName].transformers[transformerName].active_energy += activeEnergy;
              data[locationName].active_energy += activeEnergy;
            }
          }
          resolve(data);
        } catch (err) {
          reject(err);
        }
      }
    });
  });
};


//-----------------------------------------All time periods -------------------------------------------------------------------//
exports.getEnergyData = () => {
  const getCurrentDayData = `
    SELECT 
      DATE(t.date_time) as date, 
      SUM(t.final_units - t.initial_units) as total_energy
    FROM (
      SELECT 
        DRN, 
        date_time, 
        MIN(CAST(units AS DECIMAL(10, 2))) as initial_units,
        MAX(CAST(units AS DECIMAL(10, 2))) as final_units
      FROM 
        MeterCumulativeEnergyUsage
      WHERE 
        DATE(date_time) = CURDATE()
      GROUP BY 
        DRN, 
        DATE(date_time)
    ) t
  `;

  const getCurrentMonthData = `
    SELECT 
      SUM(t.final_units - t.initial_units) as total_energy
    FROM (
      SELECT 
        DRN, 
        DATE(date_time) as date, 
        MIN(CAST(units AS DECIMAL(10, 2))) as initial_units,
        MAX(CAST(units AS DECIMAL(10, 2))) as final_units
      FROM 
        MeterCumulativeEnergyUsage
      WHERE 
        YEAR(date_time) = YEAR(CURDATE()) AND 
        MONTH(date_time) = MONTH(CURDATE())
      GROUP BY 
        DRN, 
        DATE(date_time)
    ) t
  `;

  const getCurrentYearData = `
    SELECT 
      SUM(Daily_power_consumption) as total_energy
    FROM 
      DailyPowerConsumption
    WHERE 
      YEAR(date) = YEAR(CURDATE())
  `;

  return new Promise((resolve, reject) => {
    db.query(getCurrentDayData, (err, currentDayData) => {
      if (err) {
        reject(err);  
        console.error('Error querying the database:', err);}
      else {
        const dayEnergy = currentDayData.length > 0 ? parseFloat(currentDayData[0].total_energy || 0) : 0;

        db.query(getCurrentMonthData, (err, currentMonthData) => {
          if (err) {
            reject(err);  
            console.error('Error querying the database:', err);}
          else {
            const monthEnergy = currentMonthData.length > 0 ? parseFloat(currentMonthData[0].total_energy || 0) : 0;

            db.query(getCurrentYearData, (err, currentYearData) => {
              if (err) {
                reject(err);  
                console.error('Error querying the database:', err);}
              else {
                const yearEnergy = currentYearData.length > 0 ? parseFloat(currentYearData[0].total_energy || 0) : 0;

                resolve({ day: dayEnergy, month: monthEnergy, year: yearEnergy });
              }
            });
          }
        });
      }
    });
  });
};


//----------------------------------------CurrentAnd Last year energy for all the months---------------------------------------//
exports.getMonthlyDataForCurrentAndLastYear = () => {
  const getMonthlyDataForCurrentAndLastYear = `
  SELECT 
    YEAR(date) AS year,
    MONTH(date) AS month,
    SUM(ABS(daily_power_consumption)) AS total_apparent_power
FROM 
    DailyPowerConsumption
WHERE 
    YEAR(date) IN (YEAR(CURDATE()), YEAR(CURDATE()) - 1)
GROUP BY 
    YEAR(date), MONTH(date)
ORDER BY 
    YEAR(date), MONTH(date)


  `;
  return new Promise((resolve, reject) => {
    db.query(getMonthlyDataForCurrentAndLastYear,
       (err, monthlyData) => {
      if (err) {
        console.error('Error querying the database:', err);
        reject(err);
      }
      else resolve(monthlyData);
    });
  });
};


//----------------------------------------CurrentAndLastWeek With the day starting on Monday --------------------------------------------------------------//
exports.getWeeklyDataForCurrentAndLastWeek = () => {
  const getWeeklyDataForCurrentAndLastWeek = `
  SELECT 
  YEAR(record_date) as year,
  WEEK(record_date, 1) as week,
  DAYNAME(record_date) as day,
  record_date as date,
  SUM(ABS(final_units - initial_units)) as total_apparent_power
FROM (
  SELECT 
    DRN,
    DATE(date_time) as record_date,
    MIN(units) as initial_units,
    MAX(units) as final_units
  FROM 
    MeterCumulativeEnergyUsage
  WHERE 
    WEEK(date_time, 1) IN (WEEK(CURRENT_DATE(), 1), WEEK(CURRENT_DATE(), 1) - 1)
    AND YEAR(date_time) IN (YEAR(CURRENT_DATE()), YEAR(CURRENT_DATE()) - 1)
  GROUP BY 
    DRN, 
    DATE(date_time)
) t
GROUP BY 
  YEAR(record_date),
  WEEK(record_date, 1),
  DAYNAME(record_date),
  record_date


  `;
  return new Promise((resolve, reject) => {
    db.query(getWeeklyDataForCurrentAndLastWeek,
       (err, weeklyData) => {
      if (err) {
        console.error('Error querying the database:', err);
        reject(err);
      }
      else resolve(weeklyData);
    });
  });
};



//Get hourly power consumption
exports.getApparentPowerSum = function(callback) {
  const query = `
      SELECT HOUR(date_time) as hour, SUM(apparent_power) as sum
      FROM (
          SELECT DRN, apparent_power, date_time, ROW_NUMBER() OVER (PARTITION BY DRN, HOUR(date_time) ORDER BY date_time DESC) as rn
          FROM MeteringPower
          WHERE DATE(date_time) = CURDATE()
      ) t
      WHERE t.rn = 1
      GROUP BY hour
  `;
  
  db.query(query, (err, results) => {
      if (err) {
          console.log('Error querying the database:', err);
          return callback({ error: 'Database query failed', details: err });
      }

      // Initialize sums to 0 for each hour
      const sums = new Array(24).fill(0);

      results.forEach(row => {
          // Calculate the sum divided by 1000 and round to two decimal places
          const sum = (row.sum / 1000).toFixed(2);
          // Assign the rounded sum to the corresponding hour in the sums array
          sums[row.hour] = parseFloat(sum);
      });

      // Pass the sums array to the callback function
      callback(null, { sums });
  });
}



//Current hour avarage voltage and current totals
exports.getAverageCurrentAndVoltage = function(callback) {
  const query = `
      SELECT AVG(current) as avg_current, AVG(voltage) as avg_voltage
      FROM (
          SELECT DRN, current, voltage, date_time, ROW_NUMBER() OVER (PARTITION BY DRN ORDER BY date_time DESC) as rn
          FROM MeteringPower
          WHERE DATE(date_time) = CURDATE() AND HOUR(date_time) = HOUR(NOW())
      ) t
      WHERE t.rn = 1
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.log('Error Querying the database:', err);
          return callback({ error: 'Database query failed', details: err });
      }

  if (results.length === 0) {
          console.log('No data found');
          return callback(null, { avg_current: 0, avg_voltage: 0 });
      }

      const avg_current = results[0].avg_current;
      const avg_voltage = results[0].avg_voltage;
      callback(null, { avg_current, avg_voltage });
  });
}



//Hourly energy
exports.getSumApparentPower = function(callback) {
  const query = `
      SELECT SUM(apparent_power) as sum
      FROM (
          SELECT DRN, apparent_power, date_time, ROW_NUMBER() OVER (PARTITION BY DRN ORDER BY date_time DESC) as rn
          FROM MeteringPower
          WHERE DATE(date_time) = CURDATE() AND HOUR(date_time) = HOUR(NOW())
      ) t
      WHERE t.rn = 1
  `;
  db.query(query, (err, results) => {
      if (err) {
          console.log('Error Querying the database:', err);
          return callback({ error: 'Database query failed', details: err });
      }

      if (results === 0){
        console.log('No data found');
        return callback(null, {sum: 0});
      }

     
      

      // Calculate the sum divided by 1000 and round to two decimal places
        const sum = (results[0].sum / 1000).toFixed(2);
      callback(0, { sum });
  });
}

//Suburb Apparent Power Time Periods
exports.getApparentPowerByTimePeriodsBySuburb = function(suburbs, callback) {
  const query = `
    SELECT 
      COALESCE(SUM(IF(DATE(record_date) = CURDATE(), final_units - initial_units, 0)), 0) as currentDayTotal,
      COALESCE(SUM(IF(MONTH(record_date) = MONTH(CURDATE()) AND YEAR(record_date) = YEAR(CURDATE()), final_units - initial_units, 0)), 0) as currentMonthTotal,
      COALESCE(SUM(IF(YEAR(record_date) = YEAR(CURDATE()), final_units - initial_units, 0)), 0) as currentYearTotal
    FROM (
      SELECT 
        DRN,
        DATE(date_time) as record_date,
        MIN(CAST(units AS DECIMAL)) as initial_units,
        MAX(CAST(units AS DECIMAL)) as final_units
      FROM 
        MeterCumulativeEnergyUsage
      WHERE 
        YEAR(date_time) IN (YEAR(CURDATE()), YEAR(CURDATE()) - 1)
      GROUP BY 
        DRN, 
        DATE(date_time)
    ) t
    WHERE t.DRN IN (
        SELECT DRN
        FROM MeterLocationInfoTable
        WHERE Suburb IN (?)
    )
  `;

  db.query(query, [suburbs], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    const { currentDayTotal, currentMonthTotal, currentYearTotal } = results[0];

    callback(null, {
      currentDayTotal: currentDayTotal || 0,
      currentMonthTotal: currentMonthTotal || 0,
      currentYearTotal: currentYearTotal || 0
    });
  });
}



//Weekly Suburb Apparent Power
exports.getWeeklyApparentPowerBySuburb = function(suburbs, callback) {
  console.log(suburbs);

  const query = `
    SELECT 
      CASE WHEN DAYOFWEEK(t.record_date) = 1 THEN 7 ELSE DAYOFWEEK(t.record_date) - 1 END AS dayOfWeek,
      SUM(IF(WEEK(t.record_date, 1) = WEEK(CURDATE(), 1), t.daily_power_consumption, 0)) AS currentWeekTotal,
      SUM(IF(WEEK(t.record_date, 1) = WEEK(CURDATE(), 1) - 1 AND YEAR(t.record_date) = YEAR(CURDATE()), t.daily_power_consumption, 0)) AS lastWeekTotal
    FROM (
      SELECT 
        record_date,
        SUM(final_units) - SUM(initial_units) AS daily_power_consumption
      FROM (
        SELECT 
          DRN,
          DATE(date_time) AS record_date,
          MIN(CAST(units AS DECIMAL(10, 2))) AS initial_units,
          MAX(CAST(units AS DECIMAL(10, 2))) AS final_units
        FROM 
          MeterCumulativeEnergyUsage
        WHERE 
          DRN IN (
            SELECT 
              DISTINCT DRN
            FROM 
              MeterLocationInfoTable
            WHERE 
              Suburb IN (?)
          )
        GROUP BY 
          DRN, 
          DATE(date_time)
      ) AS t
      GROUP BY 
        record_date
    ) t
    WHERE WEEK(t.record_date, 1) IN (WEEK(CURDATE(), 1), WEEK(CURDATE(), 1) - 1)
    GROUP BY 
      dayOfWeek
    ORDER BY 
      dayOfWeek;
  `;

  db.query(query, [suburbs], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    // Initialize arrays for current and last week apparent power
    let currentWeekTotal = Array(7).fill(0);
    let lastWeekTotal = Array(7).fill(0);

    // Fill the arrays with the query results
    results.forEach(result => {
      // Adjust dayOfWeek to start from 0 (Monday) instead of 1 (Sunday)
      let dayOfWeek = result.dayOfWeek - 1; // Adjust to 0-based index
      currentWeekTotal[dayOfWeek] = result.currentWeekTotal;
      lastWeekTotal[dayOfWeek] = result.lastWeekTotal;
    });
    

    callback(null, { currentWeekTotal, lastWeekTotal });
  });
};


//Yearly Suburb Apparent Power
exports.getYearlyApparentPowerBySuburb = function(suburbs, callback) {
  
  const query = `
  SELECT 
  MONTH(t.record_date) as month,
  SUM(IF(YEAR(t.record_date) = YEAR(CURDATE()), t.monthly_power_consumption, 0)) as currentYearPowerConsumption,
  SUM(IF(YEAR(t.record_date) = YEAR(CURDATE()) - 1, t.monthly_power_consumption, 0)) as lastYearPowerConsumption
FROM (
  SELECT 
    record_date,
    SUM(final_units) - SUM(initial_units) AS monthly_power_consumption
  FROM (
    SELECT 
      DRN,
      DATE(date_time) AS record_date,
      MIN(CAST(units AS DECIMAL(10, 2))) AS initial_units,
      MAX(CAST(units AS DECIMAL(10, 2))) AS final_units
    FROM 
      MeterCumulativeEnergyUsage
    WHERE 
      DRN IN (
        SELECT 
          DISTINCT DRN
        FROM 
          MeterLocationInfoTable
        WHERE 
        Suburb = ?
      )
    GROUP BY 
      DRN, 
      MONTH(record_date), 
      YEAR(record_date)
  ) AS t
  GROUP BY 
    record_date
) t
WHERE YEAR(t.record_date) IN (YEAR(CURDATE()), YEAR(CURDATE()) - 1)
GROUP BY 
  MONTH(t.record_date)
ORDER BY 
  MONTH(t.record_date)


  `;

  db.query(query, [suburbs], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    // Initialize arrays for current and last year apparent power
    let currentYearPowerConsumption = Array(12).fill(0);
    let lastYearPowerConsumption = Array(12).fill(0);

    // Fill the arrays with the query results
    results.forEach(result => {
      // MySQL's MONTH function returns 1 for January, 2 for February, ..., 12 for December
      let month = result.month - 1; // Adjust it to make January be 0, February be 1, ..., December be 11
      currentYearPowerConsumption[month] = result.currentYearPowerConsumption ;
      lastYearPowerConsumption[month] = result.lastYearPowerConsumption ;
    });

    callback(null, { currentYearPowerConsumption, lastYearPowerConsumption });
  });
}

//---------------------------------------------------SystemProccessedTokens -----------------------------------//
exports.getAllSystemProcessedTokens = () => {
  const getAllProcessedTokens = "SELECT token_id, date_time, token_amount FROM STSTokesInfo WHERE display_msg = 'Accept'";
  return new Promise((resolve, reject) => {
    db.query(getAllProcessedTokens, (err, processedTokens) => {
      if (err) {
        console.error('Error querying the database:', err);
        reject(err);
      }
      else resolve(processedTokens);
    });
  });
};


///-------------------------------------------------ScarterPlot-----------------------------------------------//



exports.calculateEnergyStats = (callback) => {
    const query = `
        SELECT 
            DRN,
            ROUND(AVG(final_units - initial_units), 2) AS Mean,
            ROUND(STDDEV(final_units - initial_units), 2) AS Standard_Deviation
        FROM (
            SELECT 
                DRN, 
                date_time, 
                MIN(CAST(units AS DECIMAL(10, 2))) AS initial_units,
                MAX(CAST(units AS DECIMAL(10, 2))) AS final_units
            FROM MeterCumulativeEnergyUsage
            GROUP BY 
                DRN, 
                DATE(date_time)
        ) t
        GROUP BY DRN;
    `;

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            callback(error, null);
        } else {
            callback(null, results);
        }
    });
}


