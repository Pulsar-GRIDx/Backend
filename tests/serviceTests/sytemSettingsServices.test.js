// const SystemService = require('../../systemSettings/systemSettingsService'); // Adjust the path as needed
// const mockDb = require('../../config/db');

// // jest.mock('../../config/db'); // Mock the db module

// jest.mock('../../config/db', () => ({
//     query: jest.fn()
//   }));

// //Voltage

// describe('SystemService - getVoltageTriggerDefinition', () => {
//     let systemService;

//     beforeEach(() => {
//         systemService = new SystemService();
//     });

//     describe('getVoltageTriggerDefinition', () => {
//         it('should return trigger and status results when queries succeed', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const statusResults = [{ IsActive: 1 }];

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults))
//                 .mockImplementationOnce((query, callback) => callback(null, statusResults));

//             systemService.getVoltageTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeNull();
//                 expect(triggers).toEqual(triggerResults);
//                 expect(status).toEqual(statusResults);
//                 done();
//             });
//         });

//         it('should return an error when the first query fails', done => {
//             const errorMessage = 'Error in first query';

//             mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.getVoltageTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });

//         it('should return an error when the second query fails', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const errorMessage = 'Error in second query';

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults))
//                 .mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.getVoltageTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });
//     });

//     describe('updateVoltageTriggerDefinition', () => {
//         it('should update the trigger and status successfully', done => {
//             const newUpperThreshold = 240;
//             const newLowerThreshold = 180;
//             const type = 'warning';
//             const TriggerName = 'LowAndHighVoltageTrigger';
//             const IsActive = true;

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, {}))
//                 .mockImplementationOnce((query, callback) => callback(null, {}))
//                 .mockImplementationOnce((query, callback) => callback(null, {}));

//             systemService.updateVoltageTriggerDefinition(
//                 newUpperThreshold,
//                 newLowerThreshold,
//                 type,
//                 TriggerName,
//                 IsActive,
//                 (error, message) => {
//                     expect(error).toBeNull();
//                     expect(message).toBe('Trigger and status updated successfully!');
//                     done();
//                 }
//             );
//         });

//         it('should return an error if the DROP TRIGGER query fails', done => {
//             const errorMessage = 'Error in DROP TRIGGER query';

//             mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.updateVoltageTriggerDefinition(
//                 240,
//                 180,
//                 'warning',
//                 'LowAndHighVoltageTrigger',
//                 true,
//                 (error, message) => {
//                     expect(error).toBeTruthy();
//                     expect(error.message).toBe(errorMessage);
//                     done();
//                 }
//             );
//         });

//         it('should return an error if the CREATE TRIGGER query fails', done => {
//             const errorMessage = 'Error in CREATE TRIGGER query';

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, {}))
//                 .mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.updateVoltageTriggerDefinition(
//                 240,
//                 180,
//                 'warning',
//                 'LowAndHighVoltageTrigger',
//                 true,
//                 (error, message) => {
//                     expect(error).toBeTruthy();
//                     expect(error.message).toBe(errorMessage);
//                     done();
//                 }
//             );
//         });

//         it('should return an error if the update status query fails', done => {
//             const errorMessage = 'Error in update status query';

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, {}))
//                 .mockImplementationOnce((query, callback) => callback(null, {}))
//                 .mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.updateVoltageTriggerDefinition(
//                 240,
//                 180,
//                 'warning',
//                 'LowAndHighVoltageTrigger',
//                 true,
//                 (error, message) => {
//                     expect(error).toBeTruthy();
//                     expect(error.message).toBe(errorMessage);
//                     done();
//                 }
//             );
//         });
//     });
// });



// describe('SystemService - updateVoltageThresholds', () => {
//     let systemService;
  
//     beforeEach(() => {
//       systemService = new SystemService(mockDb);
//     //   systemService = new SystemService(mockDb);
//       jest.clearAllMocks();
//     });
  
//     afterEach(() => {
//       jest.clearAllMocks();
//     });
  
//     describe('updateVoltageTriggerDefinition', () => {
//       it('should update trigger and status successfully', (done) => {
//         const newUpperThreshold = 240;
//         const newLowerThreshold = 180;
//         const type = 'TypeA';
//         const TriggerName = 'VoltageTrigger';
//         const IsActive = true;
  
