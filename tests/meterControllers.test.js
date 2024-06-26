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


//Test Total transformers 

describe('getTotalTransformers controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  console.error = jest.fn();

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

    expect(console.error).toHaveBeenCalledWith({ error: 'No data found' });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(0);
  });

  // Database Error
  it('should return a 500 status and an error message when there is an error', async () => {
    await getTotalTransformers(mockReq, mockRes); // Wait for promise to resolve/reject
    
    expect(console.error).toHaveBeenCalledWith({ error: 'An error occurred while fetching token information' });
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'An error occurred' });
  });
});

//Current day energy 

describe('total energy', ()=>{
  it('should return total energy and 200 ok', async () =>{


    const mockResults = [{ totalEnergy : 20 }];
    const mockReq = {totalEnergy : 20 };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getCurrentDayEnergy(mockReq, mockRes);

    //Mocking the service
    energyService.getCurrentDayData = jest.fn(() => Promise.reject(mockResults));

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockResults);

  });

  it('should handle errors', async ()=>{
    const mockError = 'Test error message';
    const mockReq = {totalEnergy : 20};
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
      
    };
    console.error = jest.fn();

    // Mock your service function to throw an error
    energyService.getTotalTransformers = jest.fn(() => Promise.reject(mockError));

    await getTotalTransformers(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database query failed' });
    expect(console.error).toHaveBeenCalledWith(errorMessage, expect.any(Error));

  })
})