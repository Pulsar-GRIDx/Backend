
const SystemService = require('../../financial/financialService'); 

describe('SystemService', () => {
  let dbMock;
  let service;

  beforeEach(() => {
    dbMock = {
      query: jest.fn()
    };
    service = new SystemService();
    service.db = dbMock; // Inject the mock DB
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getVoltageTriggerDefinition', () => {
    it('should return trigger results and status results successfully', (done) => {
      const triggerResults = [{ 'Create Trigger': 'CREATE TRIGGER LowAndHighVoltageTrigger ...' }];
      const statusResults = [{ IsActive: 1 }];

      dbMock.query.mockImplementationOnce((query, callback) => {
        callback(null, triggerResults);
      }).mockImplementationOnce((query, callback) => {
        callback(null, statusResults);
      });

      service.getVoltageTriggerDefinition((error, triggerResultsResult, statusResultsResult) => {
        try {
          expect(error).toBeNull();
          expect(triggerResultsResult).toEqual(triggerResults);
          expect(statusResultsResult).toEqual(statusResults);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should handle error in fetching trigger definition', (done) => {
      const error = new Error('Query error');

      dbMock.query.mockImplementationOnce((query, callback) => {
        callback(error, null);
      });

      service.getVoltageTriggerDefinition((error, triggerResults, statusResults) => {
        try {
          expect(error).not.toBeNull();
          expect(error.message).toBe('Query error');
          expect(triggerResults).toBeUndefined();
          expect(statusResults).toBeUndefined();
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should handle error in fetching trigger status', (done) => {
      const triggerResults = [{ 'Create Trigger': 'CREATE TRIGGER LowAndHighVoltageTrigger ...' }];
      const error = new Error('Query error');

      dbMock.query.mockImplementationOnce((query, callback) => {
        callback(null, triggerResults);
      }).mockImplementationOnce((query, callback) => {
        callback(error, null);
      });

      service.getVoltageTriggerDefinition((error, triggerResultsResult, statusResults) => {
        try {
          expect(error).not.toBeNull();
          expect(error.message).toBe('Query error');
          expect(triggerResultsResult).toEqual(triggerResults);
          expect(statusResults).toBeUndefined();
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