//         const mockResults = { affectedRows: 1 };
  
//         mockDb.query
//           .mockImplementationOnce((query, callback) => {
           
//             callback(null, mockResults);
//           })
//           .mockImplementationOnce((query, callback) => {
           
//             callback(null, mockResults);
//           })
//           .mockImplementationOnce((query, callback) => {
          
//             callback(null, mockResults);
//           });
  
//         systemService.updateVoltageTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//         //   console.log('Error:', error);
//         //   console.log('Result:', result);
//           expect(error).toBeNull();
//           expect(result).toBe('Trigger and status updated successfully!');
//           expect(mockDb.query).toHaveBeenCalledTimes(3);
//           expect(mockDb.query).toHaveBeenNthCalledWith(1, 'DROP TRIGGER IF EXISTS LowAndHighVoltageTrigger;', expect.any(Function));
//           expect(mockDb.query).toHaveBeenNthCalledWith(2, expect.stringContaining('CREATE TRIGGER LowAndHighVoltageTrigger'), expect.any(Function));
//           expect(mockDb.query).toHaveBeenNthCalledWith(3, expect.stringContaining(`INSERT INTO TriggerStatus (TriggerName, IsActive)`), expect.any(Function));
//           done();
//         });
//       });
  
//       it('should handle errors when dropping the trigger', (done) => {
//         const newUpperThreshold = 240;
//         const newLowerThreshold = 180;
//         const type = 'TypeA';
//         const TriggerName = 'VoltageTrigger';
//         const IsActive = true;
  
//         const mockError = new Error('Error dropping trigger');
  
//         mockDb.query
//           .mockImplementationOnce((query, callback) => callback(mockError));
  
//         systemService.updateVoltageTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//           expect(error).toBe(mockError);
//           expect(result).toBeUndefined();
//           expect(mockDb.query).toHaveBeenCalledTimes(1);
//           done();
//         });
//       });
  
//       it('should handle errors when creating the trigger', (done) => {
//         const newUpperThreshold = 240;
//         const newLowerThreshold = 180;
//         const type = 'TypeA';
//         const TriggerName = 'VoltageTrigger';
//         const IsActive = true;
  
//         const mockResults = { affectedRows: 1 };
//         const mockError = new Error('Error creating trigger');
  
//         mockDb.query
//           .mockImplementationOnce((query, callback) => callback(null, mockResults)) // DROP TRIGGER
//           .mockImplementationOnce((query, callback) => callback(mockError)); // CREATE TRIGGER
  
//         systemService.updateVoltageTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//           expect(error).toBe(mockError);
//           expect(result).toBeUndefined();
//           expect(mockDb.query).toHaveBeenCalledTimes(2);
//           done();
//         });
//       });
  
//       it('should handle errors when updating the trigger status', (done) => {
//         const newUpperThreshold = 240;
//         const newLowerThreshold = 180;
//         const type = 'TypeA';
//         const TriggerName = 'VoltageTrigger';
//         const IsActive = true;
  
//         const mockResults = { affectedRows: 1 };
//         const mockError = new Error('Error updating trigger status');
  
//         mockDb.query
//           .mockImplementationOnce((query, callback) => callback(null, mockResults)) // DROP TRIGGER
//           .mockImplementationOnce((query, callback) => callback(null, mockResults)) // CREATE TRIGGER
//           .mockImplementationOnce((query, callback) => callback(mockError)); // INSERT/UPDATE TriggerStatus
  
//         systemService.updateVoltageTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//           expect(error).toBe(mockError);
//           expect(result).toBeUndefined();
//           expect(mockDb.query).toHaveBeenCalledTimes(3);
//           done();
//         });
//       });
//     });
//   });





// //Current


// describe('SystemService - getCurrentTriggerDefinition', () => {
//     let systemService;

//     beforeEach(() => {
//         systemService = new SystemService();
//     });

//     describe('getCurrentTriggerDefinition', () => {
//         it('should return trigger and status results when queries succeed', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const statusResults = [{ IsActive: 1 }];

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults))
//                 .mockImplementationOnce((query, callback) => callback(null, statusResults));

