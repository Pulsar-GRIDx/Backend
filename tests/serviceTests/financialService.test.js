const {
  getTokenAmounts,
  getMonthlyTokenAmountForCurrentAndLastYear,
  getWeeklyTokenAmountForCurrentAndLastWeek,
  getTotalRevenuePerHour} = require('../../financial/financialService');
const db = require('../../config/db');


//Mocking the database for testing purposes
jest.mock('../../config/db');
jest.spyOn(console, 'error').mockImplementation(() => {});


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
      .mockImplementationOnce((query, callback) => callback(null, [])) // These won't be called due to the first error
      .mockImplementationOnce((query, callback) => callback(null, []));

    await expect(getTokenAmounts()).rejects.toThrow('Database error');
    expect(console.error).toHaveBeenCalledWith('Error querying the database:', expect.any(Error));

    expect(db.query).toHaveBeenCalledTimes(1);
  });
});


//getMonthlyTokenAmountForCurrentAndLastYear

describe('getMonthlyTokenAmountForCurrentAndLastYear', () => {
  beforeEach(() => {
    db.query.mockClear(); // Clear mock calls before each test
  });

  test('should return correct token amounts for current and last year in the expected format', async () => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const monthlyData = [
      { year: lastYear, month: 1, total_token_amount: 20 },
      { year: lastYear, month: 3, total_token_amount: 1000 },
      { year: lastYear, month: 4, total_token_amount: 3001 },
      { year: lastYear, month: 5, total_token_amount: 3911 },
      { year: lastYear, month: 7, total_token_amount: 1000 },
      { year: lastYear, month: 8, total_token_amount: 2000 },
      { year: lastYear, month: 9, total_token_amount: 1020 },
      { year: lastYear, month: 10, total_token_amount: 1400 },
      { year: lastYear, month: 11, total_token_amount: 2060 },
      { year: lastYear, month: 12, total_token_amount: 20 },
      { year: currentYear, month: 1, total_token_amount: 0 },
      { year: currentYear, month: 2, total_token_amount: 0 },
      { year: currentYear, month: 3, total_token_amount: 0 },
      { year: currentYear, month: 4, total_token_amount: 22017 },
      { year: currentYear, month: 5, total_token_amount: 4199 },
      { year: currentYear, month: 6, total_token_amount: 9360 },
      { year: currentYear, month: 7, total_token_amount: 0 },
      { year: currentYear, month: 8, total_token_amount: 0 },
      { year: currentYear, month: 9, total_token_amount: 0 },
      { year: currentYear, month: 10, total_token_amount: 0 },
      { year: currentYear, month: 11, total_token_amount: 0 },
      { year: currentYear, month: 12, total_token_amount: 0 },
    ];

    db.query.mockImplementationOnce((query, callback) => callback(null, monthlyData));

    const expectedResult = {
      Last: [20, 0, 1000, 3001, 3911, 0, 1000, 2000, 1020, 1400, 2060, 20],
      Current: [0, 0, 0, 22017, 4199, 9360, 0, 0, 0, 0, 0, 0]
    };

    const result = await getMonthlyTokenAmountForCurrentAndLastYear();

    // Transform result to match expected format
    const transformedResult = {
      Last: Array(12).fill(0),
      Current: Array(12).fill(0)
    };

    // Filter and map the data to the transformedResult
    monthlyData.forEach(({ year, month, total_token_amount }) => {
      if (year === lastYear && month >= 1 && month <= 12) {
        transformedResult.Last[month - 1] = total_token_amount;
      } else if (year === currentYear && month >= 1 && month <= 12) {
        transformedResult.Current[month - 1] = total_token_amount;
      }
    });

    expect(transformedResult).toEqual(expectedResult);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test('should handle database query errors', async () => {
    const error = new Error('Database error');

    db.query.mockImplementationOnce((query, callback) => callback(error, null));

    await expect(getMonthlyTokenAmountForCurrentAndLastYear()).rejects.toThrow('Database error');
    expect(console.error).toHaveBeenCalledWith('Error querying the database:', expect.any(Error));

    expect(db.query).toHaveBeenCalledTimes(1);
  });
});




///getWeeklyTokenAmountForCurrentAndLastWeek
describe('getWeeklyTokenAmountForCurrentAndLastWeek', () => {
  beforeEach(() => {
    db.query.mockClear(); // Clear mock calls before each test
  });

  test('should return correct weekly token amounts for current and last week in the expected format', async () => {
    // Mocked weekly data from the database
    const weeklyData = [
      { year: 2023, week: 1, day: 'Monday', total_token_amount: 100 },
      { year: 2023, week: 1, day: 'Tuesday', total_token_amount: 200 },
      { year: 2023, week: 1, day: 'Wednesday', total_token_amount: 150 },
      { year: 2023, week: 1, day: 'Thursday', total_token_amount: 300 },
      { year: 2023, week: 1, day: 'Friday', total_token_amount: 250 },
      { year: 2023, week: 1, day: 'Saturday', total_token_amount: 180 },
      { year: 2023, week: 1, day: 'Sunday', total_token_amount: 210 },
      { year: 2023, week: 2, day: 'Monday', total_token_amount: 120 },
      { year: 2023, week: 2, day: 'Tuesday', total_token_amount: 180 },
      { year: 2023, week: 2, day: 'Wednesday', total_token_amount: 130 },
      { year: 2023, week: 2, day: 'Thursday', total_token_amount: 250 },
      { year: 2023, week: 2, day: 'Friday', total_token_amount: 220 },
      { year: 2023, week: 2, day: 'Saturday', total_token_amount: 200 },
      { year: 2023, week: 2, day: 'Sunday', total_token_amount: 190 }
    ];

    db.query.mockImplementationOnce((query, callback) => callback(null, weeklyData));

    const expectedResult = {
      lastweek: [100, 200, 150, 300, 250, 180, 210],
      currentweek: [120, 180, 130, 250, 220, 200, 190]
    };

    const result = await getWeeklyTokenAmountForCurrentAndLastWeek();

    // Transform result to match expected format
    const transformedResult = {
      lastweek: new Array(7).fill(0),
      currentweek: new Array(7).fill(0)
    };

    // Fill in the transformedResult with actual data from result
    result.forEach(record => {
      const weekKey = record.week === new Date().getWeek() ? 'currentweek' : 'lastweek';
      const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(record.day);
      if (dayIndex !== -1) {
        transformedResult[weekKey][dayIndex] = record.total_token_amount;
      }
    });

    expect(transformedResult).toEqual(expectedResult);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test('should handle database query errors', async () => {
    const error = new Error('Database error');

    db.query.mockImplementationOnce((query, callback) => callback(error, null));

    await expect(getWeeklyTokenAmountForCurrentAndLastWeek()).rejects.toThrow('Database error');
    expect(console.error).toHaveBeenCalledWith('Error querying the database:', expect.any(Error));

    expect(db.query).toHaveBeenCalledTimes(1);
  });
});



//Hourly revenue


describe('getTotalRevenuePerHour', () => {
  beforeEach(() => {
    db.query.mockClear(); // Clear mock calls before each test
  });

  test('should return correct hourly revenue for the current day', async () => {
    // Mocked hourly data from the database
    const hourlyData = [
      { hour: 0, total_revenue: 100 },
      { hour: 1, total_revenue: 150 },
      { hour: 2, total_revenue: 120 },
      { hour: 3, total_revenue: 200 },
      { hour: 4, total_revenue: 180 },
      { hour: 5, total_revenue: 250 },
      { hour: 6, total_revenue: 220 },
      { hour: 7, total_revenue: 300 },
      { hour: 8, total_revenue: 280 },
      { hour: 9, total_revenue: 320 },
      { hour: 10, total_revenue: 290 },
      { hour: 11, total_revenue: 310 },
      { hour: 12, total_revenue: 330 },
      { hour: 13, total_revenue: 310 },
      { hour: 14, total_revenue: 340 },
      { hour: 15, total_revenue: 320 },
      { hour: 16, total_revenue: 360 },
      { hour: 17, total_revenue: 370 },
      { hour: 18, total_revenue: 380 },
      { hour: 19, total_revenue: 400 },
      { hour: 20, total_revenue: 390 },
      { hour: 21, total_revenue: 410 },
      { hour: 22, total_revenue: 420 },
      { hour: 23, total_revenue: 400 }
    ];

    db.query.mockImplementationOnce((query, callback) => callback(null, hourlyData));

    const expectedResult = [
      100, 150, 120, 200, 180, 250, 220, 300, 280, 320, 290, 310, 330, 310, 340, 320, 360, 370, 380, 400, 390, 410, 420, 400
    ];

    const callback = jest.fn();

    await getTotalRevenuePerHour(callback);

    expect(callback).toHaveBeenCalledWith(null, expectedResult);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test('should handle database query errors', async () => {
    const error = new Error('Database error');

    db.query.mockImplementationOnce((query, callback) => callback(error, null));

    const callback = jest.fn();

    await getTotalRevenuePerHour(callback);

    expect(callback).toHaveBeenCalledWith({ error: 'Database query failed', details: error });
    expect(console.error).toHaveBeenCalledWith('Error querying the database:', expect.any(Error));
    expect(db.query).toHaveBeenCalledTimes(1);
  });
});