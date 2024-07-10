const SystemController = require('../../systemSettings/systemSettingsContoller');
const systemSettingsService = require('../../systemSettings/systemSettingsService');

jest.mock('../../systemSettings/systemSettingsService');


//Voltage

describe('SystemController - getVoltageTriggerDefinition', () => {
  let systemController;
  let req;
  let res;

  beforeEach(() => {
      systemSettingsService.mockClear();
      systemController = new SystemController();
      req = {};
      res = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn()
      };
  });

  it('should return the voltage trigger definition correctly', () => {
      const triggerResults = [{
          'SQL Original Statement': 'IF NEW.voltage >= 250 THEN INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type) VALUES (1, 2, 3, 4, "Alert"); IF NEW.voltage <= 150 THEN INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type) VALUES (5, 6, 7, 8, "Warning");'
      }];
      const statusResults = [{ IsActive: true }];

      systemController.systemService.getVoltageTriggerDefinition = jest.fn((callback) => {
          callback(null, triggerResults, statusResults);
      });

      systemController.getVoltageTriggerDefinition(req, res);

      expect(res.send).toHaveBeenCalledWith({
          upperThreshold: '250',
          lowerThreshold: '150',
          type: 'Warning',
          Active: true
      });
  });

  it('should return 500 on error', () => {
      systemController.systemService.getVoltageTriggerDefinition = jest.fn((callback) => {
          callback(new Error('Test error'), null, null);
      });

      systemController.getVoltageTriggerDefinition(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(new Error('Test error'));
  });

  it('should return 404 if no status results found', () => {
      const triggerResults = [{
          'SQL Original Statement': 'IF NEW.voltage >= 250 THEN INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type) VALUES (1, 2, 3, 4, "Alert"); IF NEW.voltage <= 150 THEN INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type) VALUES (5, 6, 7, 8, "Warning");'
      }];
      const statusResults = [];

      systemController.systemService.getVoltageTriggerDefinition = jest.fn((callback) => {
          callback(null, triggerResults, statusResults);
      });

      systemController.getVoltageTriggerDefinition(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({ message: 'No status found for the trigger.' });
  });

  it('should return "No match found" if no regex matches', () => {
      const triggerResults = [{
          'SQL Original Statement': 'INVALID SQL STATEMENT'
      }];
      const statusResults = [{ IsActive: true }];

      systemController.systemService.getVoltageTriggerDefinition = jest.fn((callback) => {
          callback(null, triggerResults, statusResults);
      });

      systemController.getVoltageTriggerDefinition(req, res);

      expect(res.send).toHaveBeenCalledWith('No match found');
  });
});

describe('SystemController - updateVoltageThresholds', () => {
  let systemController;
  let req;
  let res;

  beforeEach(() => {
    systemSettingsService.mockClear();
    systemController = new SystemController();
    req = {
      body: {
        newUpperThreshold: '260',
        newLowerThreshold: '140',
        type: 'Alert',
        IsActive: true
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error.mockRestore();
  });

  it('should update voltage thresholds successfully', () => {
    systemController.systemService.updateVoltageTriggerDefinition = jest.fn((newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(null, {}, {});
    });

    systemController.updateVoltageThresholds(req, res);

    expect(res.send).toHaveBeenCalledWith('Thresholds updated successfully!');
  });

  it('should return 400 if any required field is missing', () => {
    req.body.newUpperThreshold = '';
    systemController.updateVoltageThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds, type, and IsActive cannot be empty.' });

    req.body.newUpperThreshold = '260';
    req.body.newLowerThreshold = '';
    systemController.updateVoltageThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds, type, and IsActive cannot be empty.' });

    req.body.newLowerThreshold = '140';
    req.body.type = '';
    systemController.updateVoltageThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds, type, and IsActive cannot be empty.' });
  });

  it('should return 500 on error', () => {
    systemController.systemService.updateVoltageTriggerDefinition = jest.fn((newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(new Error('Test error'), null, null);
    });

    systemController.updateVoltageThresholds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(new Error('Test error'));
  });
});


//Current

                 //Get
// describe('SystemController - getCurrentTriggerDefinition', () => {
//   let systemController;
//   let req;
//   let res;

//   beforeEach(() => {
//     systemSettingsService.mockClear();
//     systemController = new SystemController();
//     req = {};
//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//       send: jest.fn()
//     };
//   });

//   it('should return the current trigger definition correctly', () => {
//     const triggerResults = [{
//       'SQL Original Statement': 'IF sum_current >= 250 THEN INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type) VALUES (1, 2, 3, 4, "Alert"); IF sum_current <= 150 THEN INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type) VALUES (5, 6, 7, 8, "Warning");'
//     }];
//     const statusResults = [{ IsActive: true }];

//     systemController.systemService.getCurrentTriggerDefinition = jest.fn((callback) => {
//       callback(null, triggerResults, statusResults);
//     });

//     systemController.getCurrentTriggerDefinition(req, res);

//     expect(res.send).toHaveBeenCalledWith({
//       upperThreshold: '250',
//       lowerThreshold: '150',
//       type: 'Warning',
//       IsActive: true
//     });
//   });

//   it('should return 500 on error', () => {
//     systemController.systemService.getCurrentTriggerDefinition = jest.fn((callback) => {
//       callback(new Error('Test error'), null, null);
//     });

//     systemController.getCurrentTriggerDefinition(req, res);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.send).toHaveBeenCalledWith(new Error('Test error'));
//   });

//   it('should return 404 if no status results found', () => {
//     const triggerResults = [{
//       'SQL Original Statement': 'IF sum_current >= 250 THEN INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type) VALUES (1, 2, 3, 4, "Alert"); IF sum_current <= 150 THEN INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type) VALUES (5, 6, 7, 8, "Warning");'
//     }];
//     const statusResults = [];

//     systemController.systemService.getCurrentTriggerDefinition = jest.fn((callback) => {
//       callback(null, triggerResults, statusResults);
//     });

//     systemController.getCurrentTriggerDefinition(req, res);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.send).toHaveBeenCalledWith({ message: 'No status found for the trigger.' });
//   });

//   it('should return "No match found" if no regex matches', () => {
//     const triggerResults = [{
//       'SQL Original Statement': 'INVALID SQL STATEMENT'
//     }];
//     const statusResults = [{ IsActive: true }];

//     systemController.systemService.getCurrentTriggerDefinition = jest.fn((callback) => {
//       callback(null, triggerResults, statusResults);
//     });

//     systemController.getCurrentTriggerDefinition(req, res);

//     expect(res.send).toHaveBeenCalledWith('No match found');
//   });
// });

                //Update
describe('SystemController - updateCurrentThresholds', () => {
  let systemController;
  let req;
  let res;

  beforeEach(() => {
    systemSettingsService.mockClear();
    systemController = new SystemController();
    req = {
      body: {
        newUpperThreshold: '260',
        newLowerThreshold: '140',
        type: 'Alert',
        IsActive: true
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error.mockRestore();
  });

  it('should update current thresholds successfully', () => {
    systemController.systemService.updateCurrentTriggerDefinition = jest.fn((newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(null, {}, {});
    });

    systemController.updateCurrentThresholds(req, res);

    expect(res.send).toHaveBeenCalledWith('Thresholds updated successfully!');
  });

  it('should return 400 if any required field is missing', () => {
    req.body.newUpperThreshold = '';
    systemController.updateCurrentThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });

    req.body.newUpperThreshold = '260';
    req.body.newLowerThreshold = '';
    systemController.updateCurrentThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });

    req.body.newLowerThreshold = '140';
    req.body.type = '';
    systemController.updateCurrentThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });
  });

  it('should return 500 on error', () => {
    systemController.systemService.updateCurrentTriggerDefinition = jest.fn((newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(new Error('Test error'), null, null);
    });

    systemController.updateCurrentThresholds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(new Error('Test error'));
  });
});


