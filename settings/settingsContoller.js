const { error } = require('winston');
const settingsService = require('./settingsService');


// Controller to get meter reset history
exports.getMeterResetHistory = function(req, res) {

  settingsService.getMeterResetHistory()
  .then(results => {
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        console.send({error: 'No data found'});
      return res.json(0);
      }
    });

    if (results.length === 0) {
      console.log({ error: 'No data found' });
      return res.json(0);
    }

    res.json(results);
  })
  .catch(error => {
    console.error('Error getting data', error);
    return res.status(500).send({ error: 'Database query failed', details: error });
  });

};



//Controller to get meter calibration history

exports.getMeterCalibrationHistory = function(req,res){

  settingsService.getMeterCalibrationHistory()
  .then(results =>{
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        console.send({error: 'No data found'});
      return res.json(0);
      }
    });
    if(results.length === 0){
      console.send({error: 'No data found'});
      return res.json(0);
    }
    res.json(results);

  })
}

//Controller to get Meter Mains Control History Data

exports.getMeterMainsControlHistory = function(req,res){
  settingsService.getMeterMainsControlHistory()
  .then(results =>{
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        console.send({error: 'No data found'});
      return res.json(0);
      }
    });
    if(results.length === 0){
      console.send({error: 'No data found'});
      return res.json(0);
    }
    res.json(results);
  })
  .catch(error =>{
    console.error('Error getting data' , error);
    return res.status(500).send({error: 'Database query failed' , details: err});
  })
  
}

//Controller to get Meter Mains State History Data
exports.getMeterMainsStateHistory = function(req,res){
  settingsService.getMeterMainsStateHistory()
  .then(results =>{
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        result.date_time = null; // Set date_time to null if it's not a Date object
      }
    });
    if(results.length === 0){
      console.send({error: 'No data found'});
      return res.json(0);
    }
    res.json(results);
  })
  .catch(error =>{
    console.error('Error getting data' , error);
    return res.status(500).send({error: 'Database query failed' , details: err});
  })
  
}


//Controller to get Meter Heater Control History Data

exports.getMeterHeaterControlHistory = function(req,res){
  settingsService.getMeterHeaterControlHistory()
  .then(results =>{
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        console.send({error: 'No data found'});
      return res.json(0);
      }
    });
    if(results.length === 0){
      console.send({error: 'No data found'});
      return res.json(0);
    }
    res.json(results);
  })
  .catch(error =>{
    console.error('Error getting data' , error);
    return res.status(500).send({error: 'Database query failed' , details: err});
  })
  
}


//Controller to get Meter Heater State History Data

exports.getMeterHeaterStateHistory = function(req,res){
  settingsService.getMeterHeaterStateHistory()
  .then(results =>{
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        console.send({error: 'No data found'});
      return res.json(0);
      }
    });
    if(results.length === 0){
      console.send({error: 'No data found'});
      return res.json(0);
    }
    res.json(results);
  })
  .catch(error =>{
    console.error('Error getting data' , error);
    return res.status(500).send({error: 'Database query falied' , details: err});
  })
  
}


//Meter STS Token history

exports.getMeterSTSTokenHistory = function(req,res){
  settingsService.getMeterSTSTokenHistory().then(results =>{
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        console.send({error: 'No data found'});
      return res.json(0);
      }
    });
    if(results.length === 0){
      console.send({error: 'No data found'});
      return res.json(0);
    }
    res.json(results);
  })

}