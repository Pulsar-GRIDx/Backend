const db = require('../config/db');



///-------------------------------------Active Inactive meters-----------------------------------------------------///
exports.getAllActiveAndInactiveMeters = function(callback) {
  const getAllActiveAndInactiveMeters = 'SELECT mains_state FROM MeterLoadControl WHERE DATE(date_time) = CURDATE() ORDER BY date_time DESC LIMIT 1';

  db.query(getAllActiveAndInactiveMeters, (err, results) => {
    if (err) {
      console.log('Error Querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    if (results.length === 0) {
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
exports.getCurrentData = (currentDate) => {
  const getCurrentData = "SELECT active_energy, DATE(date_time) as date_time FROM MeterCumulativeEnergyUsage WHERE DATE(date_time) = CURDATE()";
  return new Promise((resolve, reject) => {
    db.query(getCurrentData, [currentDate],(err, currentData) => {
      if (err) reject(err);
      else resolve(currentData);
    });
  });
};

exports.getStartDate = () => {
  const getStartDate = "SELECT MIN(DATE(date_time)) as startDate FROM MeterCumulativeEnergyUsage";
  
  return new Promise((resolve, reject) => {
    db.query(getStartDate, (err, startDateResult) => {
      if (err) reject(err);
      
      else resolve(startDateResult);
   
    });
  });
};

exports.getPreviousData = (startDateResult) => {
  const getPreviousData = "SELECT active_energy, DATE(date_time) as date_time FROM MeterCumulativeEnergyUsage WHERE DATE(date_time) >= ?";
  return new Promise((resolve, reject) => {
    db.query(getPreviousData, [startDateResult[0].startDate], (err, allData) => {
      if (err) reject(err);
      else resolve(allData);
    });
  });
};

exports.calculateTotalss = (allData) => {
  return allData.reduce((acc, record) => {
    const date = record.date_time;
    const energy = Number(record.active_energy) / 1000;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += energy;
    return acc;
  }, {});
};


//-------------------------------------------------Current And last Week API-------------------------------------//
exports.getWeekMonthlyData = () => {
  const getCurrentWeek = () => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const days = Math.floor((today - firstDayOfYear) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
    return week;
  };
  
  // Function to get the current month
  const getCurrentMonth = () => {
    const today = new Date();
    return today.getMonth() + 1; // Months are zero-based, so add 1
  };
    const week = getCurrentWeek();
    const month = getCurrentMonth();
    console.log(week,month);
  
  const getWeeklyData = `
    SELECT active_energy, DATE(date_time) as date_time
    FROM MeterCumulativeEnergyUsage
    WHERE
      (date_time >= CURDATE() - INTERVAL (WEEKDAY(CURDATE()) + 7) DAY
      AND date_time < CURDATE() + INTERVAL 1 DAY)
      ${week === 'last' ? 'OR (date_time >= CURDATE() - INTERVAL WEEKDAY(CURDATE()) + 7 DAY AND date_time < CURDATE() - INTERVAL WEEKDAY(CURDATE()) - 1 DAY)' : ''}
      `;
  const getMonthData = `
      SELECT active_energy, DATE(date_time) as date_time
      FROM MeterCumulativeEnergyUsage
      WHERE
        (YEAR(date_time) = YEAR(CURRENT_DATE()) AND MONTH(date_time) = MONTH(CURRENT_DATE()))
        ${month === 'lastMonth' ? 'OR (YEAR(date_time) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND MONTH(date_time) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH))' : ''}
       `;

       return new Promise((resolve, reject) => {
        Promise.all([
          new Promise((resolve, reject) => {
            db.query(getWeeklyData, (err, weeklyData) => {
              if (err) {
                reject(err);
              } else {
                resolve(weeklyData);
              }
            });
          }),
          new Promise((resolve, reject) => {
            db.query(getMonthData, (err, monthlyData) => {
              if (err) {
                reject(err);
              } else {
                resolve(monthlyData);
              }
            });
          })
        ])
        .then(([weeklyData, monthlyData]) => resolve({weeklyData, monthlyData}))
        .catch(err => reject(err));
      });
    };



exports.calculateMonthWeekTotals = (allData) => {
  return allData.reduce((acc, record) => {
    const date = record.date_time.toISOString().split('T')[0];
    const energy = Number(record.active_energy) / 1000;
    acc[date] = (acc[date] || 0) + energy;
    return acc;
  }, {});
};



exports.getVoltageAndCurrent = () => {
  const getVoltageAndCurrentQuery = "SELECT voltage, current, DATE(date_time) as date_time FROM MeteringPower WHERE DATE(date_time) = CURDATE()";
  return new Promise((resolve, reject) => {
    db.query(getVoltageAndCurrentQuery, (err, current , voltage) => {
      if (err) reject(err);
      else resolve(current , voltage);
    });
  });
};

exports.calculateVoltageAndCurrent = (readings) => {
  if (!readings || !Array.isArray(readings) || readings.length === 0) {
    throw new Error("Invalid or empty readings data");
  }

  // Initialize separate accumulators for voltage and current
  const result = readings.reduce((acc, record) => {
    const voltage = Number(record.voltage) || 0;
    const current = Number(record.current) || 0;
   
    // Accumulate voltage and current separately
    acc.totalVoltage = (acc.totalVoltage || 0) + voltage;
    acc.totalCurrent = (acc.totalCurrent || 0) + current / 1000;
    

    return acc;
  }, {});

  return {
    totalVoltage: result.totalVoltage,
    totalCurrent: result.totalCurrent,

    
  };

};


//------------------------------------------------CurrentDayActiveEnergy----------------------------------------------------------------------//

exports.getCurrentDayData = () => {
  const getCurrentDayData = "SELECT active_energy FROM MeterCumulativeEnergyUsage WHERE DATE(date_time) = CURDATE()";
  return new Promise((resolve, reject) => {
    db.query(getCurrentDayData,
       (err, currentDayData) => {
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
    Suburb: data.Suburb,
    City: data.City,
    Streetname: data.Streetname,
    Housenumber: data.Housenumber,
    Simnumber: data.Simnumber,
    Usercategory: data.Usercategory,
  };
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO MeterRealInfo SET ?', meterRealInfoData, (err) => {
      if (err) reject(err);
      else resolve();
    });
    console.log(meterRealInfoData);
  });
};

exports.insertIntoAnotherTable = (data) => {
  const anotherTableData = {
    Longitude: data.Meterlng,
    Lat: data.Meterlat,
    pLng: data.Transformerlng,
    pLat: data.Transformerlat,
    PowerSupply: data.TransformerDRN,
  };
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO MeterLocationInfoTable SET ?', anotherTableData, (err) => {
      if (err) reject(err);
      else resolve();
    });
    console.log(anotherTableData);
  });
};

