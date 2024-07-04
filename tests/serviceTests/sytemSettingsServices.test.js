const SystemService = require('../../systemSettings/systemSettingsService'); // Adjust the path as needed
const mockDb = require('../../config/db');

jest.mock('../../config/db'); // Mock the db module

//Voltage

describe('SystemService - getVoltageTriggerDefinition', () => {
    let systemService;

    beforeEach(() => {
        systemService = new SystemService();
    });

    describe('getVoltageTriggerDefinition', () => {
        it('should return trigger and status results when queries succeed', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const statusResults = [{ IsActive: 1 }];

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults))
                .mockImplementationOnce((query, callback) => callback(null, statusResults));

            systemService.getVoltageTriggerDefinition((error, triggers, status) => {
                expect(error).toBeNull();
                expect(triggers).toEqual(triggerResults);
                expect(status).toEqual(statusResults);
                done();
            });
        });

        it('should return an error when the first query fails', done => {
            const errorMessage = 'Error in first query';

            mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.getVoltageTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });

        it('should return an error when the second query fails', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const errorMessage = 'Error in second query';

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults))
                .mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.getVoltageTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });
    });

    describe('updateVoltageTriggerDefinition', () => {
        it('should update the trigger and status successfully', done => {
            const newUpperThreshold = 240;
            const newLowerThreshold = 180;
            const type = 'warning';
            const TriggerName = 'LowAndHighVoltageTrigger';
            const IsActive = true;

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, {}))
                .mockImplementationOnce((query, callback) => callback(null, {}))
                .mockImplementationOnce((query, callback) => callback(null, {}));

            systemService.updateVoltageTriggerDefinition(
                newUpperThreshold,
                newLowerThreshold,
                type,
                TriggerName,
                IsActive,
                (error, message) => {
                    expect(error).toBeNull();
                    expect(message).toBe('Trigger and status updated successfully!');
                    done();
                }
            );
        });

        it('should return an error if the DROP TRIGGER query fails', done => {
            const errorMessage = 'Error in DROP TRIGGER query';

            mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.updateVoltageTriggerDefinition(
                240,
                180,
                'warning',
                'LowAndHighVoltageTrigger',
                true,
                (error, message) => {
                    expect(error).toBeTruthy();
                    expect(error.message).toBe(errorMessage);
                    done();
                }
            );
        });

        it('should return an error if the CREATE TRIGGER query fails', done => {
            const errorMessage = 'Error in CREATE TRIGGER query';

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, {}))
                .mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.updateVoltageTriggerDefinition(
                240,
                180,
                'warning',
                'LowAndHighVoltageTrigger',
                true,
                (error, message) => {
                    expect(error).toBeTruthy();
                    expect(error.message).toBe(errorMessage);
                    done();
                }
            );
        });

        it('should return an error if the update status query fails', done => {
            const errorMessage = 'Error in update status query';

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, {}))
                .mockImplementationOnce((query, callback) => callback(null, {}))
                .mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.updateVoltageTriggerDefinition(
                240,
                180,
                'warning',
                'LowAndHighVoltageTrigger',
                true,
                (error, message) => {
                    expect(error).toBeTruthy();
                    expect(error.message).toBe(errorMessage);
                    done();
                }
            );
        });
    });
});



//current
describe('SystemService - getCurrentTriggerDefinition', () => {
    let systemService;

    beforeEach(() => {
        systemService = new SystemService();
    });

    describe('getCurrentTriggerDefinition', () => {
        it('should return trigger and status results when queries succeed', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const statusResults = [{ IsActive: 1 }];

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults))
                .mockImplementationOnce((query, callback) => callback(null, statusResults));

            systemService.getCurrentTriggerDefinition((error, triggers, status) => {
                expect(error).toBeNull();
                expect(triggers).toEqual(triggerResults);
                expect(status).toEqual(statusResults);
                done();
            });
        });

        it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
            const errorMessage = 'Error in SHOW CREATE TRIGGER query';

            mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.getCurrentTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });

        it('should return an error when the SELECT IsActive query fails', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const errorMessage = 'Error in SELECT IsActive query';

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults))
                .mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.getCurrentTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });
    });
});


//ActivePower


describe('SystemService getActivePowerTriggerDefinition', () => {
    let systemService;

    beforeEach(() => {
        systemService = new SystemService();
    });

    describe('getActivePowerTriggerDefinition', () => {
        it('should return trigger and status results when queries succeed', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const statusResults = [{ IsActive: 1 }];

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

            systemService.getActivePowerTriggerDefinition((error, triggers, status) => {
                expect(error).toBeNull();
                expect(triggers).toEqual(triggerResults);
                expect(status).toEqual(statusResults);
                done();
            });
        });

        it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
            const errorMessage = 'Error in SHOW CREATE TRIGGER query';

            mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.getActivePowerTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });

        it('should return an error when the SELECT IsActive query fails', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const errorMessage = 'Error in SELECT IsActive query';

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

            systemService.getActivePowerTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });
    });
});


//ReactivePower



describe('SystemService - getReactivePowerTriggerDefinition', () => {
    let systemService;

    beforeEach(() => {
        systemService = new SystemService();
    });

    describe('getReactivePowerTriggerDefinition', () => {
        it('should return trigger and status results when queries succeed', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const statusResults = [{ IsActive: 1 }];

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

            systemService.getReactivePowerTriggerDefinition((error, triggers, status) => {
                expect(error).toBeNull();
                expect(triggers).toEqual(triggerResults);
                expect(status).toEqual(statusResults);
                done();
            });
        });

        it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
            const errorMessage = 'Error in SHOW CREATE TRIGGER query';

            mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.getReactivePowerTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });

        it('should return an error when the SELECT IsActive query fails', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const errorMessage = 'Error in SELECT IsActive query';

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

            systemService.getReactivePowerTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });
    });
});

