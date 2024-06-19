const { getTotalMeters,getAllActiveAndInactiveMeters } = require('../meter/meterControllers');
const energyService = require('../meter/meterService');


jest.mock('../meter/meterService');

describe('Test energyController', () => {
  it('should return total meters', async () => {
    const mockTotalMeters = { totalMeters: 100 }; // Mock total meters

    energyService.getAllTotalMeters.mockResolvedValue(mockTotalMeters);

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis() // Mocking the status function to return `res` for chaining
    };

    await getTotalMeters(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(mockTotalMeters);
  })
  
});

  it('should handle errors in getTotalMeters', async () => {
    const errorMessage = 'Test error message';
    energyService.getAllTotalMeters.mockRejectedValue(new Error(errorMessage));

    const req = {};
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis() // Mocking the status function to return `res` for chaining
    };

    await getTotalMeters(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'An error occurred while processing your request.' });
  });


  /*Test the get active and inactive meters 
  
  
  */
describe('getAllActiveAndInactiveMeters controller', () => {
  it('should return data when energyService call is successful', async () => {
    const mockData = { inactiveMeters: 20, activeMeters: 80};
    energyService.getAllActiveAndInactiveMeters.mockImplementation((callback) => {
      callback(null, mockData);
    });

    const req = {inactiveMeters: 20, activeMeters: 80}; // Mock request object
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }; // Mock response object

    await getAllActiveAndInactiveMeters(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  it('should log an error message if there is a database error', async () => {
    const errorMessage = 'Error querying MySQL:';
    energyService.getAllActiveAndInactiveMeters.mockImplementation((callback) => {
      callback(new Error('Database error'), null);
    });
    console.error = jest.fn();
  
    const req = {inactiveMeters: 20, activeMeters: 80}; // Mock request object
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }; // Mock response object

    await getAllActiveAndInactiveMeters(req, res);
  
    expect(console.error).toHaveBeenCalledWith(errorMessage, expect.any(Error));
  });
});
