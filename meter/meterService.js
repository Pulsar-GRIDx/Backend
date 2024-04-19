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
        resolve({ totalMeters: 0 }); // Resolve the promise with 0 if no results
      } else {
        resolve(results[0]); // Resolve the promise with the first result
      }
    });
  });
};


///-------------------------------------Active Inactive meters-----------------------------------------------------///
exports.getAllActiveAndInactiveMeters = function(callback) {
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
      console.log('Error Querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    if (results.length === 0) {
      console.log('No data found',err );
      return callback({ error: 'No data found', details: err });
    }

    // Count occurrences of '0' and '1' in the 'state' column
    const inactiveMetersCount = results.filter(row => row.mains_state === '0').length;
    const activeMetersCount = results.filter(row => row.mains_state === '1').length;

    callback(null,{ inactiveMeters: inactiveMetersCount, activeMeters: activeMetersCount });
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
  const totalCurrent = result.totalCurrent / result.count;

  return {
    totalVoltage,
    totalCurrent,
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
    SELECT DRN, apparent_power
    FROM (
      SELECT DRN, apparent_power, ROW_NUMBER() OVER (PARTITION BY DRN ORDER BY date_time DESC) as rn
      FROM MeteringPower
      WHERE DATE(date_time) = CURDATE() AND HOUR(date_time) = HOUR(NOW())
    ) t
    WHERE t.rn = 1
  `;
  
  return new Promise((resolve, reject) => {
    db.query(getCurrentDayData, (err, currentDayData) => {
      if (err) reject(err);
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
      if (err) reject(err);
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
      if (err) reject(err);
      else resolve();
    });
    
  });
};



//------------------------------------------------------totalEnergyPerSuberb--------------------------------------------------------//
exports.getDrnsBySuburb = (suburbs) => {
  const getDrnsBySuburb = 'SELECT DRN FROM MeterLocations WHERE Suburb = ?';
  return new Promise((resolve, reject) => {
    db.query(getDrnsBySuburb, [suburbs], (err, DRN) => {
      if (err) reject(err);
      else resolve(DRN.map(record => record.DRN));
     
    });
  });
};

exports.getEnergyByDrn = (suburb, drn) => {
  const getEnergyByDrn = 'SELECT apparent_power FROM MeterEnergyUsageSummary WHERE DRN = ? AND DATE(date_time) = DATE(NOW()) ORDER BY date_time DESC LIMIT 1';
  return new Promise((resolve, reject) => {
    db.query(getEnergyByDrn, [drn], (err, energyData) => {
      if (err) reject(err);
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
    SELECT DATE(date_time) as date, SUM(apparent_power) as total_apparent_power
    FROM MeteringPower
    WHERE
        WEEKDAY(date_time) BETWEEN 0 AND 6 AND
        WEEK(date_time, 1) = WEEK(CURDATE(), 1) AND
        DRN = ?
    GROUP BY date
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

exports.getLastWeekData = (DRN) => {
  const query = `
    SELECT DATE(date_time) as date, SUM(apparent_power) as total_apparent_power
    FROM MeteringPower
    WHERE
        WEEKDAY(date_time) BETWEEN 0 AND 6 AND
        WEEK(date_time, 1) = WEEK(CURDATE(), 1) - 1 AND
        DRN = ?
    GROUP BY date
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



exports.getCurrentMonthData = (DRN) => {
  const query = `
    SELECT DATE(date_time) as date, SUM(apparent_power) as total_apparent_power
    FROM MeteringPower
    WHERE
        YEAR(date_time) = YEAR(CURDATE()) AND MONTH(date_time) = MONTH(CURDATE())
        AND DRN = ?
    GROUP BY date
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

exports.getLastMonthData = (DRN) => {
  const query = `
    SELECT DATE(date_time) as date, SUM(apparent_power) as total_apparent_power
    FROM MeteringPower
    WHERE
        YEAR(date_time) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(date_time) = MONTH(CURDATE() - INTERVAL 1 MONTH)
        AND DRN = ?
    GROUP BY date
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



exports.CalculateDrnData = (allData) => {
  return allData.reduce((acc, record) => {
    const date = record.date.toISOString().split('T')[0];
    const energy = Number(record.total_apparent_power) / 1000 ;
    acc[date] = (acc[date] || 0) + energy;
    return acc;
  }, {});
};




exports.getDRNVoltageAndCurrent = (DRN) => {
  const getVoltageAndCurrentQuery = "SELECT voltage, current, DATE(date_time) as date_time FROM MeteringPower WHERE DATE(date_time) = CURDATE() AND DRN = ?";
  // console.log(CURDATE());
  return new Promise((resolve, reject) => {
    db.query(getVoltageAndCurrentQuery, [DRN],(err, current , voltage) => {
      if (err) reject(err);
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

  // Calculate the average voltage
  const totalVoltage = result.totalVoltage / result.count;
  const totalCurrent = result.totalCurrent / result.count;
  return {
    totalVoltage,
    totalCurrent,
  };
};

////


exports.getDailyMeterEnergy  = (DRN) => {
  const getMetaData = "SELECT apparent_power FROM MeteringPower WHERE DATE(date_time) = CURDATE() AND DRN = ? ORDER BY date_time DESC LIMIT 1";
 return new Promise ((resolve ,reject) =>{
  db.query(getMetaData ,[DRN],(err,meterData) => {
    if (err) reject(err);
    else resolve(meterData) / 1000;
    
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
      if(err) reject(err);
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
      if (err) reject(err);
      else resolve();
    });
    
  });
};


// Grid Topology

// Function to get active power
exports.getGridTopologyActivePower = (meterDRN) => {
  return new Promise((resolve, reject) => {
    const getActiveEnergy = 'SELECT apparent_power FROM MeteringPower WHERE DATE(date_time) = CURDATE() AND DRN = ? ORDER BY date_time DESC LIMIT 1';

    db.query(getActiveEnergy, [meterDRN], (err, results) => {
      if (err) {
        reject(err);
      } else {
        // Convert active energy to numerical type
        const numericActiveEnergy = results.map(result => parseFloat(result.apparent_power));
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
        reject(error);
      } else {
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
  const getCurrentDayData =`
  SELECT SUM(COALESCE(apparent_power, 0)) as total_apparent_power
FROM (
  SELECT apparent_power, ROW_NUMBER() OVER (PARTITION BY DRN ORDER BY date_time DESC) as rn
  FROM MeteringPower
  WHERE DATE(date_time) = CURDATE()
) t
WHERE t.rn = 1
`;
  
  const getCurrentMonthData = `SELECT 
  SUM(t.apparent_power) / 1000 as total_apparent_power
FROM (
  SELECT m.DRN, DATE(m.date_time) as date, m.apparent_power
  FROM MeteringPower m
  INNER JOIN (
    SELECT DRN, DATE(date_time) as date, MAX(date_time) as maxDateTime
    FROM MeteringPower
    WHERE YEAR(date_time) = YEAR(CURRENT_DATE()) AND MONTH(date_time) = MONTH(CURRENT_DATE())
    GROUP BY DRN, DATE(date_time)
  ) sub_m ON m.DRN = sub_m.DRN AND m.date_time = sub_m.maxDateTime
) t
`;
  const getCurrentYearData = `SELECT 
  YEAR(t.date_time) as year,
  MONTH(t.date_time) as month,
  SUM(t.apparent_power) / 1000 as monthly_total_apparent_power,
  SUM(SUM(t.apparent_power)) OVER (PARTITION BY YEAR(t.date_time)) / 1000 as total_apparent_power
FROM (
  SELECT m.DRN, m.date_time, m.apparent_power
  FROM MeteringPower m
  INNER JOIN (
    SELECT DRN, DATE(date_time) as date, MAX(date_time) as maxDateTime
    FROM MeteringPower
    WHERE YEAR(date_time) = YEAR(CURRENT_DATE())
    GROUP BY DRN, DATE(date_time)
  ) sub_m ON m.DRN = sub_m.DRN AND m.date_time = sub_m.maxDateTime
) t
GROUP BY YEAR(t.date_time), MONTH(t.date_time)
ORDER BY YEAR(t.date_time), MONTH(t.date_time);


`;

  return new Promise((resolve, reject) => {
    db.query(getCurrentDayData, (err, currentDayData) => {
      if (err) reject(err);
      else {
        db.query(getCurrentMonthData, (err, currentMonthData) => {
          if (err) reject(err);
          else {
            db.query(getCurrentYearData, (err, currentYearData) => {
              if (err) reject(err);
              else {
                resolve({
                  day: currentDayData[0].total_apparent_power / 1000,
                  month: currentMonthData[0].total_apparent_power,
                  year: currentYearData[0].total_apparent_power
                });
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
  YEAR(t.date_time) as year,
  MONTH(t.date_time) as month,
  SUM(t.apparent_power) as total_apparent_power
FROM (
  SELECT m.DRN, m.date_time, m.apparent_power
  FROM MeteringPower m
  INNER JOIN (
    SELECT DRN, DATE(date_time) as date, MAX(date_time) as maxDateTime
    FROM MeteringPower
    WHERE YEAR(date_time) IN (YEAR(CURRENT_DATE()), YEAR(CURRENT_DATE()) - 1)
    GROUP BY DRN, DATE(date_time)
  ) sub_m ON m.DRN = sub_m.DRN AND m.date_time = sub_m.maxDateTime
) t
GROUP BY 
  YEAR(t.date_time),
  MONTH(t.date_time)

  `;
  return new Promise((resolve, reject) => {
    db.query(getMonthlyDataForCurrentAndLastYear,
       (err, monthlyData) => {
      if (err) reject(err);
      else resolve(monthlyData);
    });
  });
};

//----------------------------------------CurrentAndLastWeek With the day starting on Monday --------------------------------------------------------------//
exports.getWeeklyDataForCurrentAndLastWeek = () => {
  const getWeeklyDataForCurrentAndLastWeek = `
    SELECT 
      YEAR(date_time) as year,
      WEEK(date_time, 1) as week,
      DAYNAME(date_time) as day,
      DATE(date_time) as date,
      SUM(last_apparent_power) as total_apparent_power
    FROM (
      SELECT 
        date_time,
        DRN,
        apparent_power as last_apparent_power,
        ROW_NUMBER() OVER (PARTITION BY DATE(date_time), DRN ORDER BY date_time DESC) as rn
      FROM 
        MeteringPower 
      WHERE 
        WEEK(date_time, 1) IN (WEEK(CURRENT_DATE(), 1), WEEK(CURRENT_DATE(), 1) - 1)
    ) t
    WHERE t.rn = 1
    GROUP BY 
      YEAR(t.date_time),
      WEEK(t.date_time, 1),
      DAYNAME(t.date_time),
      DATE(t.date_time)
  `;
  return new Promise((resolve, reject) => {
    db.query(getWeeklyDataForCurrentAndLastWeek,
       (err, weeklyData) => {
      if (err) reject(err);
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
          console.log('Error Querying the database:', err);
          return callback({ error: 'Database query failed', details: err });
      }

      // Initialize sums to 0 for each hour
      const sums = new Array(24).fill(0);

      results.forEach(row => {
          sums[row.hour] = row.sum / 1000;
      });
      callback(null,{sums} );
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

     
      

      const sum = results[0].sum / 1000;
      callback(0, { sum });
  });
}

//Suburb Apparent Power Time Periods
exports.getApparentPowerByTimePeriodsBySuburb = function(suburbs, callback) {
  console.log(suburbs);
  const query = `
  SELECT 
    SUM(IF(DATE(t.date_time) = CURDATE(), CAST(t.apparent_power AS DECIMAL), 0)) / 1000 as currentDayApparentPower,
    SUM(IF(MONTH(t.date_time) = MONTH(CURDATE()) AND YEAR(t.date_time) = YEAR(CURDATE()), CAST(t.apparent_power AS DECIMAL), 0)) / 1000 as currentMonthApparentPower,
    SUM(IF(YEAR(t.date_time) = YEAR(CURDATE()), CAST(t.apparent_power AS DECIMAL), 0)) / 1000 as currentYearApparentPower
FROM (
    SELECT m.DRN, m.date_time, m.apparent_power
    FROM MeteringPower m
    INNER JOIN (
      SELECT DRN, DATE(date_time) as date, MAX(date_time) as maxDateTime
      FROM MeteringPower
      WHERE YEAR(date_time) = YEAR(CURDATE())
      GROUP BY DRN, DATE(date_time)
    ) sub_m ON m.DRN = sub_m.DRN AND m.date_time = sub_m.maxDateTime
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

    if (results.length === 0) {
      return callback(null, { currentDayApparentPower: 0, currentMonthApparentPower: 0, currentYearApparentPower: 0 });
    }

    callback(null, results[0]);
  });
}


//Weekly Suburb Apparent Power
exports.getWeeklyApparentPowerBySuburb = function(suburbs, callback) {
  const query = `
  SELECT 
  DAYOFWEEK(t.date_time) as dayOfWeek,
  SUM(IF(WEEK(t.date_time, 1) = WEEK(CURDATE(), 1), t.apparent_power, 0)) as currentWeekApparentPower,
  SUM(IF(WEEK(t.date_time, 1) = WEEK(CURDATE(), 1) - 1 AND YEAR(t.date_time) = YEAR(CURDATE()), t.apparent_power, 0)) as lastWeekApparentPower
FROM (
  SELECT 
    DRN, 
    date_time, 
    apparent_power
  FROM 
    MeteringPower
  WHERE 
    (DRN, date_time) IN (
      SELECT 
        DRN, 
        MAX(date_time)
      FROM 
        MeteringPower
      WHERE 
        DRN IN (
          SELECT 
            DRN
          FROM 
            MeterLocationInfoTable
          WHERE 
            Suburb IN (?)
        )
      GROUP BY 
        DRN, 
        DAYOFWEEK(date_time)
    )
) t
GROUP BY 
  DAYOFWEEK(t.date_time)
ORDER BY 
  DAYOFWEEK(t.date_time)

  `;

  db.query(query, [suburbs], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    // Initialize arrays for current and last week apparent power
    let currentWeekApparentPower = Array(7).fill(0);
    let lastWeekApparentPower = Array(7).fill(0);

    // Fill the arrays with the query results
    results.forEach(result => {
      let dayOfWeek = (result.dayOfWeek + 5) % 7;
      currentWeekApparentPower[dayOfWeek] = result.currentWeekApparentPower / 1000;
      lastWeekApparentPower[dayOfWeek] = result.lastWeekApparentPower / 1000;
    });

    callback(null, { currentWeekApparentPower , lastWeekApparentPower });
  });
}

//Yearly Suburb Apparent Power
exports.getYearlyApparentPowerBySuburb = function(suburbs, callback) {
  const query = `
  SELECT 
  MONTH(t.date_time) as month,
  SUM(IF(YEAR(t.date_time) = YEAR(CURDATE()), t.apparent_power, 0)) / 1000 as currentYearApparentPower,
  SUM(IF(YEAR(t.date_time) = YEAR(CURDATE()) - 1, t.apparent_power, 0)) / 1000 as lastYearApparentPower
FROM (
  SELECT m.DRN, m.date_time, m.apparent_power
  FROM MeteringPower m
  INNER JOIN (
    SELECT DRN, DATE(date_time) as date, MAX(date_time) as maxDateTime
    FROM MeteringPower
    WHERE YEAR(date_time) IN (YEAR(CURDATE()), YEAR(CURDATE()) - 1)
    GROUP BY DRN, MONTH(date_time), YEAR(date_time)
  ) sub_m ON m.DRN = sub_m.DRN AND m.date_time = sub_m.maxDateTime
) t
WHERE t.DRN IN (
  SELECT DRN
  FROM MeterLocationInfoTable
  WHERE Suburb IN (?)
)
GROUP BY MONTH(t.date_time), YEAR(t.date_time)
ORDER BY YEAR(t.date_time), MONTH(t.date_time);

  `;

  db.query(query, [suburbs], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    // Initialize arrays for current and last year apparent power
    let currentYearApparentPower = Array(12).fill(0);
    let lastYearApparentPower = Array(12).fill(0);

    // Fill the arrays with the query results
    results.forEach(result => {
      // MySQL's MONTH function returns 1 for January, 2 for February, ..., 12 for December
      let month = result.month - 1; // Adjust it to make January be 0, February be 1, ..., December be 11
      currentYearApparentPower[month] = result.currentYearApparentPower ;
      lastYearApparentPower[month] = result.lastYearApparentPower ;
    });

    callback(null, { currentYearApparentPower, lastYearApparentPower });
  });
}

