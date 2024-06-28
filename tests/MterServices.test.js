const { 
  getAllTotalMeters,
  getAllActiveAndInactiveMeters,
  getTotalTransformers,
  getCurrentDayData,
  etCurrentDayData } = require('../meter/meterService');
const db = require('../config/db');



//Mocking the database for testing purposes
jest.mock('../config/db');
jest.spyOn(console, 'error').mockImplementation(() => {});

//Total meters description

describe('Test meterService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  //First test
  it('should return total meters from database', async () => {
    const mockResult = [{ totalMeters: 1 }]; // Mock database query result
    db.query.mockImplementation((query, callback) => {
      callback(null, mockResult);
    });

    const result = await getAllTotalMeters();
    expect(result).toEqual({ totalMeters: 1 });
  });

  //Second test
  it('should handle database query error in getAllTotalMeters', async () => {
    const errorMessage = 'Test error message';
    db.query.mockImplementation((query, callback) => {
      callback(new Error(errorMessage), null);
    });

    await expect(getAllTotalMeters()).rejects.toThrow(errorMessage);
    expect(console.error).toHaveBeenCalledWith('Error querying the database:', expect.any(Error));
  });

  // Third test

  it('should return 0 total meters if no result in getAllTotalMeters', async () => {
    const mockResult = []; // Mock database query result
    db.query.mockImplementation((query, callback) => {
      callback(null, mockResult);
    });

    const result = await getAllTotalMeters();
    expect(result).toEqual({ totalMeters: 0 });
  });


  //Fourth test
  it('should log an error message if there are no results', async () => {
    db.query.mockImplementation((query, callback) => {
      callback(null, []);
    });
    
    await getAllTotalMeters();
    
    expect(console.error).toHaveBeenCalledWith('No results');
  });
});


/*
Active ans Inactive meters
*/ 

describe('getAllActiveAndInactiveMeters service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle database query error', async () => {
    const errorMessage = 'Test database error';
    db.query.mockImplementation((query, callback) => {
      callback(new Error(errorMessage), null);
    });
    console.log = jest.fn();

    try {
      await getAllActiveAndInactiveMeters((err, result) => {
        if (err) {
          console.error('Error in service:', err);
        }
        console.log('Result:', result); // Log the result for debugging

        expect(err).toEqual({ error: 'Error querying the database:', details: expect.any(Error) });
        expect(console.log).toHaveBeenCalledWith('Error querying the database:', expect.any(Error));
      });
    } catch (error) {
      console.error('Caught an unexpected error:', error);
    }
  });

  it('should handle no data found', async () => {
    db.query.mockImplementation((query, callback) => {
      callback(null, []);
    });
    console.log = jest.fn();

    try {
      await getAllActiveAndInactiveMeters((err, result) => {
        if (err) {
          console.error('Error in service:', err);
        }
        console.log('Result:', result); // Log the result for debugging

        expect(err).toEqual({ error: 'No data found' });
        expect(console.log).toHaveBeenCalledWith('No data found');
      });
    } catch (error) {
      console.error('Caught an unexpected error:', error);
    }
  });

  it('should retrieve active and inactive meters', async () => {
    const mockResults = [
      { DRN: 'Meter1', mains_state: '0' },
      { DRN: 'Meter2', mains_state: '1' },
      // Add more mock data as needed
    ];
    db.query.mockImplementation((query, callback) => {
      callback(null, mockResults);
    });

    const mockTotalResult = [{ totalMeters: 100 }];
    db.query.mockImplementationOnce((query, callback) => {
      callback(null, mockTotalResult);
    });

    try {
      await getAllActiveAndInactiveMeters((err, result) => {
        if (err) {
          console.error('Error in service:', err);
        }
        // console.log('Result:', result); 

        expect(err).toBeNull();
        expect(result).toEqual({ inactiveMeters: 99, activeMeters: 1 });
      });
    } catch (error) {
      console.error('Caught an unexpected error:', error);
    }
  });

  

});


//Total Transformers

describe('total transformers', ()=>{


  //Success scenario
  it('should return total transformers', async () => {

    const mockResult = [{ totalTransformers: 10}]; // Mock database query result
    db.query.mockImplementation((query, callback) => {
      callback(null, mockResult);
    });

    const result = await getTotalTransformers();
    expect(result).toEqual({ totalTransformers: 10});

  });
//Handle database errors
  it('should handle errors', async () => {
      const errorMessage = 'Test error message';
      db.query.mockImplementation((query, callback) => {
        callback(new Error(errorMessage), null);
      });

      await expect(getTotalTransformers()).rejects.toThrow(errorMessage);
      expect(console.error).toHaveBeenCalledWith('Error querying the database:', expect.any(Error));
  });
});


//Total Energy

describe('Total Energy', () =>{
  //Success scenario
  it('should return total energy', async () => {
    const mockResult = { totalEnergy: 10}; // Mock database query result
    db.query.mockImplementation((query, callback) => {
      callback(null, mockResult);
    });

    const result = await getCurrentDayData();
    expect(result).toEqual({ totalEnergy: 10});
    });

  it('should handle errors', async () => {

    const errorMessage = 'Test error message';
      db.query.mockImplementation((query, callback) => {
        callback(new Error(errorMessage), null);
      });

      await expect(getCurrentDayData()).rejects.toThrow(errorMessage);
      expect(console.error).toHaveBeenCalledWith('Error querying the database:', expect.any(Error));

  });  
});