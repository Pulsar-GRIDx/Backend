const db = require('../db');

exports.getEnergyByDRN = function(DRN, callback) {
  const currentDate = new Date();
  const currentWeekStart = new Date(currentDate);
  currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

  const query = `SELECT active_power, date_time FROM MeteringPower WHERE DRN = ? AND date_time BETWEEN ? AND ?`;

  db.query(query, [DRN, currentWeekStart, currentWeekEnd], (err, currentWeekResults) => {
    if (err) return callback(err);

    const currentWeekEnergy = currentWeekResults.reduce((total, row) => total + row.active_power, 0);

    db.query(query, [DRN, lastWeekStart, lastWeekEnd], (err, lastWeekResults) => {
      if (err) return callback(err);

      const lastWeekEnergy = lastWeekResults.reduce((total, row) => total + row.active_power, 0);

      callback(null, {
        currentWeekEnergy,
        lastWeekEnergy,
      });
    });
  });
};
