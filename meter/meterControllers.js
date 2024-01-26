const energyService = require('./meterService');

exports.getEnergyByDRN = function(req, res) {
  const DRN = req.params.DRN;

  energyService.getEnergyByDRN(DRN, (err, data) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.json(data);
  });
};

exports.getCurrentDayEnergyByDRN = function(req, res) {
  const DRN = req.params.DRN;

  energyService.getCurrentDayEnergyByDRN(DRN, (err, data) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.json(data);
  });
};

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
      console.log('startDateResult:', startDateResult); // For debugging

      // Extract startDate from the results
      const startDate = startDateResult && startDateResult[0] && startDateResult[0].startDate;

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
      energyService.getWeeklyData('current'),
      energyService.getWeeklyData('last'),
      energyService.getVoltageAndCurrent(),
    ])
      .then(([currentData, lastData, voltageAndCurrentData]) => {
        const currentTotals = energyService.calculateTotals(currentData);
        const lastTotals = energyService.calculateTotals(lastData);
        const voltageAndCurrentTotals = energyService.calculateVoltageAndCurrent(voltageAndCurrentData);
  
        const currentResult = Object.values(currentTotals);
        const lastResult = Object.values(lastTotals);
        
        // Access totalVoltage and totalCurrent directly
        const currentweekVoltageTotal = voltageAndCurrentTotals.totalVoltage;
        const currentweekCurrentTotal = voltageAndCurrentTotals.totalCurrent;
  
        const response = {
          currentWeekTotal: currentResult.reduce((total, energy) => total + energy, 0) / 1000,
          lastweekTotal: lastResult.reduce((total, energy) => total + energy, 0) / 1000,
          currentweekVoltageTotal,
          currentweekCurrentTotal,
        };
  
        res.json(response);
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
    .then(() => energyService.insertIntoAnotherTable(data))
    .then(() => res.status(200).json({ message: 'Data inserted successfully into both tables' }))
    .catch(err => {
      console.error('Error inserting into the database:', err);
      return res.status(500).json({ error: 'Database insertion failed', details: err });
      // console.log(data);
    });
    console.log(data);
};

//------------------------------------------------------totalEnergyPerSuberb--------------------------------------------------------//

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