//             systemService.getCurrentTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeNull();
//                 expect(triggers).toEqual(triggerResults);
//                 expect(status).toEqual(statusResults);
//                 done();
//             });
//         });

//         it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
//             const errorMessage = 'Error in SHOW CREATE TRIGGER query';

//             mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.getCurrentTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });

//         it('should return an error when the SELECT IsActive query fails', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const errorMessage = 'Error in SELECT IsActive query';

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults))
//                 .mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.getCurrentTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });
//     });
// });


// describe('SystemService - updateCurrentThresholds', () => {
//     let systemService;

//     beforeEach(() => {
//               systemService = new SystemService(mockDb);
//             //   systemService = new SystemService(mockDb);
//               jest.clearAllMocks();
//             });
          
//             afterEach(() => {
//               jest.clearAllMocks();
//             });

//     describe('updateCurrentTriggerDefinition', () => {
//         it('should update trigger and status successfully', (done) => {
//             const newUpperThreshold = 100;
//             const newLowerThreshold = 20;
//             const type = 'TypeA';
//             const TriggerName = 'CurrentOverload';
//             const IsActive = true;

//             const mockResults = { affectedRows: 1 };

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults);
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults);
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults);
//                 });

//             systemService.updateCurrentTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBeNull();
//                 expect(result).toBe('Trigger and status updated successfully!');
//                 expect(mockDb.query).toHaveBeenCalledTimes(3);
//                 expect(mockDb.query).toHaveBeenNthCalledWith(1, 'DROP TRIGGER IF EXISTS CurrentOverload', expect.any(Function));
//                 expect(mockDb.query).toHaveBeenNthCalledWith(2, expect.stringContaining('CREATE TRIGGER CurrentOverload'), expect.any(Function));
//                 expect(mockDb.query).toHaveBeenNthCalledWith(3, expect.stringContaining(`INSERT INTO TriggerStatus (TriggerName, IsActive)`), expect.any(Function));
//                 done();
//             }, 10000);
//         });

//         it('should handle errors when dropping the trigger', (done) => {
//             const newUpperThreshold = 100;
//             const newLowerThreshold = 20;
//             const type = 'TypeA';
//             const TriggerName = 'CurrentOverload';
//             const IsActive = true;

//             const mockError = new Error('Error dropping trigger');

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(mockError));

//             systemService.updateCurrentTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBe(mockError);
//                 expect(result).toBeUndefined();
//                 expect(mockDb.query).toHaveBeenCalledTimes(1);
//                 done();
//             });
//         });

//         it('should handle errors when creating the trigger', (done) => {
//             const newUpperThreshold = 100;
//             const newLowerThreshold = 20;
//             const type = 'TypeA';
//             const TriggerName = 'CurrentOverload';
//             const IsActive = true;

//             const mockResults = { affectedRows: 1 };
//             const mockError = new Error('Error creating trigger');

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, mockResults)) // DROP TRIGGER
//                 .mockImplementationOnce((query, callback) => callback(mockError)); // CREATE TRIGGER

//             systemService.updateCurrentTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBe(mockError);
//                 expect(result).toBeUndefined();
//                 expect(mockDb.query).toHaveBeenCalledTimes(2);
//                 done();
//             });
//         });

//         it('should handle errors when updating the trigger status', (done) => {
//             const newUpperThreshold = 100;
//             const newLowerThreshold = 20;
//             const type = 'TypeA';
//             const TriggerName = 'CurrentOverload';
//             const IsActive = true;

//             const mockResults = { affectedRows: 1 };
//             const mockError = new Error('Error updating trigger status');

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, mockResults)) // DROP TRIGGER
//                 .mockImplementationOnce((query, callback) => callback(null, mockResults)) // CREATE TRIGGER
//                 .mockImplementationOnce((query, callback) => callback(mockError)); // INSERT/UPDATE TriggerStatus

//             systemService.updateCurrentTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBe(mockError);
//                 expect(result).toBeUndefined();
//                 expect(mockDb.query).toHaveBeenCalledTimes(3);
//                 done();
//             }, 10000);
//         });
//     });
// });

// //ActivePower


// describe('SystemService getActivePowerTriggerDefinition', () => {
//     let systemService;

