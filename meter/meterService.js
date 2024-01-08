const db = require('../db');

exports.getEnergyByDRN = function(DRN, callback) {
  const query = `SELECT active_power, date_time FROM MeteringPower WHERE DRN = ? ORDER BY date_time DESC LIMIT 1;
  `;

  db.query(query, [DRN], (err, results) => {
    if (err) return callback(err);
  console.log(DRN);

    console.log(results);
    if (results.length === 0) {
      return callback(new Error('No results found for the provided DRN'));
    }
    const active_power = results[0].active_power;
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

    const currentWeekEnergy = active_power * currentWeekHours;
    const lastWeekEnergy = active_power * lastWeekHours;

    callback(null, {
      currentWeekEnergy,
      lastWeekEnergy,
    });
  });
};