//ActiveEnergy

//Get

//Update

describe('SystemController - updateActivePowerThresholds', () => {
  let systemController;
  let req;
  let res;

  beforeEach(() => {
    systemSettingsService.mockClear();
    systemController = new SystemController();
    req = {
      body: {
        newUpperThreshold: '3000',
        newLowerThreshold: '2000',
        type: 'Warning',
        IsActive: true
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error.mockRestore();
  });

  it('should update active power thresholds successfully', () => {
    systemController.systemService.updateActivePowerTriggerDefinition = jest.fn((newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(null, {}, {});
    });

    systemController.updateActivePowerThresholds(req, res);

    expect(res.send).toHaveBeenCalledWith('Thresholds updated successfully!');
  });

  it('should return 400 if any required field is missing', () => {
    req.body.newUpperThreshold = '';
    systemController.updateActivePowerThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });

    req.body.newUpperThreshold = '3000';
    req.body.newLowerThreshold = '';
    systemController.updateActivePowerThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });

    req.body.newLowerThreshold = '2000';
    req.body.type = '';
    systemController.updateActivePowerThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });
  });

  it('should return 500 on error', () => {
    systemController.systemService.updateActivePowerTriggerDefinition = jest.fn((newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(new Error('Test error'), null, null);
    });

    systemController.updateActivePowerThresholds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(new Error('Test error'));
  });
});