//     beforeEach(() => {
//         systemService = new SystemService();
//     });

//     describe('getActivePowerTriggerDefinition', () => {
//         it('should return trigger and status results when queries succeed', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const statusResults = [{ IsActive: 1 }];

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

//             systemService.getActivePowerTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeNull();
//                 expect(triggers).toEqual(triggerResults);
//                 expect(status).toEqual(statusResults);
//                 done();
//             });
//         });

//         it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
//             const errorMessage = 'Error in SHOW CREATE TRIGGER query';

//             mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.getActivePowerTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });

//         it('should return an error when the SELECT IsActive query fails', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const errorMessage = 'Error in SELECT IsActive query';

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

//             systemService.getActivePowerTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });
//     });
// });


// describe('SystemService - updateActiveEnergyThresholds', () => {
//     let systemService;

//     beforeEach(() => {
//         systemService = new SystemService(mockDb);
//         jest.clearAllMocks(); // Reset mocks before each test
//     });

//     afterEach(() => {
//         jest.clearAllMocks(); // Clear mocks after each test
//     });

//     describe('updateActivePowerTriggerDefinition', () => {
//         it('should update trigger and status successfully', (done) => {
//             const newUpperThreshold = 200;
//             const newLowerThreshold = 100;
//             const type = 'TypeA';
//             const TriggerName = 'HighAndLowActivePower';
//             const IsActive = true;

//             const mockResults = { affectedRows: 1 };

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // DROP TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // CREATE TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // INSERT/UPDATE TriggerStatus
//                 });

//             systemService.updateActivePowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBeNull();
//                 expect(result).toBe('Trigger and status updated successfully!');
//                 expect(mockDb.query).toHaveBeenCalledTimes(3);
//                 expect(mockDb.query).toHaveBeenNthCalledWith(1, 'DROP TRIGGER IF EXISTS HighAndLowActivePower;', expect.any(Function));
//                 expect(mockDb.query).toHaveBeenNthCalledWith(2, expect.stringContaining('CREATE TRIGGER HighAndLowActivePower'), expect.any(Function));
//                 expect(mockDb.query).toHaveBeenNthCalledWith(3, expect.stringContaining(`INSERT INTO TriggerStatus (TriggerName, IsActive)`), expect.any(Function));
//                 done();
//             });
//         });

//         it('should handle errors when dropping the trigger', (done) => {
//             const newUpperThreshold = 200;
//             const newLowerThreshold = 100;
//             const type = 'TypeA';
//             const TriggerName = 'HighAndLowActivePower';
//             const IsActive = true;

//             const mockError = new Error('Error dropping trigger');

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(mockError);
//                 });

//             systemService.updateActivePowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBe(mockError);
//                 expect(result).toBeUndefined();
//                 expect(mockDb.query).toHaveBeenCalledTimes(1);
//                 done();
//             });
//         });

//         it('should handle errors when creating the trigger', (done) => {
//             const newUpperThreshold = 200;
//             const newLowerThreshold = 100;
//             const type = 'TypeA';
//             const TriggerName = 'HighAndLowActivePower';
//             const IsActive = true;

//             const mockResults = { affectedRows: 1 };
//             const mockError = new Error('Error creating trigger');

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // DROP TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(mockError); // CREATE TRIGGER
//                 });

//             systemService.updateActivePowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBe(mockError);
//                 expect(result).toBeUndefined();
//                 expect(mockDb.query).toHaveBeenCalledTimes(2);
//                 done();
//             });
//         });

//         it('should handle errors when updating the trigger status', (done) => {
//             const newUpperThreshold = 200;
//             const newLowerThreshold = 100;
//             const type = 'TypeA';
//             const TriggerName = 'HighAndLowActivePower';
//             const IsActive = true;

//             const mockResults = { affectedRows: 1 };
//             const mockError = new Error('Error updating trigger status');

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // DROP TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // CREATE TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(mockError); // INSERT/UPDATE TriggerStatus
//                 });

//             systemService.updateActivePowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBe(mockError);
//                 expect(result).toBeUndefined();
//                 expect(mockDb.query).toHaveBeenCalledTimes(3);
//                 done();
//             });
//         });
//     });
// });

// //ReactivePower



