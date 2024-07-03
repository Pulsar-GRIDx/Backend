// const SystemController = require('../../systemSettings/systemSettingsContoller');
// const systemSettingsService = require('../../systemSettings/systemSettingsService');

// jest.mock('../../systemSettings/systemSettingsService');

// describe('SystemController', () => {
//   let systemController;
//   let mockRequest;
//   let mockResponse;

//   beforeEach(() => {
//     systemController = new SystemController();
//     mockRequest = {
//       body: {}
//     };
//     mockResponse = {
//       status: jest.fn().mockReturnThis(),
//       send: jest.fn(),
//       json: jest.fn()
//     };
//   });

//   describe('getVoltageTriggerDefinition', () => {
//     it('should return voltage trigger definition', async () => {
//       const mockTriggerResults = [{
//         'SQL Original Statement': 'IF NEW.voltage >= 240 THEN INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type) VALUES ("test", "High Voltage", "High Voltage Detected", "Warning", "Voltage"); END IF; IF NEW.voltage <= 200 THEN INSERT INTO MeterNotifications (DRN, AlarmType, Alarm, Urgency_Type, Type) VALUES ("test", "Low Voltage", "Low Voltage Detected", "Warning", "Voltage"); END IF;'
//       }];
//       const mockStatusResults = [{ IsActive: true }];

//       systemSettingsService.getVoltageTriggerDefinition.mockImplementation((callback) => {
//         callback(null, mockTriggerResults, mockStatusResults);
//       });

//       await systemController.getVoltageTriggerDefinition(mockRequest, mockResponse);

//       expect(mockResponse.send).toHaveBeenCalledWith({
//         upperThreshold: '240',
//         lowerThreshold: '200',
//         type: '"Voltage"',
//         Active: true
//       });
//     });

//     it('should handle errors', async () => {
//       systemSettingsService.getVoltageTriggerDefinition.mockImplementation((callback) => {
//         callback(new Error('Database error'), null, null);
//       });

//       await systemController.getVoltageTriggerDefinition(mockRequest, mockResponse);

//       expect(mockResponse.status).toHaveBeenCalledWith(500);
//       expect(mockResponse.send).toHaveBeenCalledWith(expect.any(Error));
//     });
//   });

//   describe('updateVoltageThresholds', () => {
//     it('should update voltage thresholds', async () => {
//       mockRequest.body = {
//         newUpperThreshold: 250,
//         newLowerThreshold: 190,
//         type: 'Voltage',
//         IsActive: true
//       };

//       systemSettingsService.updateVoltageTriggerDefinition.mockImplementation((upper, lower, type, name, isActive, callback) => {
//         callback(null, 'Success', null);
//       });

//       await systemController.updateVoltageThresholds(mockRequest, mockResponse);

//       expect(mockResponse.send).toHaveBeenCalledWith('Thresholds updated successfully!');
//     });

//     it('should handle invalid input', async () => {
//       mockRequest.body = {
//         newUpperThreshold: 250,
//         newLowerThreshold: null,
//         type: 'Voltage',
//         IsActive: true
//       };

//       await systemController.updateVoltageThresholds(mockRequest, mockResponse);

//       expect(mockResponse.status).toHaveBeenCalledWith(400);
//       expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Thresholds, type, and IsActive cannot be empty.' });
//     });
//   });

//   // Similar test cases can be written for other methods like getCurrentTriggerDefinition, updateCurrentThresholds, etc.

// });