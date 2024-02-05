const energyService = require('./meterService');

//ActiveAndInactiveMeters

exports.getAllActiveAndInactiveMeters = function (req, res) {
  energyService.getAllActiveAndInactiveMeters((err,data) =>{
    if (err) {
      console.error('Error querying MySQL:', err);
      res.status(500).send('Internal Server Error');
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
        grandTotal: grandTotal
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
        allData: result,
        startDate,
        grandTotal: grandTotal,
      };
      res.json(response);
    })
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};



  
///------------------------------CurrentWeekTotals-------------------------------------------//

exports.getEnergyAmount = (req, res) => {
  
  Promise.all([
    energyService.getWeekMonthlyData('current'),
    energyService.getWeekMonthlyData('last'),
    energyService.getWeekMonthlyData('currentMonth'),
    energyService.getWeekMonthlyData('lastMonth'),
    energyService.getVoltageAndCurrent(),
  ])
  .then(([currentData, lastData, currentMonthData, lastMonthData, voltageAndCurrentData]) => {
    try {
      const currentTotals = energyService.calculateMonthWeekTotals(currentData.weeklyData);
      const lastTotals = energyService.calculateMonthWeekTotals(lastData.weeklyData);
      const lastMonthTotals = energyService.calculateMonthWeekTotals(lastMonthData.monthlyData);
      const currentMonthTotals = energyService.calculateMonthWeekTotals(currentMonthData.monthlyData);
      const voltageAndCurrentTotals = energyService.calculateVoltageAndCurrent(voltageAndCurrentData);

      const currentWeekResult = Object.values(currentTotals);
      const lastWeekResult = Object.values(lastTotals);
      const lastMonthResult = Object.values(lastMonthTotals);
      const currentMonthResult = Object.values(currentMonthTotals);

      const currentweekVoltageTotal = voltageAndCurrentTotals.totalVoltage;
      const currentweekCurrentTotal = voltageAndCurrentTotals.totalCurrent;

      const response = {
        currentWeekResult,
        lastWeekResult,
        lastMonthResult,
        currentMonthResult,
        currentweekVoltageTotal,
        currentweekCurrentTotal,
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
///------------------------------------------------------CurrentDayActiveEnergy----------------------------------------------------//
exports.getCurrentDayEnergy = (req, res) => {
  
  energyService.getCurrentDayData()
    .then(currentDayData => {
      const totalEnergy = currentDayData.reduce((total, record) => total + Number(record.active_energy), 0) / 1000;
      res.json({ totalEnergy });
    })
    .catch(err => {
      console.log('Error querying the database:', err);
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
    console.log(data);
};

//------------------------------------------------------totalEnergyPerSuburb--------------------------------------------------------//

exports.getSuburbEnergy = (req, res) => {
  const suburbs = req.body.suburbs; // Assuming the suburbs are sent in the request body as an array
  Promise.all(suburbs.map(suburbs => {
    return energyService.getDrnsBySuburb(suburbs)
    .then(energyData => {
      console.log('Energy data for suburb', suburbs, ':', energyData);
      const totalEnergy = energyData.reduce((total, record) => {
        const activeEnergy = record.active_energy;
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
      
      
      
      
    
      return { suburbs, totalEnergy };
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
    energyService.getDRNData('current',DRN),
    energyService.getDRNData('last',DRN),
    energyService.getDRNData('currentMonth',DRN),
    energyService.getDRNData('lastMonth',DRN),
    energyService.getDRNVoltageAndCurrent(DRN),
  ])
  .then(([currentData, lastData, currentMonthData, lastMonthData, voltageAndCurrentData]) => {
    try {
      const currentTotals = energyService.CalculateDrnData(currentData.weeklyData);
      const lastTotals = energyService.CalculateDrnData(lastData.weeklyData);
      const lastMonthTotals = energyService.CalculateDrnData(lastMonthData.monthlyData);
      const currentMonthTotals = energyService.CalculateDrnData(currentMonthData.monthlyData);
      const voltageAndCurrentTotals = energyService.calculateDRNVoltageAndCurrent(voltageAndCurrentData);

      const currentWeekResult = Object.values(currentTotals);
      const lastWeekResult = Object.values(lastTotals);
      const lastMonthResult = Object.values(lastMonthTotals);
      const currentMonthResult = Object.values(currentMonthTotals);

      const currentweekVoltageTotal = voltageAndCurrentTotals.totalVoltage;
      const currentweekCurrentTotal = voltageAndCurrentTotals.totalCurrent;

      const response = {
        currentWeekResult,
        lastWeekResult,
        lastMonthResult,
        currentMonthResult,
        currentweekVoltageTotal,
        currentweekCurrentTotal,
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
    const dailyTotalEnergy = meterData.reduce((total, record) => total + Number(record.active_energy), 0) / 1000;
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
      if (!processedTokens || !processedTokens || !Array.isArray(processedTokens)) {
        // Handle the case where processedTokens, data, or data array is null or not present
        return res.status(404).json({ error: 'Processed tokens not found' });
      }

      // Calculate kWh for each token
      const kwkData = processedTokens.map((token) => ({
        token_id: token.token_id,
        date_time: token.date_time,
        token_amount: parseFloat(token.token_amount),
        kwk: parseFloat(token.token_amount) / 2.5,
      }));

      res.json( kwkData );
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