// describe('SystemService - getReactivePowerTriggerDefinition', () => {
//     let systemService;

//     beforeEach(() => {
//         systemService = new SystemService();
//     });

//     describe('getReactivePowerTriggerDefinition', () => {
//         it('should return trigger and status results when queries succeed', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const statusResults = [{ IsActive: 1 }];

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

//             systemService.getReactivePowerTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeNull();
//                 expect(triggers).toEqual(triggerResults);
//                 expect(status).toEqual(statusResults);
//                 done();
//             });
//         });

//         it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
//             const errorMessage = 'Error in SHOW CREATE TRIGGER query';

//             mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.getReactivePowerTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });

//         it('should return an error when the SELECT IsActive query fails', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const errorMessage = 'Error in SELECT IsActive query';

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

//             systemService.getReactivePowerTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });
//     });
// });



// describe('SystemService', () => {
//     let systemService;

//     beforeEach(() => {
//         systemService = new SystemService();
//         jest.clearAllMocks(); // Reset mocks before each test
//     });

//     afterEach(() => {
//         jest.clearAllMocks(); // Clear mocks after each test
//     });

//     describe('updateReactivePowerTriggerDefinition', () => {
//         it('should update trigger and status successfully', (done) => {
//             const newUpperThreshold = 300;
//             const newLowerThreshold = 100;
//             const type = 'TypeA';
//             const TriggerName = 'ReacTivePowerTrigger';
//             const IsActive = true;

//             const mockResults = { affectedRows: 1 };

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // DROP TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // CREATE TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // INSERT/UPDATE TriggerStatus
//                 });

//             systemService.updateReactivePowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBeNull();
//                 expect(result).toBe('Trigger and status updated successfully!');
//                 expect(mockDb.query).toHaveBeenCalledTimes(3);
//                 expect(mockDb.query).toHaveBeenNthCalledWith(1, 'DROP TRIGGER IF EXISTS ReacTivePowerTrigger;', expect.any(Function));
//                 expect(mockDb.query).toHaveBeenNthCalledWith(2, expect.stringContaining('CREATE TRIGGER ReacTivePowerTrigger'), expect.any(Function));
//                 expect(mockDb.query).toHaveBeenNthCalledWith(3, expect.stringContaining(`INSERT INTO TriggerStatus (TriggerName, IsActive)`), expect.any(Function));
//                 done();
//             });
//         });

//         it('should handle errors when dropping the trigger', (done) => {
//             const newUpperThreshold = 300;
//             const newLowerThreshold = 100;
//             const type = 'TypeA';
//             const TriggerName = 'ReacTivePowerTrigger';
//             const IsActive = true;

//             const mockError = new Error('Error dropping trigger');

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(mockError);
//                 });

//             systemService.updateReactivePowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBe(mockError);
//                 expect(result).toBeUndefined();
//                 expect(mockDb.query).toHaveBeenCalledTimes(1);
//                 done();
//             });
//         });

//         it('should handle errors when creating the trigger', (done) => {
//             const newUpperThreshold = 300;
//             const newLowerThreshold = 100;
//             const type = 'TypeA';
//             const TriggerName = 'ReacTivePowerTrigger';
//             const IsActive = true;

//             const mockResults = { affectedRows: 1 };
//             const mockError = new Error('Error creating trigger');

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // DROP TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(mockError); // CREATE TRIGGER
//                 });

//             systemService.updateReactivePowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBe(mockError);
//                 expect(result).toBeUndefined();
//                 expect(mockDb.query).toHaveBeenCalledTimes(2);
//                 done();
//             });
//         });

//         it('should handle errors when updating the trigger status', (done) => {
//             const newUpperThreshold = 300;
//             const newLowerThreshold = 100;
//             const type = 'TypeA';
//             const TriggerName = 'ReacTivePowerTrigger';
//             const IsActive = true;

//             const mockResults = { affectedRows: 1 };
//             const mockError = new Error('Error updating trigger status');

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // DROP TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // CREATE TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(mockError); // INSERT/UPDATE TriggerStatus
//                 });

//             systemService.updateReactivePowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBe(mockError);
//                 expect(result).toBeUndefined();
//                 expect(mockDb.query).toHaveBeenCalledTimes(3);
//                 done();
//             });
//         });
//     });
// });


