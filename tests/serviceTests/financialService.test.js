//Import all functions to be tested.

const {
  getTokenAmounts,
  getMonthlyTokenAmountForCurrentAndLastYear,
  getWeeklyTokenAmountForCurrentAndLastWeek,
  getTotalRevenuePerHour,
  getRevenueByTimePeriodsBySuburb} = require('../../financial/financialService');
const db = require('../../config/db');


// const getWeekNumber = (date) => {
//   const firstJan = new Date(date.getFullYear(), 0, 1);
//   return Math.ceil(((date - firstJan) / 86400000 + firstJan.getDay() + 1) / 7);
// };

// const weekKey = record.week === getWeekNumber(new Date()) ? 'currentweek' : 'lastweek';


//Mocking the database for testing purposes
// jest.mock('../../config/db');

jest.mock('../../config/db', () => ({
  query: jest.fn(),
  
}));
jest.spyOn(console, 'error').mockImplementation(() => {});


// Mock suburbs array for testing
const suburbs = ['Academia'];


//getTokenAmounts

describe('getTokenAmounts', () => {
  beforeEach(() => {
    db.query.mockClear(); // Clear mock calls before each test
  });


  //Success case

  test('should return correct token amounts for day, month, and year', async () => {
    const dayResult = [{ total_token_amount: 10 }];
    const monthResult = [{ total_token_amount: 300 }];
    const yearResult = [{ total_token_amount: 3650 }];

    db.query
      .mockImplementationOnce((query, callback) => callback(null, dayResult))
      .mockImplementationOnce((query, callback) => callback(null, monthResult))
      .mockImplementationOnce((query, callback) => callback(null, yearResult));

    const result = await getTokenAmounts();

    expect(result).toEqual({
      day: 10,
      month: 300,
      year: 3650
    });

    expect(db.query).toHaveBeenCalledTimes(3);
  });

  //Handle database errors

  test('should handle database query errors', async () => {
    const error = new Error('Database error');

    db.query
      .mockImplementationOnce((query, callback) => callback(error, null))
      .mockImplementationOnce((query, callback) => callback(null, [])) 
      .mockImplementationOnce((query, callback) => callback(null, []));

    await expect(getTokenAmounts()).rejects.toThrow('Database error');
    expect(console.error).toHaveBeenCalledWith('Error querying the database:', expect.any(Error));

    expect(db.query).toHaveBeenCalledTimes(1);
  });
});


//getMonthlyTokenAmountForCurrentAndLastYear


// Describe your test suite
describe('getMonthlyTokenAmountForCurrentAndLastYear', () => {
  beforeEach(() => {
    jest.spyOn(db, 'query').mockImplementation();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should resolve with monthly data when the query is successful', async () => {
    const mockMonthlyData = [
      { year: 2023, month: 1, total_token_amount: 100 },
      { year: 2023, month: 2, total_token_amount: 150 }
    ];

    db.query.mockImplementation((query, callback) => {
      callback(null, mockMonthlyData);
    });

    const result = await getMonthlyTokenAmountForCurrentAndLastYear();
    expect(result).toEqual(mockMonthlyData);
  });

  it('should reject with an error when the query fails', async () => {
    const mockError = new Error('Error querying the database: fail is not defined');

    db.query.mockImplementation((query, callback) => {
      callback(mockError, null);
    });

    try {
      await getMonthlyTokenAmountForCurrentAndLastYear();
    } catch (err) {
      expect(err.message).toBe(mockError.message);
    }
  });
});





///getWeeklyTokenAmountForCurrentAndLastWeek
// describe('getWeeklyTokenAmountForCurrentAndLastWeek', () => {
//   beforeEach(() => {
//     db.query.mockClear(); // Clear mock calls before each test
//   });

//   test('should return correct weekly token amounts for current and last week in the expected format', async () => {
//     // Mocked weekly data from the database
//     const weeklyData = [
//       { year: 2023, week: 1, day: 'Monday', total_token_amount: 100 },
//       { year: 2023, week: 1, day: 'Tuesday', total_token_amount: 200 },
//       { year: 2023, week: 1, day: 'Wednesday', total_token_amount: 150 },
//       { year: 2023, week: 1, day: 'Thursday', total_token_amount: 300 },
//       { year: 2023, week: 1, day: 'Friday', total_token_amount: 250 },
//       { year: 2023, week: 1, day: 'Saturday', total_token_amount: 180 },
//       { year: 2023, week: 1, day: 'Sunday', total_token_amount: 210 },
//       { year: 2023, week: 2, day: 'Monday', total_token_amount: 120 },
//       { year: 2023, week: 2, day: 'Tuesday', total_token_amount: 180 },
//       { year: 2023, week: 2, day: 'Wednesday', total_token_amount: 130 },
//       { year: 2023, week: 2, day: 'Thursday', total_token_amount: 250 },
//       { year: 2023, week: 2, day: 'Friday', total_token_amount: 220 },
//       { year: 2023, week: 2, day: 'Saturday', total_token_amount: 200 },
//       { year: 2023, week: 2, day: 'Sunday', total_token_amount: 190 }
//     ];