//ApparentPower



describe('SystemService - getApparentPowerTriggerDefinition', () => {
    let systemService;

    beforeEach(() => {
        systemService = new SystemService();
    });

    describe('getApparentPowerTriggerDefinition', () => {
        it('should return trigger and status results when queries succeed', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const statusResults = [{ IsActive: 1 }];

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

            systemService.getApparentPowerTriggerDefinition((error, triggers, status) => {
                expect(error).toBeNull();
                expect(triggers).toEqual(triggerResults);
                expect(status).toEqual(statusResults);
                done();
            });
        });

        it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
            const errorMessage = 'Error in SHOW CREATE TRIGGER query';

            mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.getApparentPowerTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });

        it('should return an error when the SELECT IsActive query fails', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const errorMessage = 'Error in SELECT IsActive query';

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

            systemService.getApparentPowerTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });
    });
});


//PowerFactor


describe('SystemService - getPowerFactorTriggerDefinition', () => {
    let systemService;

    beforeEach(() => {
        systemService = new SystemService();
    });

    describe('getPowerFactorTriggerDefinition', () => {
        it('should return trigger and status results when queries succeed', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const statusResults = [{ IsActive: 1 }];

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

            systemService.getPowerFactorTriggerDefinition((error, triggers, status) => {
                expect(error).toBeNull();
                expect(triggers).toEqual(triggerResults);
                expect(status).toEqual(statusResults);
                done();
            });
        });

        it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
            const errorMessage = 'Error in SHOW CREATE TRIGGER query';

            mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.getPowerFactorTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });

        it('should return an error when the SELECT IsActive query fails', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const errorMessage = 'Error in SELECT IsActive query';

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

            systemService.getPowerFactorTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });
    });
});


//Temperature


describe('SystemService - getTemperatureTriggerDefinition', () => {
    let systemService;

    beforeEach(() => {
        systemService = new SystemService();
    });

    describe('getTemperatureTriggerDefinition', () => {
        it('should return trigger and status results when queries succeed', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const statusResults = [{ IsActive: 1 }];

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

            systemService.getTemperatureTriggerDefinition((error, triggers, status) => {
                expect(error).toBeNull();
                expect(triggers).toEqual(triggerResults);
                expect(status).toEqual(statusResults);
                done();
            });
        });

        it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
            const errorMessage = 'Error in SHOW CREATE TRIGGER query';

            mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.getTemperatureTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });

        it('should return an error when the SELECT IsActive query fails', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const errorMessage = 'Error in SELECT IsActive query';

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

            systemService.getTemperatureTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });
    });
});

//Units



describe('SystemService - getUnitsTriggerDefinition', () => {
    let systemService;

    beforeEach(() => {
        systemService = new SystemService();
    });

    describe('getLowEnergyUnitsTriggerDefinition', () => {
        it('should return trigger and status results when queries succeed', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const statusResults = [{ IsActive: 1 }];

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

            systemService.getLowEnergyUnitsTriggerDefinition((error, triggers, status) => {
                expect(error).toBeNull();
                expect(triggers).toEqual(triggerResults);
                expect(status).toEqual(statusResults);
                done();
            });
        });

        it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
            const errorMessage = 'Error in SHOW CREATE TRIGGER query';

            mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.getLowEnergyUnitsTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });

        it('should return an error when the SELECT IsActive query fails', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const errorMessage = 'Error in SELECT IsActive query';

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

            systemService.getLowEnergyUnitsTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });
    });
});


//Frequency



describe('SystemService- getFrequencyTriggerDefinition', () => {
    let systemService;

    beforeEach(() => {
        systemService = new SystemService();
    });

    describe('getFrequencyDeviationTriggerDefinition', () => {
        it('should return trigger and status results when queries succeed', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const statusResults = [{ IsActive: 1 }];

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(null, statusResults)); // Mock SELECT IsActive query

            systemService.getFrequencyDeviationTriggerDefinition((error, triggers, status) => {
                expect(error).toBeNull();
                expect(triggers).toEqual(triggerResults);
                expect(status).toEqual(statusResults);
                done();
            });
        });

        it('should return an error when the SHOW CREATE TRIGGER query fails', done => {
            const errorMessage = 'Error in SHOW CREATE TRIGGER query';

            mockDb.query.mockImplementationOnce((query, callback) => callback(new Error(errorMessage)));

            systemService.getFrequencyDeviationTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });

        it('should return an error when the SELECT IsActive query fails', done => {
            const triggerResults = [{ /* mock trigger results */ }];
            const errorMessage = 'Error in SELECT IsActive query';

            mockDb.query
                .mockImplementationOnce((query, callback) => callback(null, triggerResults)) // Mock successful SHOW CREATE TRIGGER query
                .mockImplementationOnce((query, callback) => callback(new Error(errorMessage))); // Simulate SELECT IsActive error

            systemService.getFrequencyDeviationTriggerDefinition((error, triggers, status) => {
                expect(error).toBeTruthy();
                expect(error.message).toBe(errorMessage);
                done();
            });
        });
    });
});
