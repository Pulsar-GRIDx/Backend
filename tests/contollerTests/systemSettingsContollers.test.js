const SystemController = require('../../systemSettings/systemSettingsContoller');
const systemSettingsService = require('../../systemSettings/systemSettingsService');

jest.mock('../../systemSettings/systemSettingsService');

describe('SystemController', () => {
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