//     db.query.mockImplementationOnce((query, callback) => callback(null, weeklyData));

//     const expectedResult = {
//       lastweek: [100, 200, 150, 300, 250, 180, 210],
//       currentweek: [120, 180, 130, 250, 220, 200, 190]
//     };

//     const result = await getWeeklyTokenAmountForCurrentAndLastWeek();

//     // Transform result to match expected format
//     const transformedResult = {
//       lastweek: new Array(7).fill(0),
//       currentweek: new Array(7).fill(0)
//     };

//     // Fill in the transformedResult with actual data from result
//     result.forEach(record => {
//       const weekKey = record.week === new Date().getWeek() ? 'currentweek' : 'lastweek';
//       const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(record.day);
//       if (dayIndex !== -1) {
//         transformedResult[weekKey][dayIndex] = record.total_token_amount;
//       }
//     });

//     expect(transformedResult).toEqual(expectedResult);
//     expect(db.query).toHaveBeenCalledTimes(1);
//   });

//   it('should handle database query errors', async () => {
//     const mockError = new Error('Database error');
  
//     queryStub.callsFake((query, callback) => {
//       callback(mockError, null);
//     });
  
//     await expect(getWeeklyTokenAmountForCurrentAndLastWeek()).rejects.toThrow('Error querying the database:');
//     expect(console.error).toHaveBeenCalledWith('Error querying the database:', expect.any(Error));
//   });
  
// });



//Hourly revenue


// describe('getTotalRevenuePerHour', () => {
//   beforeEach(() => {
//     db.query.mockClear(); // Clear mock calls before each test
//   });

//   it('returns correct revenue data when results are found', () => {
//     const hourlyData = [100, 150, 120, 200, 180, 250, 220, 300, 280, 320, 290, 310, 330, 310, 340, 320, 360, 370, 380, 400, 390, 410, 420, 400];
//     db.query.mockImplementationOnce((query, callback) => callback(null, hourlyData));
  
//     const callback = jest.fn();
//     getRevenueByTimePeriodsBySuburb([], callback);
//     expect(callback).toHaveBeenCalledWith(null, hourlyData);
//   });
  
      
    

//   test('should handle database query errors', async () => {
//     const error = new Error('Database error');

//     db.query.mockImplementationOnce((query, callback) => callback(error, null));

//     const callback = jest.fn();

//     await getTotalRevenuePerHour(callback);

//     expect(callback).toHaveBeenCalledWith({ error: 'Database query failed', details: error });
//     expect(console.error).toHaveBeenCalledWith('Error querying the database:', expect.any(Error));
//     expect(db.query).toHaveBeenCalledTimes(1);
//   });
// });



////getRevenueByTimePeriodsBySuburb



// describe('getRevenueByTimePeriodsBySuburb', () => {
//   // Test case for successful query with results
//   test('returns correct revenue data when results are found', () => {
//     const mockResults = [
//       {
//         currentDayRevenue: 100,
//         currentMonthRevenue: 500,
//         currentYearRevenue: 1500,
//       },
//     ];

//     // Mock the database query function to return mock results
//     db.query.mockImplementation((query, params, callback) => {
//       callback(null, mockResults);
//     });

//     // Define the expected output
//     const expectedOutput = {
//       currentDayRevenue: 100,
//       currentMonthRevenue: 500,
//       currentYearRevenue: 1500,
//     };

//     // Call the function with suburbs and expect it to return expected output
//     getRevenueByTimePeriodsBySuburb(suburbs, (err, data) => {
//       expect(err).toBeNull();
//       expect(data).toEqual(expectedOutput);
//     });
//   });

//   test('returns zeros when no results are found', () => {
//     // Mock the database query function to simulate returning no results
//     db.query.mockImplementationOnce((query, params, callback) => {
//       // Simulate no results by calling callback with null data
//       callback(null, []);
//     });

//     // Define the expected output
//     const expectedOutput = {
//       currentDayRevenue: 0,
//       currentMonthRevenue: 0,
//       currentYearRevenue: 0,
//     };

//     // Call the function with suburbs and expect it to return expected output
//     getRevenueByTimePeriodsBySuburb(suburbs, (err, data) => {
//       expect(err).toBeNull();
//       expect(data).toEqual(expectedOutput);
//     });
//   });

//   // Test case for database query error
//   test('returns error when database query fails', () => {
//     const errorMessage = 'Database query failed';

//     // Mock the database query function to simulate an error
//     db.query.mockImplementation((query, params, callback) => {
//       callback(errorMessage);
//     });

//     // Call the function with suburbs and expect it to return an error
//     getRevenueByTimePeriodsBySuburb(suburbs, (err, data) => {
//       expect(err).toEqual({ error: 'Database query failed', details: errorMessage });
//       expect(data).toBeUndefined(); // No data should be returned on error
//     });
//   });
// });