//------------------------------------------------------totalEnergyPerSuberb--------------------------------------------------------//
exports.getDrnsBySuburb = (suburbs) => {
  const getDrnsBySuburb = 'SELECT DRN FROM MeterLocations WHERE Suburb = ?';
  return new Promise((resolve, reject) => {
    db.query(getDrnsBySuburb, [suburbs], (err, DRN) => {
      if (err) reject(err);
      else resolve(DRN.map(record => record.DRN));
      console.log({DRN});
    });
  });
};

exports.getEnergyByDrn = (suburb, drn) => {
  const getEnergyByDrn = 'SELECT active_energy FROM MeterEnergyUsageSummary WHERE DRN = ? AND DATE(date_time) = DATE(NOW()) ORDER BY date_time DESC LIMIT 1';
  return new Promise((resolve, reject) => {
    db.query(getEnergyByDrn, [drn], (err, energyData) => {
      if (err) reject(err);
      else {
        console.log(`Query results for DRN ${drn} in suburb ${suburb}:`, energyData);
        if (energyData.length > 0) {
          console.log('active_energy:', energyData[0].active_energy);
        }
        resolve(energyData);
      }
    });
  });
};


//-------------------------------------------------------------GetSpecificMeterWeeklyAndMonthlyData------------------------------------------------//

