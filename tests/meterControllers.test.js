const { 
  getTotalMeters,
  getAllActiveAndInactiveMeters,
  getTotalTransformers,
  getCurrentDayEnergy

 } = require('../meter/meterControllers');

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

    console.error = jest.fn();

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
    expect(console.error).toHaveBeenCalledWith(expect.any(Error));
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


//Test Total transformers 

describe('getTotalTransformers controller', () => {
  

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Success Scenario
  it('should return total number of transformers', async () => {
    const mockResults = [{ totalTransformers: 10 }]; // Mock service response
    energyService.getTotalTransformers.mockResolvedValue(mockResults);

    await getTotalTransformers(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockResults); // Verify extracted count
  });

  // No Transformers Found
  it('should return 400 and error message for no transformers', async () => {
    energyService.getTotalTransformers.mockResolvedValue([]);

    await getTotalTransformers(mockReq, mockRes);

    expect(console.error).toHaveBeenCalledWith('No data found');
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'No data found' });
  });

  // Database Error
  it('should return a 500 status and an error message when there is an error', async () => {
    const error = new Error('Test Error');
    energyService.getTotalTransformers.mockRejectedValue(error);

    await getTotalTransformers(mockReq, mockRes);

   
  });
});

//Current day energy 

describe('total energy', () => {
 

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(200,500),
      json: jest.fn(),
    };
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Success Scenario
  it('should return total energy and 200 ok', async () => {
    const mockResults = [{ power_consumption: 10 }, { power_consumption: 10 }];
    energyService.getCurrentDayData.mockResolvedValue(mockResults);

    await getCurrentDayEnergy(mockReq, mockRes);

    const totalEnergy = mockResults.reduce((total, record) => total + Number(record.power_consumption), 0);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ totalEnergy });
  });

  it('should handle errors', async () => {
    const mockError = new Error('Test error message');
    energyService.getCurrentDayData.mockRejectedValue(mockError);

    await getCurrentDayEnergy(mockReq, mockRes);

    
  
   
  });
});