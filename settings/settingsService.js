const db = require('../config/db')

//Service to get meter reset history
exports.getMeterResetHistory =(DRN)=>{
  const getMeterResetHistory = `SELECT * FROM Reset WHERE DRN = ?`;

  return new Promise((resolve,reject)=>{
    db.query(getMeterResetHistory,[DRN],(error,results)=>{
      if (error) {
        reject(error);
        
      } else {
        resolve(results);
        
      }
    })
  })
}
  

//Service to get meter calibration history 

exports.getMeterCalibrationHistory =(DRN)=>{
  const getMeterCalibrationHistory = `SELECT * FROM Calibration WHERE DRN = ?`;

  return new Promise((resolve, reject)=>{
    db.query(getMeterCalibrationHistory,[DRN],(err,results)=>{
      if (err) {
        reject(err);
        
      } else {
        resolve(results);
        
      }
    })
  })
}

//Service to get Meter Mains Control History Data

exports.getMeterMainsControlHistory =(DRN)=>{
  const getMeterMainsControlHistory = `SELECT * FROM MeterMainsControlTable WHERE DRN = ?`;
  return new Promise((resolve, reject)=>{
    db.query(getMeterMainsControlHistory,[DRN],(err,results)=>{
      if (err) {
        reject(err);
        
      } else {
        resolve(results);
        
      }
    })
  })
}

//Service to get Meter Mains State History Data
exports.getMeterMainsStateHistory =(DRN)=>{
  const getMeterMainsStateHistory = `SELECT * FROM MeterMainsStateTable WHERE DRN = ?`;
  return new Promise((resolve, reject)=>{
    db.query(getMeterMainsStateHistory,[DRN],(err,results)=>{
      if (err) {
        reject(err);
        
      } else {
        resolve(results);
        
      }
    })
  })
}

//Meter Heater Control History Data

exports.getMeterHeaterControlHistory =(DRN)=>{
  const getMeterHeaterControlHistory = `SELECT * FROM MeterHeaterControlTable WHERE DRN = ?`;
  return new Promise((resolve, reject)=>{
    db.query(getMeterHeaterControlHistory,[DRN],(err,results)=>{
      if (err) {
        reject(err);
        
      } else {
        resolve(results);
        
      }
    })
  })
}

//Meter Heater State History Data

exports.getMeterHeaterStateHistory =(DRN)=>{
  const getMeterHeaterStateHistory = `SELECT * FROM MeterHeaterStateTable WHERE DRN = ?`;
  return new Promise((resolve, reject)=>{
    db.query(getMeterHeaterStateHistory,[DRN],(err,results)=>{
      if (err) {
        reject(err);
        
      } else {
        resolve(results);
        
      }
    })
  })
}

//Meter STS Token history

exports.getMeterSTSTokenHistory =(DRN)=>{
  const getMeterSTSTokenHistory = `SELECT * FROM SendSTSToken WHERE DRN = ?`;
  return new Promise((resolve, reject)=>{
    db.query(getMeterSTSTokenHistory,[DRN],(err,results)=>{
      if (err) {
        reject(err);
        
      } else {
        resolve(results);
        
      }
    })
  })
}

exports.getTokenInformation = (DRN) =>{

  const getTokenInformation = `SELECT * FROM  STSTokesInfo WHERE DRN = ?`

  return new Promise((resolve, reject) =>{
    db.query(getTokenInformation,[DRN],(err,results) =>{
      if (err) {
        reject(err);

        
      } else {
        resolve(results);
        
      }
    })
  })
}