// //ApparentPower



// describe('SystemService - getApparentPowerTriggerDefinition', () => {
//     let systemService;

//     beforeEach(() => {
//         systemService = new SystemService();
//     });

//     describe('getApparentPowerTriggerDefinition', () => {
//         it('should return trigger and status results when queries succeed', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const statusResults = [{ IsActive: 1 }];

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

//             systemService.getApparentPowerTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeNull();
//                 expect(triggers).toEqual(triggerResults);
//                 expect(status).toEqual(statusResults);
//                 done();
//             });
//         });

//         it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
//             const errorMessage = 'Error in SHOW CREATE TRIGGER query';

//             mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.getApparentPowerTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });

//         it('should return an error when the SELECT IsActive query fails', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const errorMessage = 'Error in SELECT IsActive query';

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

//             systemService.getApparentPowerTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });
//     });
// });

// describe('SystemService - updateApparentPowerThresholds', () => {
//     let systemService;

//     beforeEach(() => {
//         systemService = new SystemService();
//         jest.clearAllMocks(); // Reset mocks before each test
//     });

//     afterEach(() => {
//         jest.clearAllMocks(); // Clear mocks after each test
//     });

//     describe('updateApparentPowerTriggerDefinition', () => {
//         it('should update trigger and status successfully', (done) => {
//             const newUpperThreshold = 500;
//             const newLowerThreshold = 100;
//             const type = 'TypeB';
//             const TriggerName = 'ApparentPowerTrigger';
//             const IsActive = true;

//             const mockResults = { affectedRows: 1 };

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // DROP TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // CREATE TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // INSERT/UPDATE TriggerStatus
//                 });

//             systemService.updateApparentPowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBeNull();
//                 expect(result).toBe('Trigger and status updated successfully!');
//                 expect(mockDb.query).toHaveBeenCalledTimes(3);
//                 expect(mockDb.query).toHaveBeenNthCalledWith(1, 'DROP TRIGGER IF EXISTS ApparentPowerTrigger;', expect.any(Function));
//                 expect(mockDb.query).toHaveBeenNthCalledWith(2, expect.stringContaining('CREATE TRIGGER ApparentPowerTrigger'), expect.any(Function));
//                 expect(mockDb.query).toHaveBeenNthCalledWith(3, expect.stringContaining(`INSERT INTO TriggerStatus (TriggerName, IsActive)`), expect.any(Function));
//                 done();
//             });
//         });

//         it('should handle errors when dropping the trigger', (done) => {
//             const newUpperThreshold = 500;
//             const newLowerThreshold = 100;
//             const type = 'TypeB';
//             const TriggerName = 'ApparentPowerTrigger';
//             const IsActive = true;

//             const mockError = new Error('Error dropping trigger');

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(mockError);
//                 });

//             systemService.updateApparentPowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBe(mockError);
//                 expect(result).toBeUndefined();
//                 expect(mockDb.query).toHaveBeenCalledTimes(1);
//                 done();
//             });
//         });

//         it('should handle errors when creating the trigger', (done) => {
//             const newUpperThreshold = 500;
//             const newLowerThreshold = 100;
//             const type = 'TypeB';
//             const TriggerName = 'ApparentPowerTrigger';
//             const IsActive = true;

//             const mockResults = { affectedRows: 1 };
//             const mockError = new Error('Error creating trigger');

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // DROP TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(mockError); // CREATE TRIGGER
//                 });

//             systemService.updateApparentPowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBe(mockError);
//                 expect(result).toBeUndefined();
//                 expect(mockDb.query).toHaveBeenCalledTimes(2);
//                 done();
//             });
//         });

//         it('should handle errors when updating the trigger status', (done) => {
//             const newUpperThreshold = 500;
//             const newLowerThreshold = 100;
//             const type = 'TypeB';
//             const TriggerName = 'ApparentPowerTrigger';
//             const IsActive = true;

//             const mockResults = { affectedRows: 1 };
//             const mockError = new Error('Error updating trigger status');

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // DROP TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(null, mockResults); // CREATE TRIGGER
//                 })
//                 .mockImplementationOnce((query, callback) => {
//                     callback(mockError); // INSERT/UPDATE TriggerStatus
//                 });

