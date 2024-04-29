const db = require('../config/db')

//Service to get meter reset history
exports.getMeterResetHistory =()=>{
  const getMeterResetHistory = `SELECT * FROM Reset`;

  return new Promise((resolve,reject)=>{
    db.query(getMeterResetHistory,(error,results)=>{
      if (error) {
        reject(error);
        
      } else {
        resolve(results);
        
      }
    })
  })
}
  

//Service to get meter calibration history 

exports.getMeterCalibrationHistory =()=>{
  const getMeterCalibrationHistory = `SELECT * FROM Calibration`;

  return new Promise((resolve, reject)=>{
    db.query(getMeterCalibrationHistory,(err,results)=>{
      if (err) {
        reject(err);
        
      } else {
        resolve(results);
        
      }
    })
  })
}

//Service to get Meter Mains Control History Data

exports.getMeterMainsControlHistory =()=>{
  const getMeterMainsControlHistory = `SELECT * FROM MeterMainsControlTable`;
  return new Promise((resolve, reject)=>{
    db.query(getMeterMainsControlHistory,(err,results)=>{
      if (err) {
        reject(err);
        
      } else {
        resolve(results);
        
      }
    })
  })
}

//Service to get Meter Mains State History Data
exports.getMeterMainsStateHistory =()=>{
  const getMeterMainsStateHistory = `SELECT * FROM MeterMainsStateTable`;
  return new Promise((resolve, reject)=>{
    db.query(getMeterMainsStateHistory,(err,results)=>{
      if (err) {
        reject(err);
        
      } else {
        resolve(results);
        
      }
    })
  })
}

//Meter Heater Control History Data

exports.getMeterHeaterControlHistory =()=>{
  const getMeterHeaterControlHistory = `SELECT * FROM MeterHeaterControlTable`;
  return new Promise((resolve, reject)=>{
    db.query(getMeterHeaterControlHistory,(err,results)=>{
      if (err) {
        reject(err);
        
      } else {
        resolve(results);
        
      }
    })
  })
}

//Meter Heater State History Data

exports.getMeterHeaterStateHistory =()=>{
  const getMeterHeaterStateHistory = `SELECT * FROM MeterHeaterStateTable`;
  return new Promise((resolve, reject)=>{
    db.query(getMeterHeaterStateHistory,(err,results)=>{
      if (err) {
        reject(err);
        
      } else {
        resolve(results);
        
      }
    })
  })
}

//Meter STS Token history

exports.getMeterSTSTokenHistory =()=>{
  const getMeterSTSTokenHistory = `SELECT * FROM SendSTSToken`;
  return new Promise((resolve, reject)=>{
    db.query(getMeterSTSTokenHistory,(err,results)=>{
      if (err) {
        reject(err);
        
      } else {
        resolve(results);
        
      }
    })
  })
}



