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


  exports.getTotalEnergyAmount = (req, res) => {
    energyService.getCurrentData()
      .then(currentData => energyService.getStartDate(currentData))
      .then(startDateResult => {
        return energyService.getPreviousData(startDateResult)
          .then(allData => {
            return { allData, startDateResult };
          });
      })
      .then(({ allData, startDateResult }) => {
        const totals = energyService.calculateTotals(allData);
        const result = Object.values(totals);
        const grandTotal = result.reduce((total, record) => total + record, 0);
        const response = {
          allData: result,
          startDate: new Date(startDateResult[0].startDate).toISOString().split('T')[0],
          grandTotal: grandTotal,
        };
        res.json(response);
      })
      .catch(err => {
        console.log('Error querying the database:', err);
        return res.status(500).send({ error: 'Database query failed', details: err });
      });
  };
  


exports.getEnergyAmount = (req, res) => {
  Promise.all([energyService.getWeeklyData('current'), energyService.getWeeklyData('last'),energyService.getVoltageAndCurrent('voltage', 'current')])
    .then(([currentData, lastData,Totalcurrent,Totalvoltage]) => {
      const currentTotals = energyService.calculateTotals(currentData);
      const currentATotals = energyService.calculateVoltageAndCurrent(Totalcurrent);
      const currentVoltage = energyService.calculateVoltageAndCurrent(Totalvoltage);
      const lastTotals = energyService.calculateTotals(lastData);
      const currentResult = Object.values(currentTotals);
      const lastResult = Object.values(lastTotals);
      const currentCurrentResult = Object.values(currentATotals);
      const currentVoltageResult = Object.values(currentVoltage);
     
      const currentWeekTotal = currentResult.reduce((total, energy) => total + energy, 0);
      const lastweekTotal = lastResult.reduce((total, energy) => total + energy, 0);
      const currentweekCurrentTotal = currentCurrentResult.reduce((total, current) => total + current, 0);
      const currentweekVoltageTotal = currentVoltageResult.reduce((total, voltage) => total + voltage, 0);
      const response = {
        // currentWeek: {
        //   // allData: currentResult,
        //   currentWeekTotal,
        // },
        // lastWeek: {
        //   // allData: lastResult,
        //   grandTotal: lastweekTotal,
        // },

        
          currentWeekTotal,
          lastweekTotal,
          currentweekCurrentTotal,
          currentweekVoltageTotal
        
      };
      res.json(response);
    })
    .catch(err => {
      console.log('Error querying the database:', err);
      return res.status(500).send({ error: 'Database query failed', details: err });
    });
};