//             systemService.updateApparentPowerTriggerDefinition(newUpperThreshold, newLowerThreshold, type, TriggerName, IsActive, (error, result) => {
//                 expect(error).toBe(mockError);
//                 expect(result).toBeUndefined();
//                 expect(mockDb.query).toHaveBeenCalledTimes(3);
//                 done();
//             });
//         });
//     });
// });
// //PowerFactor


// describe('SystemService - getPowerFactorTriggerDefinition', () => {
//     let systemService;

//     beforeEach(() => {
//         systemService = new SystemService();
//     });

//     describe('getPowerFactorTriggerDefinition', () => {
//         it('should return trigger and status results when queries succeed', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const statusResults = [{ IsActive: 1 }];

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

//             systemService.getPowerFactorTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeNull();
//                 expect(triggers).toEqual(triggerResults);
//                 expect(status).toEqual(statusResults);
//                 done();
//             });
//         });

//         it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
//             const errorMessage = 'Error in SHOW CREATE TRIGGER query';

//             mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.getPowerFactorTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });

//         it('should return an error when the SELECT IsActive query fails', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const errorMessage = 'Error in SELECT IsActive query';

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

//             systemService.getPowerFactorTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });
//     });
// });


// //Temperature


// describe('SystemService - getTemperatureTriggerDefinition', () => {
//     let systemService;

//     beforeEach(() => {
//         systemService = new SystemService();
//     });

//     describe('getTemperatureTriggerDefinition', () => {
//         it('should return trigger and status results when queries succeed', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const statusResults = [{ IsActive: 1 }];

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

//             systemService.getTemperatureTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeNull();
//                 expect(triggers).toEqual(triggerResults);
//                 expect(status).toEqual(statusResults);
//                 done();
//             });
//         });

//         it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
//             const errorMessage = 'Error in SHOW CREATE TRIGGER query';

//             mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.getTemperatureTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });

//         it('should return an error when the SELECT IsActive query fails', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const errorMessage = 'Error in SELECT IsActive query';

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

//             systemService.getTemperatureTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });
//     });
// });

// //Units



// describe('SystemService - getUnitsTriggerDefinition', () => {
//     let systemService;

//     beforeEach(() => {
//         systemService = new SystemService();
//     });

//     describe('getLowEnergyUnitsTriggerDefinition', () => {
//         it('should return trigger and status results when queries succeed', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const statusResults = [{ IsActive: 1 }];

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

//             systemService.getLowEnergyUnitsTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeNull();
//                 expect(triggers).toEqual(triggerResults);
//                 expect(status).toEqual(statusResults);
//                 done();
//             });
//         });

//         it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
//             const errorMessage = 'Error in SHOW CREATE TRIGGER query';

//             mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.getLowEnergyUnitsTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });

//         it('should return an error when the SELECT IsActive query fails', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const errorMessage = 'Error in SELECT IsActive query';

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

//             systemService.getLowEnergyUnitsTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });
//     });
// });


// //Frequency



// describe('SystemService- getFrequencyTriggerDefinition', () => {
//     let systemService;

//     beforeEach(() => {
//         systemService = new SystemService();
//     });

//     describe('getFrequencyDeviationTriggerDefinition', () => {
//         it('should return trigger and status results when queries succeed', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const statusResults = [{ IsActive: 1 }];

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

//             systemService.getFrequencyDeviationTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeNull();
//                 expect(triggers).toEqual(triggerResults);
//                 expect(status).toEqual(statusResults);
//                 done();
//             });
//         });

//         it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
//             const errorMessage = 'Error in SHOW CREATE TRIGGER query';

//             mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

//             systemService.getFrequencyDeviationTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });

//         it('should return an error when the SELECT IsActive query fails', done => {
//             const triggerResults = [{ /* mock trigger results */ }];
//             const errorMessage = 'Error in SELECT IsActive query';

//             mockDb.query
//                 .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
//                 .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

//             systemService.getFrequencyDeviationTriggerDefinition((error, triggers, status) => {
//                 expect(error).toBeTruthy();
//                 expect(error.message).toBe(errorMessage);
//                 done();
//             });
//         });
//     });
// });
