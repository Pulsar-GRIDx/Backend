const db = require('../db');

exports.getEnergyByDRN = function(DRN, callback) {
  const query = `SELECT active_energy , date_time FROM MeterCumulativeEnergyUsage WHERE DRN = ? ORDER BY date_time DESC LIMIT 1
  `;

  db.query(query, [DRN], (err, results) => {
    if (err) return callback(err);
  console.log(DRN);

    console.log(results);
    if (results.length === 0) {
      return callback(new Error('No results found for the provided DRN'));
    }
    const active_energy = results[0].active_energy;
    const date = new Date(results[0].date_time);

    const currentWeekStart = new Date(date);
    console.log(currentWeekStart);
    currentWeekStart.setDate(date.getDate() - date.getDay());
    const currentWeekEnd = new Date(currentWeekStart);
    console.log(currentWeekEnd);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

    const lastWeekStart = new Date(currentWeekStart);
    console.log(lastWeekStart);
    lastWeekStart.setDate(currentWeekStart.getDate() - 7);
    
    const lastWeekEnd = new Date(lastWeekStart);
    console.log(lastWeekEnd);
    lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

    const currentWeekHours = (currentWeekEnd - currentWeekStart) / 3600000;
    console.log(currentWeekHours);
    const lastWeekHours = (lastWeekEnd - lastWeekStart) / 3600000;
    console.log(lastWeekHours);

    const currentWeekEnergy = (active_energy * currentWeekHours) / 1000;
    const lastWeekEnergy = (active_energy * lastWeekHours) / 1000;

    callback(null, {
      currentWeekEnergy,
      lastWeekEnergy,
    });
  });
};

exports.getCurrentDayEnergyByDRN = function(DRN, callback) {
  const query = 'SELECT active_energy, date_time, units FROM MeterCumulativeEnergyUsage WHERE DRN = ? ORDER BY date_time DESC LIMIT 1';

  db.query(query, [DRN], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    if (results.length === 0) {
      return callback({ error: 'No results found for the provided DRN' });
    }

    const active_energy = results[0].active_energy;
    const date = new Date(results[0].date_time);
    const units = results[0].units;

    const currentDayStart = new Date(date);
    currentDayStart.setHours(0, 0, 0, 0);
    const currentDayEnd = new Date(currentDayStart);
    currentDayEnd.setHours(23, 59, 59, 999);

    const currentDayHours = (currentDayEnd - currentDayStart) / 3600000;

    const currentDayEnergy = (active_energy * currentDayHours) / 1000;

    callback(null, {
      currentDayEnergy,
      units,
      date,
    });
  });
};

///-------------------------------------Active Inactive meters-----------------------------------------------------///
exports.getAllActiveAndInactiveMeters = function(callback) {
  const getAllActiveAndInactiveMeters = 'SELECT state FROM MeterMainsStateTable WHERE DATE(date_time) = CURDATE()';

  db.query(getAllActiveAndInactiveMeters, (err, results) => {
    if (err) {
      console.log('Error Querying the database:', err);
      return callback({ error: 'Database query failed', details: err });
    }

    if (results.length === 0) {
      return callback({ error: 'No data found', details: err });
    }

    // Count occurrences of '0' and '1' in the 'state' column
    const inactiveMetersCount = results.filter(row => row.state === '0').length;
    const activeMetersCount = results.filter(row => row.state === '1').length;

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
  const getCurrentData = "SELECT active_energy, DATE(date_time) as date_time FROM MeterCumulativeEnergyUsage WHERE DATE(date_time) = CURDATE()";
  return new Promise((resolve, reject) => {
    db.query(getCurrentData, (err, currentData) => {
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

exports.calculateTotals = (allData) => {
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
exports.getWeeklyData = (week) => {
  const getWeeklyData = `SELECT active_energy, DATE(date_time) as date_time FROM MeterCumulativeEnergyUsage WHERE YEARWEEK(date_time) = YEARWEEK(CURDATE() ${week === 'last' ? '- INTERVAL 1 WEEK' : ''})`;
  return new Promise((resolve, reject) => {
    db.query(getWeeklyData, (err, weeklyData) => {
      if (err) reject(err);
      else resolve(weeklyData);
    });
  });
};
exports.calculateTotals = (allData) => {
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
    acc.totalCurrent = (acc.totalCurrent || 0) + current;

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
  });
};

exports.insertIntoAnotherTable = (data) => {
  const anotherTableData = {
    Meterlng: data.Meterlng,
    Meterlat: data.Meterlat,
    Transformerlng: data.Transformerlng,
    Transformerlat: data.Transformerlat,
    TransformerDRN: data.TransformerDRN,
  };
  return new Promise((resolve, reject) => {
    db.query('INSERT INTO MeterLocationInfoTable SET ?', anotherTableData, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

//------------------------------------------------------totalEnergyPerSuberb--------------------------------------------------------//
exports.getDrnsBySuburb = (LocationName) => {
  const getDrnsBySuburb = 'SELECT DRN FROM TransformerInformation WHERE LocationName = ?';
  return new Promise((resolve, reject) => {
    db.query(getDrnsBySuburb, [LocationName], (err, drnData) => {
      if (err) reject(err);
      else resolve(drnData.map(record => record.DRN));
      console.log(drnData);
    });
  });
};

exports.getEnergyByDrn = (drn) => {
  const getEnergyByDrn = 'SELECT active_energy FROM MeterCumulativeEnergyUsage WHERE DRN = ? AND DATE(date_time) = CURDATE()';
  return new Promise((resolve, reject) => {
    db.query(getEnergyByDrn, [drn], (err, energyData) => {
      if (err) reject(err);
      else resolve(energyData);
    });
  });
};