//ReactiveEnergy

//Get
//Update


describe('SystemController - updateReactivePowerThresholds', () => {
  let systemController;
  let req;
  let res;

  beforeEach(() => {
    systemSettingsService.mockClear();
    systemController = new SystemController();
    req = {
      body: {
        newUpperThreshold: '500',
        newLowerThreshold: '100',
        type: 'Critical',
        IsActive: true
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error.mockRestore();
  });

  it('should update reactive power thresholds successfully', () => {
    systemController.systemService.updateReactivePowerTriggerDefinition = jest.fn((newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(null, {}, {});
    });

    systemController.updateReactivePowerThresholds(req, res);

    expect(res.send).toHaveBeenCalledWith('Thresholds updated successfully!');
  });

  it('should return 400 if any required field is missing', () => {
    req.body.newUpperThreshold = '';
    systemController.updateReactivePowerThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });

    req.body.newUpperThreshold = '500';
    req.body.newLowerThreshold = '';
    systemController.updateReactivePowerThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });

    req.body.newLowerThreshold = '100';
    req.body.type = '';
    systemController.updateReactivePowerThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });
  });

  it('should return 500 on error', () => {
    systemController.systemService.updateReactivePowerTriggerDefinition = jest.fn((newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(new Error('Test error'), null, null);
    });

    systemController.updateReactivePowerThresholds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(new Error('Test error'));
  });
});

//ApparentPower

//Get

//Update



describe('SystemController - updateApparentPowerThresholds', () => {
  let systemController;
  let req;
  let res;

  beforeEach(() => {
    systemSettingsService.mockClear();
    systemController = new SystemController();
    req = {
      body: {
        newUpperThreshold: '4000',
        newLowerThreshold: '3000',
        type: 'Info',
        IsActive: true
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error.mockRestore();
  });

  it('should update apparent power thresholds successfully', () => {
    systemController.systemService.updateApparentPowerTriggerDefinition = jest.fn((newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(null, {}, {});
    });

    systemController.updateApparentPowerThresholds(req, res);

    expect(res.send).toHaveBeenCalledWith('Thresholds updated successfully!');
  });

  it('should return 400 if any required field is missing', () => {
    req.body.newUpperThreshold = '';
    systemController.updateApparentPowerThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });

    req.body.newUpperThreshold = '4000';
    req.body.newLowerThreshold = '';
    systemController.updateApparentPowerThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });

    req.body.newLowerThreshold = '3000';
    req.body.type = '';
    systemController.updateApparentPowerThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });
  });

  it('should return 500 on error', () => {
    systemController.systemService.updateApparentPowerTriggerDefinition = jest.fn((newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(new Error('Test error'), null, null);
    });

    systemController.updateApparentPowerThresholds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(new Error('Test error'));
  });
});


//PowerFactor

//Get

//Update



describe('SystemController - updatePowerFactorThresholds', () => {
  let systemController;
  let req;
  let res;

  beforeEach(() => {
    systemSettingsService.mockClear();
    systemController = new SystemController();
    req = {
      body: {
        newLowerThreshold: '0.95',
        type: 'Critical',
        IsActive: true
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error.mockRestore();
  });

  it('should update power factor thresholds successfully', () => {
    systemController.systemService.updatePowerFactorTriggerDefinition = jest.fn((newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(null, {}, {});
    });

    systemController.updatePowerFactorThresholds(req, res);

    expect(res.send).toHaveBeenCalledWith('Thresholds updated successfully!');
  });

  it('should return 400 if any required field is missing', () => {
    req.body.newLowerThreshold = '';
    systemController.updatePowerFactorThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });

    req.body.newLowerThreshold = '0.95';
    req.body.type = '';
    systemController.updatePowerFactorThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds cannot be empty.' });
  });

  it('should return 500 on error', () => {
    systemController.systemService.updatePowerFactorTriggerDefinition = jest.fn((newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(new Error('Test error'), null, null);
    });

    systemController.updatePowerFactorThresholds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(new Error('Test error'));
  });
});


