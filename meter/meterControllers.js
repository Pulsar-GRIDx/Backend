const energyService = require('./meterService');
//Total Meters
exports.getTotalMeters = async (req, res) => {
  try {
    const totalMeters = await energyService.getAllTotalMeters();
    res.json(totalMeters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};

//ActiveAndInactiveMeters

exports.getAllActiveAndInactiveMeters = function (req, res) {
  energyService.getAllActiveAndInactiveMeters((err,data) =>{
    if (err) {
      console.error('Error querying MySQL:', err);
      res.json(0);
      return;
    }

    res.json(data);
  });
  }
//------------------------------------------TotalTokenAmount-----------------------------//
  exports.getTokenAmount = function(req, res) {
    const currentDate = new Date();
  
    energyService.getTokenAmount(currentDate, (err, data) => {
      if (err) {
        console.error('Error querying MySQL:', err);
        res.status(500).json({ error: 'Database query failed', details: err });
        return;
      }
  
      const { currentData, previousData, startDateResult } = data;
  
      const currentTotal = currentData.reduce((total, record) => total + Number(record.token_amount), 0);
  
      const previousTotals = previousData.reduce((totals, record) => {
        if (record.date_time) {
          const date = record.date_time.toISOString().split('T')[0];
          if (!totals[date]) {
            totals[date] = 0;
          }
          totals[date] += Number(record.token_amount);
        }
        return totals;
      }, {});
  
      const allData = [...previousData, ...currentData];
      const grandTotal = allData.reduce((total, record) => total + Number(record.token_amount), 0);
  
      res.json({
        allData: allData.map(record => Number(record.token_amount)),
        startDate: new Date(startDateResult[0].startDate).toISOString().split('T')[0],
        grandTotal: (grandTotal).toFixed(2),
      });
    });
  };
///-------------------------------------TotalTokenCount--------------------------------------------//
  exports.getTokenCount = function(req, res) {
    const currentDate = new Date();
  
    energyService.getTokenCount(currentDate, (err, data) => {
      if (err) {
        console.error('Error querying MySQL:', err);
        res.status(500).json({ error: 'Database query failed', details: err });
        return;
      }
  
      const { currentData, previousData, startDateResult } = data;
  
      const currentCount = currentData.length;
      const previousCount = previousData.length;
      const allData = [...previousData, ...currentData];
      const grandTotal = currentCount + previousCount;
  
      res.json({
        allData: allData.map(record => Number(record.display_msg === 'Accept')),
        startDate: new Date(startDateResult[0].startDate).toISOString().split('T')[0],
        grandTotal
      });
    });
  };
//-----------------------------TotalEnergyConsumptionOnTheSystem-----------------------------------//

exports.getTotalEnergyAmount = (req, res) => {
  energyService.getCurrentData()
    .then(currentData => energyService.getStartDate(currentData))
    .then(startDateResult => {
      

      // Extract startDate without the time component
      const startDate = startDateResult[0] ? startDateResult[0].startDate.toISOString().split('T')[0] : null;
     

      return energyService.getPreviousData(startDate)
        .then(allData => {
          return { allData, startDate };
        });
    })
    .then(({ allData, startDate }) => {
      const totals = energyService.calculateTotalss(allData);
      const result = Object.values(totals);
      const grandTotal = result.reduce((total, record) => total + record, 0);

      const response = {
        allData: result.map(value => parseFloat(value.toFixed(2))),
        startDate,
        grandTotal: grandTotal,
      };
      res.json(response);
    })
    .catch(err => {
      console.error('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};



  
///------------------------------CurrentWeekTotals-------------------------------------------//

exports.getEnergyAmount = (req, res) => {
 
  
  Promise.all([
    energyService.getSystemCurrentWeekData(),
    energyService.getSystemLastWeekData(),
    energyService.getSystemCurrentMonthData(),
    energyService.getSystemLastMonthData(),
    energyService.getSystemVoltageAndCurrent(),
    energyService.getStartDate(),
  ])
  .then(([currentWeekData, lastWeekData, currentMonthData, lastMonthData, voltageAndCurrentData, startDateResult]) => {
    // Extract startDate without the time component
    const startDate = startDateResult[0] ? startDateResult[0].startDate.toISOString().split('T')[0] : null;
    try {
      const currentWeekTotals = energyService.CalculateDrnData(currentWeekData);
      const lastWeekTotals = energyService.CalculateDrnData(lastWeekData);
      const currentMonthTotals = energyService.CalculateDrnData(currentMonthData);
      const lastMonthTotals = energyService.CalculateDrnData(lastMonthData);
      const voltageAndCurrentTotals = energyService.calculateSystemVoltageAndCurrent(voltageAndCurrentData);

      const currentWeekResult = Object.values(currentWeekTotals);
      const lastWeekResult = Object.values(lastWeekTotals);
      const currentMonthResult = Object.values(currentMonthTotals);
      const lastMonthResult = Object.values(lastMonthTotals);

      const currentweekVoltageTotal = voltageAndCurrentTotals.totalVoltage;
      const currentweekCurrentTotal = voltageAndCurrentTotals.totalCurrent;

      const response = {
        currentWeekResult : currentWeekResult.map(value => parseFloat(value.toFixed(2))),
        lastWeekResult: lastWeekResult.map(value => parseFloat(value.toFixed(2))),
        currentMonthResult : currentMonthResult.map(value => parseFloat(value.toFixed(2))),
        lastMonthResult: lastMonthResult.map(value => parseFloat(value.toFixed(2))),
        currentweekVoltageTotal ,
        currentweekCurrentTotal ,
        startDate,
      };

      res.json(response);
    } catch (err) {
      console.error('Error processing the data:', err);
      return res.status(500).send({ error: 'Data processing failed', details: err });
    }
  })
  .catch(err => {
    console.log('Error querying the database:', err);
    return res.status(500).send({ error: 'Database query failed', details: err });
  });
};
///------------------------------------------------------CurrentDayActiveEnergy----------------------------------------------------//
exports.getCurrentDayEnergy = (req, res) => {
  
  energyService.getCurrentDayData()
    .then(currentDayData => {
      const totalEnergy = currentDayData.reduce((total, record) => total + Number(record.power_consumption), 0) ;
      res.json({ totalEnergy  });
    })
    .catch(err => {
      console.error('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};
//--------------------------------------------------------InsertMeterData----------------------------------------------------------//
exports.insertData = (req, res) => {
  const data = req.body; // Assuming the data is sent in the request body
  energyService.insertIntoMeterRealInfo(data)
    .then(() => res.status(200).json({ message: 'Data inserted successfully into both tables' }))
    .catch(err => {
      console.error('Error inserting into the database:', err);
      return res.status(500).json({ error: 'Database insertion failed', details: err });
      // console.log(data);
    });
    // console.log(data);
};

//------------------------------------------------------totalEnergyPerSuburb--------------------------------------------------------//

exports.getSuburbEnergy = (req, res) => {
  const suburbs = req.body.suburbs; // Assuming the suburbs are sent in the request body as an array
  Promise.all(suburbs.map(suburb => {
    return energyService.getDrnsBySuburb(suburb)
    .then(energyData => {
      console.log('Energy data for suburb', suburb, ':', energyData);
      const totalEnergy = energyData.reduce((total, record) => {
        const activeEnergy = record.apparent_power;
        console.log('Active Energy:', activeEnergy);
        
        if (activeEnergy !== null && activeEnergy !== undefined && typeof activeEnergy === 'string') {
          const energyValue = parseFloat(activeEnergy.replace(',', ''));
          console.log('Parsed Energy Value:', energyValue);
          
          if (!isNaN(energyValue)) {
            return total + energyValue;
          }
        }
        return total;
      }, 0);
      
      // // Round totalEnergy to 2 decimal places
      // const roundedTotalEnergy = parseFloat(totalEnergy.toFixed(2));
      
      return { suburb, totalEnergy: (totalEnergy.toFixed(2)) };
    });
    
  }))
    .then(results => res.json(results))
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};


//-------------------------------------------------------------GetSpecificMeterWeeklyAndMonthlyDataByDRN------------------------------------------------//

exports.getDRNDATA = (req, res) => {
  const DRN = req.params.DRN;
  
  Promise.all([
    energyService.getCurrentWeekData(DRN),
    energyService.getLastWeekData(DRN),
    energyService.getCurrentMonthData(DRN),
    energyService.getLastMonthData(DRN),
    energyService.getDRNVoltageAndCurrent(DRN),
    energyService.getDRNStartDate(DRN),
  ])
  .then(([currentWeekData, lastWeekData, currentMonthData, lastMonthData, voltageAndCurrentData, startDateResult]) => {
    // Extract startDate without the time component
    const startDate = startDateResult[0] ? startDateResult[0].startDate.toISOString().split('T')[0] : null;
    try {
      const currentWeekTotals = energyService.CalculateDrnData(currentWeekData);
      const lastWeekTotals = energyService.CalculateDrnData(lastWeekData);
      const currentMonthTotals = energyService.CalculateDrnData(currentMonthData);
      const lastMonthTotals = energyService.CalculateDrnData(lastMonthData);
      const voltageAndCurrentTotals = energyService.calculateDRNVoltageAndCurrent(voltageAndCurrentData);

      const currentWeekResult = Object.values(currentWeekTotals);
      const lastWeekResult = Object.values(lastWeekTotals);
      const currentMonthResult = Object.values(currentMonthTotals);
      const lastMonthResult = Object.values(lastMonthTotals);

      const currentweekVoltageTotal = voltageAndCurrentTotals.totalVoltage;
      const currentweekCurrentTotal = parseFloat(voltageAndCurrentTotals.totalCurrent).toFixed(2); // Convert to float and round to 2 decimal places

const response = {
  currentWeekResult: currentWeekResult.map(value => parseFloat(value)),
  lastWeekResult: lastWeekResult.map(value => parseFloat(value)),
  currentMonthResult: currentMonthResult.map(value => parseFloat(value)),
  lastMonthResult: lastMonthResult.map(value => parseFloat(value)),
  currentweekVoltageTotal,
  currentweekCurrentTotal, // Parse the string to float
  startDate,
};


      res.json(response);
    } catch (err) {
      console.log('Error processing the data:', err);
      return res.status(500).send({ error: 'Data processing failed', details: err });
    }
  })
  .catch(err => {
    console.log('Error querying the database:', err);
    return res.status(500).send({ error: 'Database query failed', details: err });
  });
};







exports.getDailyMeterEnergy =(req,res)=>{
  const DRN = req.params.DRN;

  Promise.all([
    energyService.getDailyMeterEnergy(DRN)
  ])
  .then(([meterData])=>{
    const dailyTotalEnergy = (meterData.reduce((total, record) => total + Number(record.power_consumption), 0) / 1000).toFixed(2);
    res.json({ dailyTotalEnergy });
  })
  .catch((err) =>{
    console.log('Error quring the database:' , err.message);
    res.status(500).json({error: 'DataBase query failed', details: err.message});
  });
};

///-----------------------------------------------------GetAllProcessedTokensByDRN------------------------------------------------------------------------///

exports.getAllProcessedTokens = (req, res) => {
  const DRN = req.params.DRN;

  Promise.all([energyService.getAllProcessedTokens(DRN)])
    .then(([processedTokens]) => {
      if (!processedTokens || !Array.isArray(processedTokens)) {
        // Handle the case where processedTokens or data array is null or not present
        res.json(0);
        return res.status(404).json({ error: 'Processed tokens not found' });
      }

      // Calculate kWh for each token
      const kwkData = processedTokens.map((token) => ({
        token_id: token.token_id,
        date_time: token.date_time,
        token_amount: parseFloat(token.token_amount),
        kwh: parseFloat(token.token_amount) / 2.5,
      }));

      const total = kwkData.reduce((total, record) => total + record.token_amount, 0).toFixed(2);
      const kwhTotal = kwkData.reduce((total, record) => total + record.kwh , 0).toFixed(2);

      res.json({ data: kwkData, total ,kwhTotal});
    })
    .catch((err) => {
      console.log('Error querying the database:', err.message);
      res.status(500).json({ error: 'Database query failed, try again', details: err.message });
    });
};


//--------------------------------------------------------Inserting New Transformer----------------------------------------------------------//
exports.insertTransformerData = (req, res) => {
  const TransformerData = req.body.TransformerData; // Assuming the data is sent in the request body
  energyService.insertIntoTransformerRealInfo(TransformerData)
    .then(() => res.status(200).json({ message: 'Transformer Added Successfully' }))
    .catch(err => {
      console.error('Error inserting into the database:', err);
      return res.status(500).json({ error: 'Database insertion failed', details: err });
    });
    
};



// GridTopology



function convertDataToMockTree(data) {
  let mockTreeData = [];

  for (const city in data) {
    for (const locationName in data[city]) {
      let locationActiveEnergy = 0;
      const locationNode = {
        key: `${locationName}`,
        name: `Location: ${locationName}`,
        value:`kwh: ${(locationActiveEnergy).toFixed(2)}`,
        children: [],
      };

      for (const transformerName in data[city][locationName].transformers) {
        const transformerData = data[city][locationName].transformers[transformerName];
        const transformerNode = {
          key: `${transformerName}`,
          name: `Transformer: ${transformerName}`,
          value: `kwh: ${(transformerData.active_energy).toFixed(2)}`,
          children: [],
        };

        transformerData.meters.forEach(meterData => {
          transformerNode.children.push({
            key: `${city}-${locationName}-${transformerName}-${meterData.DRN}`,
            name: `DRN: ${meterData.DRN}`,
            value: `kwh: ${(meterData.active_energy).toFixed(2)}`,
          });
        });

        locationNode.children.push(transformerNode);
        locationActiveEnergy += transformerData.active_energy;
      }

      locationNode.value;
      mockTreeData.push(locationNode);
    }
  }

  return mockTreeData;
}



// Controller function
exports.fetchDRNs = async (req, res) => {
  const cities = req.body.cities;
  try {
    const result = {};
    for (const city of cities) {
      const data = await energyService.fetchDRNs(city);
      result[city] = data; // No need to convert data to mockTreeData here
    }
    res.status(200).json({ mockTreeData: convertDataToMockTree(result) }); // Convert the final result to mockTreeData
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
};


//----------------------------------------------------------------All time periods ---------------------------------------------//
exports.getEnergyData = (req, res) => {
  energyService.getEnergyData()
    .then(energyData => {
      // Check if energyData is an object and has the required properties
      if (typeof energyData === 'object' && energyData.day !== undefined && energyData.month !== undefined && energyData.year !== undefined) {
        const roundedEnergyData = {
          day: parseFloat(energyData.day).toFixed(2),
          month: parseFloat(energyData.month).toFixed(2),
          year: parseFloat(energyData.year).toFixed(2)
        };
        if(energyData.length === 0){
          res.json(0);
        }
        res.json(roundedEnergyData);
      } else {
        console.log('Error: energyData is not a valid object:', energyData);
        return res.status(500).send({ error: 'Data format error', details: 'Expected an object with day, month, and year for energyData' });
      }
    })
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};


//-------------------------------------------------------------CurrentAndLastYearData For all the current and last months------------------------//
exports.getMonthlyEnergyForCurrentAndLastYear = (req, res) => {
  energyService.getMonthlyDataForCurrentAndLastYear()
    .then(monthlyData => {
      const monthlyEnergy = { Last: new Array(12).fill(0), Current: new Array(12).fill(0) };
      const currentYear = new Date().getFullYear();
      
      monthlyData.forEach(record => {
        const yearKey = record.year === currentYear ? 'Current' : 'Last';
        const monthIndex = record.month - 1;
        monthlyEnergy[yearKey][monthIndex] = Number((record.total_apparent_power));
      });

      res.json(monthlyEnergy);
    })
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};

///-------------------------------------------------------------CurrentAndLastWeek With the day starting on Monday -------------------------------------//
exports.getWeeklyEnergyForCurrentAndLastWeek = (req, res) => {
  energyService.getWeeklyDataForCurrentAndLastWeek()
    .then(weeklyData => {
      const weeklyEnergy = { lastweek: new Array(7).fill(0), currentweek: new Array(7).fill(0) };
      const currentWeekNumber = new Date().getWeek();
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      weeklyData.forEach(record => {
        const weekKey = record.week === currentWeekNumber ? 'currentweek' : 'lastweek';
        const dayIndex = daysOfWeek.indexOf(record.day);
        weeklyEnergy[weekKey][dayIndex] = Number((record.total_apparent_power));
      });

      res.json(weeklyEnergy);
    })
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};


//getWeek method 
Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};
//Get hourly power consumption



exports.getHourlyPowerConsumption = function(req, res) {
    energyService.getApparentPowerSum((err, data) => {
        if (err) {
            console.error('Error querying MySQL:', err);
            res.status(404).send('No data found');
            return;
        }

        res.json(data);
    });
}

//Current hour avrage voltage and current 
exports.getAverageCurrentAndVoltage = function(req, res) {
  energyService.getAverageCurrentAndVoltage((err, data) => {
      if (err) {
          console.error('Error querying MySQL:', err);
          res.status(404).send('No data found');
          return;
      }

      res.json(data);
  });
}
//Hourly energy
exports.getSumApparentPower = function(req, res) {
  energyService.getSumApparentPower((err, data) => {
      if (err) {
          console.error('Error querying MySQL:', err);
          res.status(404).send('No data found');
          return;
      }

      res.json(data);
  });
}


//Suburb Apparent Power Time Periods
exports.getTimePeriodApparentPowerBySuburb = function(req, res) {
  const suburbs = req.body.suburbs;

  energyService.getApparentPowerByTimePeriodsBySuburb(suburbs, (err, results) => {
    if (err) {
      console.error('Error getting apparent power by suburb:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json(results);
  });
}

//Weekly Suburb Apparent Power
exports.getWeeklyApparentPowerBySuburb = function(req, res) {
  const suburbs = req.body.suburbs; // assuming you're sending the suburbs in the request body

  energyService.getWeeklyApparentPowerBySuburb(suburbs, (err, results) => {
    if (err) {
      console.error('Error getting the apparent power:', err);
      return res.status(500).send({ error: 'Failed to get the apparent power', details: err });
    }

    res.send(results);
  });
}

//Yearly Suburb Apparent Power
exports.getYearlyApparentPowerBySuburb = function(req, res) {
  const suburbs = req.body.suburbs; // assuming you're sending the suburbs in the request body

  energyService.getYearlyApparentPowerBySuburb(suburbs, (err, results) => {
    if (err) {
      console.error('Error getting the apparent power:', err);
      return res.status(500).send({ error: 'Failed to get the apparent power', details: err });
    }

    res.send(results);
  });
}

///------------------------------------------------------SystemProcessedTokens --------------------------------------//
exports.getAllSystemProcessedTokensController = (req, res) => {
  energyService.getAllSystemProcessedTokens()
    .then((processedTokens) => {
      if (!processedTokens || !Array.isArray(processedTokens)) {
        return res.status(404).json({ error: 'Processed tokens not found' });
      }

      const kwkData = processedTokens.map((token) => ({
        token_id: token.token_id,
        date_time: token.date_time,
        token_amount: parseFloat(token.token_amount),
        kwh: parseFloat(token.token_amount) / 2.5,
      }));

      const total = kwkData.reduce((total, record) => total + record.token_amount, 0).toFixed(2);
      const kwhTotal = kwkData.reduce((total, record) => total + record.kwh, 0).toFixed(2);

      res.json({ data: kwkData, total, kwhTotal });
    })
    .catch((err) => {
      console.log('Error querying the database:', err.message);
      res.status(500).json({ error: 'Database query failed, try again', details: err.message });
    });
};