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

exports.getAllActiveAndInactiveMeters = function(callback) {
  const getAllActiveAndInactiveMeters = 'SELECT state FROM MeterMainsStateTable';

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

exports.getADailyRevenueAmount = function(callback) {
  const getADailyRevenueAmount = 'SELECT '
}