exports.getMeterWeekMonthlyData = ( DRN) => {
  // Function to get the current week
const getCurrentWeek = () => {
  const today = new Date();
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const days = Math.floor((today - firstDayOfYear) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
  return week;
};

// Function to get the current month
const getCurrentMonth = () => {
  const today = new Date();
  return today.getMonth() + 1; 
};
  const week = getCurrentWeek();
  const month = getCurrentMonth();
  
  // ...

const getWeeklyData = `
SELECT active_energy, DATE(date_time) as date_time
FROM MeterCumulativeEnergyUsage
WHERE
  (date_time >= CURRENT_DATE() - INTERVAL (WEEKDAY(CURRENT_DATE()) + 7) DAY
  AND date_time < CURRENT_DATE() + INTERVAL 1 DAY)
  ${week === 'last' ? 'OR (date_time >= CURRENT_DATE() - INTERVAL (WEEKDAY(CURRENT_DATE()) + 14) DAY AND date_time < CURRENT_DATE() - INTERVAL (WEEKDAY(CURRENT_DATE()) + 7) DAY)' : ''}
   AND DRN =  ?`;

const getMonthData = `
SELECT active_energy, DATE(date_time) as date_time
FROM MeterCumulativeEnergyUsage
WHERE
  (YEAR(date_time) = YEAR(CURRENT_DATE()) AND MONTH(date_time) = MONTH(CURRENT_DATE()))
  ${month === 'lastMonth' ? 'OR (YEAR(date_time) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) AND MONTH(date_time) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH))' : ''}
  AND DRN =  ?`;

// ...


       return new Promise((resolve, reject) => {
        Promise.all([
          new Promise((resolve, reject) => {
            db.query(getWeeklyData, [DRN,week],(err, weeklyData) => {
              if (err) {
                reject(err);
              } else {
                resolve(weeklyData);
                
              }
              
            });
          }),
          new Promise((resolve, reject) => {
            db.query(getMonthData,[DRN,month], (err, monthlyData) => {
              
              if (err) {
                reject(err);
              } else {
                resolve(monthlyData);
              }
              
            });
          })
        ])
        .then(([weeklyData, monthlyData]) => resolve({weeklyData, monthlyData}))
        .catch(err => reject(err));
      });
    };



exports.calculateMeterMonthWeekTotals = (allData) => {
  return allData.reduce((acc, record) => {
    const date = record.date_time.toISOString().split('T')[0];
    const energy = Number(record.active_energy) / 1000;
    acc[date] = (acc[date] || 0) + energy;
    return acc;
  }, {});
};



exports.getMeterVoltageAndCurrent = (DRN) => {
  console.log(DRN);
  const getVoltageAndCurrentQuery = "SELECT voltage, current, DATE(date_time) as date_time FROM MeteringPower WHERE DRN = ? ORDER BY date_time DESC LIMIT 3360";
  return new Promise((resolve, reject) => {
    db.query(getVoltageAndCurrentQuery, [DRN], (err, current,voltage) => {
      if (err) {
        reject(err);
      } else {
        // Assuming the result is an array, you may need to adjust this based on the actual structure of the result
        // const [current, voltage] = results;
        resolve( current,voltage );
        
      }
    });
  });
};

exports.calculateMeterVoltageAndCurrent = (readings) => {
  if (!readings || !Array.isArray(readings) || readings.length === 0) {
    throw new Error("Invalid or empty readings data");
  }

  // Initialize separate accumulators for voltage and current
  const result = readings.reduce((acc, record) => {
    const voltage = Number(record.voltage) || 0;
    const current = Number(record.current) || 0 ;
    
    // Accumulate voltage and current separately
    acc.totalVoltage = (acc.totalVoltage || 0) + voltage;
    acc.totalCurrent = (acc.totalCurrent || 0) + current / 1000;
    

    return acc;
  }, {});

  return {
    totalVoltage: result.totalVoltage,
    totalCurrent: result.totalCurrent,

    
  };

};


exports.getDailyMeterEnergy  = (DRN) => {
  const getMetaData = "SELECT active_energy FROM MeterCumulativeEnergyUsage WHERE DATE(date_time) = CURDATE() AND DRN = ? ORDER BY date_time DESC LIMIT 1";
 return new Promise ((resolve ,reject) =>{
  db.query(getMetaData ,[DRN],(err,meterData) => {
    if (err) reject(err);
    else resolve(meterData);
    
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