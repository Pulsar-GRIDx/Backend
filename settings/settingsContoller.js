const { error } = require('winston');
const settingsService = require('./settingsService');


// Controller to get meter reset history
exports.getMeterResetHistory = function(req, res) {
  const DRN = req.params.DRN;

  settingsService.getMeterResetHistory(DRN)
  .then(results => {
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        console.error({error: 'No data found'});
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
  const DRN = req.params.DRN;
  settingsService.getMeterCalibrationHistory(DRN)
  .then(results =>{
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        console.error({error: 'No data found'});
      return res.json(0);
      }
    });
    if(results.length === 0){
      console.error({error: 'No data found'});
      return res.json(0);
    }
    res.json(results);

  })
}

//Controller to get Meter Mains Control History Data

exports.getMeterMainsControlHistory = function(req,res){
  const DRN = req.params.DRN;
  settingsService.getMeterMainsControlHistory(DRN)
  .then(results =>{
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        console.error({error: 'No data found'});
      return res.json(0);
      }
    });
    if(results.length === 0){
      console.error({error: 'No data found'});
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
  const DRN = req.params.DRN;
  settingsService.getMeterMainsStateHistory(DRN)
  .then(results =>{
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        result.date_time = null; // Set date_time to null if it's not a Date object
      }
    });
    if(results.length === 0){
      console.error({error: 'No data found'});
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
  const DRN = req.params.DRN;
  settingsService.getMeterHeaterControlHistory(DRN)
  .then(results =>{
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        console.error({error: 'No data found'});
      return res.json(0);
      }
    });
    if(results.length === 0){
      console.error({error: 'No data found'});
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
  const DRN = req.params.DRN;
  settingsService.getMeterHeaterStateHistory(DRN)
  .then(results =>{
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        console.error({error: 'No data found'});
      return res.json(0);
      }
    });
    if(results.length === 0){
      console.error({error: 'No data found'});
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
  const DRN = req.params.DRN;
  settingsService.getMeterSTSTokenHistory(DRN).then(results =>{
    results.forEach(result => {
      if (result.date_time instanceof Date) { // Check if result.date_time is a Date object
        result.date_time = result.date_time.toISOString().substring(0, 10);
      } else {
        console.error({error: 'No data found'});
      return res.json(0);
      }
    });
    
    if(results.length === 0){
      console.error({error: 'No data found'});
      return res.json(0);
    }
    res.json(results);
  })

}

exports.getTokenInformation = function(req, res) {
  const DRN = req.params.DRN;
  // console.log(DRN);
  settingsService.getTokenInformation(DRN)
    .then(results => {
      if (results.length === 0) {
        console.error({ error: 'No data found' });
        return res.json(0);
      }

      results.forEach(result => {
        if (!(result.date_time instanceof Date)) {
          console.error({ error: 'Invalid date format for date_time' });
        } else {
          result.date_time = result.date_time.toISOString().substring(0, 10);
        }

        if (result.token_time === null) {
          // console.error({ error: 'token_time is null' });
          result.token_time = '0000-00-00 00:00:00';
        }
      });

      res.json(results);
    })
    .catch(error => {
      console.error({ error: 'An error occurred while fetching token information', details: error });
      res.status(500).json({ error: 'An error occurred' });
    });
}