//Temperature

//Get

//Update


describe('SystemController - updateTemperatureThresholds', () => {
  let systemController;
  let req;
  let res;

  beforeEach(() => {
    systemSettingsService.mockClear();
    systemController = new SystemController();
    req = {
      body: {
        newUpperThreshold: '30',
        type: 'High',
        IsActive: true
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error.mockRestore();
  });

  it('should update temperature thresholds successfully', () => {
    systemController.systemService.updateTemperatureTriggerDefinition = jest.fn((newUpperThreshold, type, TriggerName, IsActive, callback) => {
      callback(null, {}, {});
    });

    systemController.updateTemperatureThresholds(req, res);

    expect(res.send).toHaveBeenCalledWith('Thresholds updated successfully!');
  });

  it('should return 400 if any required field is missing', () => {
    req.body.newUpperThreshold = '';
    systemController.updateTemperatureThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Threshold and type cannot be empty.' });

    req.body.newUpperThreshold = '30';
    req.body.type = '';
    systemController.updateTemperatureThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Threshold and type cannot be empty.' });
  });

  it('should return 500 on error', () => {
    systemController.systemService.updateTemperatureTriggerDefinition = jest.fn((newUpperThreshold, type, TriggerName, IsActive, callback) => {
      callback(new Error('Test error'), null, null);
    });

    systemController.updateTemperatureThresholds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(new Error('Test error'));
  });
});


//Units

//Get

//Update


describe('SystemController - updateLowEnergyUnitsThresholds', () => {
  let systemController;
  let req;
  let res;

  beforeEach(() => {
    systemSettingsService.mockClear();
    systemController = new SystemController();
    req = {
      body: {
        newUpperThreshold: '1000',
        newLowerThreshold: '500',
        type: 'Low',
        IsActive: true
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error.mockRestore();
  });

  it('should update low energy units thresholds successfully', () => {
    systemController.systemService.updateLowEnergyUnitsTriggerDefinition = jest.fn((newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(null, {}, {});
    });

    systemController.updateLowEnergyUnitsThresholds(req, res);

    expect(res.send).toHaveBeenCalledWith('Thresholds updated successfully!');
  });

  it('should return 400 if any required field is missing', () => {
    req.body.newLowerThreshold = '';
    systemController.updateLowEnergyUnitsThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds and type cannot be empty.' });

    req.body.newLowerThreshold = '500';
    req.body.newUpperThreshold = '';
    systemController.updateLowEnergyUnitsThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds and type cannot be empty.' });

    req.body.newUpperThreshold = '1000';
    req.body.type = '';
    systemController.updateLowEnergyUnitsThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thresholds and type cannot be empty.' });
  });

  it('should return 500 on error', () => {
    systemController.systemService.updateLowEnergyUnitsTriggerDefinition = jest.fn((newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(new Error('Test error'), null, null);
    });

    systemController.updateLowEnergyUnitsThresholds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(new Error('Test error'));
  });
});


//Frequency

//Get

//Update


describe('SystemController - updateFrequencyDeviationThresholds', () => {
  let systemController;
  let req;
  let res;

  beforeEach(() => {
    systemSettingsService.mockClear();
    systemController = new SystemController();
    req = {
      body: {
        newLowerThreshold: '0.1',
        type: 'High',
        IsActive: true
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error.mockRestore();
  });

  it('should update frequency deviation thresholds successfully', () => {
    systemController.systemService.updateFrequencyDeviationTriggerDefinition = jest.fn((newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(null, {}, {});
    });

    systemController.updateFrequencyDeviationThresholds(req, res);

    expect(res.send).toHaveBeenCalledWith('Thresholds updated successfully!');
  });

  it('should return 400 if any required field is missing', () => {
    req.body.newLowerThreshold = '';
    systemController.updateFrequencyDeviationThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Threshold and type cannot be empty.' });

    req.body.newLowerThreshold = '0.1';
    req.body.type = '';
    systemController.updateFrequencyDeviationThresholds(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Threshold and type cannot be empty.' });
  });

  it('should return 500 on error', () => {
    systemController.systemService.updateFrequencyDeviationTriggerDefinition = jest.fn((newLowerThreshold, type, TriggerName, IsActive, callback) => {
      callback(new Error('Test error'), null, null);
    });

    systemController.updateFrequencyDeviationThresholds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(new Error('Test error'));
  });
});
