const request = require('supertest');
const express = require('express');
const router = require('../../routes/meterPercentageCountRoutes');
const connection = require('../../config/db');
const jwt = require('jsonwebtoken');

jest.mock('../../config/db');

const app = express();
app.use('/', router);

// Mock JWT token
const INCORRECT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBZG1pbl9JRCI6MTAsIkVtYWlsIjoiYWRtaW5AcHVsc2FyLmNvbSIsIkFjY2Vzc0xldmVsIjoiMSIsImlhdCI6MTcyMDYwNzQ1OCwiZXhwIjoxNzIwNjExMDU4fQ.k9fzlA7dWP6Sbb16X58nFTLdqgEb75KXj5t0znXsanY';

const SECRET_KEY = process.env.SECRET_KEY;
const AUTH_TOKEN = jwt.sign({ user: 'testUser' }, SECRET_KEY, { expiresIn: '1h' });





describe('GET /meter_change', () => {
  beforeAll(() => {
    const mockResults = [
      {
        count: 10,
        earliestDate: '2023-01-01T00:00:00.000Z',
        latestDate: '2023-12-31T23:59:59.000Z',
        currentMonthCount: 5,
        previousMonthCount: 3
      }
    ];

    connection.query.mockImplementation((query, callback) => {
      callback(null, mockResults);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with the correct data structure and status code', async () => {
    const response = await request(app)
      .get('/meter_change')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      percentageChange: expect.any(Number),
      currentMonth: {
        count: 5,
        earliestDate: '2023-01-01T00:00:00.000Z',
        latestDate: '2023-12-31T23:59:59.000Z'
      },
      previousMonth: {
        count: 3,
        earliestDate: '2023-01-01T00:00:00.000Z',
        latestDate: '2023-12-31T23:59:59.000Z'
      }
    });
  });

  it('should respond with 401 if no authorization header is provided', async () => {
    const response = await request(app).get('/meter_change');

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });

  it('should respond with 401 if incorrect authorization header is provided', async () => {
    const response = await request(app)
      .get('/meter_change')
      .set('Authorization', INCORRECT_TOKEN);

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });
});




describe('GET /active_state_count', () => {
  beforeAll(() => {
    const mockCurrentResults = [
      { currentDayCount: 10 }
    ];

    const mockPreviousResults = [
      { previousDayCount: 8 }
    ];

    connection.query.mockImplementation((query, callback) => {
      if (query.includes('currentDate')) {
        callback(null, mockCurrentResults);
      } else if (query.includes('previousDate')) {
        callback(null, mockPreviousResults);
      }
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with the correct data structure and status code', async () => {
    const response = await request(app)
      .get('/active_state_count')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);
  
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      currentDayCount: 10,
      previousDayCount: 8,
      percentageChange: expect.any(Number)
    });
  }, 10000); // Set timeout to 10 seconds (10000 ms)
  

  it('should respond with 401 if no authorization header is provided', async () => {
    const response = await request(app).get('/active_state_count');

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });

  it('should respond with 401 if incorrect authorization header is provided', async () => {
    const response = await request(app)
      .get('/active_state_count')
      .set('Authorization', INCORRECT_TOKEN);

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });
});

describe('GET /inactive_state_count', () => {
  it('should respond with the correct data structure and status code', async () => {
    const response = await request(app)
      .get('/inactive_state_count')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      currentDayCount: expect.any(Number),
      previousDayCount: expect.any(Number),
      percentageChange: expect.any(Number)
    });
  });

  it('should respond with 401 if no authorization header is provided', async () => {
    const response = await request(app)
      .get('/inactive_state_count');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  it('should respond with 401 if incorrect authorization header is provided', async () => {
    const response = await request(app)
      .get('/inactive_state_count')
      .set('Authorization', INCORRECT_TOKEN);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });

  
});


describe('POST /suburbAdvancedPowerIncreaseOrDecrease', () => {
  beforeAll(() => {
    const mockResults = [
      { currentDayTotal: 100, previousDayTotal: 80 },    // Mock currentDayAndPreviousDay query
      { currentMonthTotal: 500, previousMonthTotal: 400 },  // Mock currentMonthAndPreviousMonth query
      { currentYearTotal: 2000, previousYearTotal: 1800 }   // Mock currentYearAndPreviousYear query
    ];

    // Mock executeQuery to return predefined results
    connection.query.mockImplementation((query, params, callback) => {
      callback(null, mockResults.shift()); 
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with the correct data structure and status code', async () => {
    const suburbs = ['Suburb1', 'Suburb2']; 

    const response = await request(app)
      .post('/suburbAdvancedPowerIncreaseOrDecrease')
      .send({ suburbs })
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      dayPercentage: expect.any(Number),
      monthPercentage: expect.any(Number),
      yearPercentage: expect.any(Number)
    });
  });

  it('should respond with 401 if no authorization header is provided', async () => {
    const suburbs = ['Academia']; 

    const response = await request(app)
      .post('/suburbAdvancedPowerIncreaseOrDecrease')
      .send({ suburbs });

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });

  it('should respond with 401 if incorrect authorization header is provided', async () => {
    const suburbs = ['Academia']; // Example suburbs

    const response = await request(app)
      .post('/suburbAdvancedPowerIncreaseOrDecrease')
      .send({ suburbs })
      .set('Authorization', INCORRECT_TOKEN);

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });

  
});





describe('GET /powerIncreaseOrDecrease', () => {
  beforeAll(() => {
    const mockResults = [
      { day_consumption: 100 },   // Mock currentDayAndPreviousDay query result
      { month_consumption: 500 }, // Mock currentMonthAndPreviousMonth query result
      { year_consumption: 2000 }, // Mock currentYearAndPreviousYear query result
      { day_consumption: 80 },    // Mock previousDay query result
      { month_consumption: 400 }, // Mock previousMonth query result
      { year_consumption: 1800 }  // Mock previousYear query result
    ];

    // Mock executeQuery to return predefined results
    connection.query.mockImplementation((query, callback) => {
      const result = mockResults.shift(); // Shift results array to return each result in order
      callback(null, [result]);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with the correct data structure and status code', async () => {
    const response = await request(app)
      .get('/powerIncreaseOrDecrease')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      day: expect.any(Number),
      month: expect.any(Number),
      year: expect.any(Number)
    });
  });

  it('should respond with 401 if no authorization header is provided', async () => {
    const response = await request(app)
      .get('/powerIncreaseOrDecrease');

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });

  it('should respond with 401 if incorrect authorization header is provided', async () => {
    const response = await request(app)
      .get('/powerIncreaseOrDecrease')
      .set('Authorization', INCORRECT_TOKEN);

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });
});




describe('GET /tokenAmountIncreaseOrDecrease', () => {
  beforeAll(() => {
    const mockResults = [
      { total_token_amount: 100 },   // Mock getCurrentDayTokenAmount query result
      { total_token_amount: 500 },   // Mock getCurrentMonthTokenAmount query result
      { total_token_amount: 2000 },  // Mock getCurrentYearTokenAmount query result
      { total_token_amount: 80 },    // Mock getPreviousDayTokenAmount query result
      { total_token_amount: 400 },   // Mock getPreviousMonthTokenAmount query result
      { total_token_amount: 1800 }   // Mock getPreviousYearTokenAmount query result
    ];

    // Mock executeQuery to return predefined results
    connection.query.mockImplementation((query, callback) => {
      const result = mockResults.shift(); // Shift results array to return each result in order
      callback(null, [result]);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with the correct data structure and status code', async () => {
    const response = await request(app)
      .get('/tokenAmountIncreaseOrDecrease')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      dayPercentage: expect.any(Number),
      monthPercentage: expect.any(Number),
      yearPercentage: expect.any(Number)
    });
  });

  it('should respond with 401 if no authorization header is provided', async () => {
    const response = await request(app)
      .get('/tokenAmountIncreaseOrDecrease');

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });

  it('should respond with 401 if incorrect authorization header is provided', async () => {
    const response = await request(app)
      .get('/tokenAmountIncreaseOrDecrease')
      .set('Authorization', `Bearer ${INCORRECT_TOKEN}`);

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });
});





describe('POST /suburbRevenueIncreaseOrDecrease', () => {
  beforeAll(() => {
    const mockResults = [
      { 
        currentDayRevenue: 100,
        currentMonthRevenue: 500,
        currentYearRevenue: 2000,
        previousDayRevenue: 80,
        previousMonthRevenue: 400,
        previousYearRevenue: 1800
      }
    ];

    // Mock executeQuery to return predefined results
    connection.query.mockImplementation((query, params, callback) => {
      const result = mockResults.shift(); // Shift results array to return each result in order
      callback(null, [result]);
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with the correct data structure and status code', async () => {
    const response = await request(app)
      .post('/suburbRevenueIncreaseOrDecrease')
      .send({ suburbs: ['Academia'] })
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .expect(200);

    expect(response.body).toEqual({
      dayPercentage: expect.any(Number),
      monthPercentage: expect.any(Number),
      yearPercentage: expect.any(Number)
    });
  });

  it('should respond with 401 if no authorization header is provided', async () => {
    const response = await request(app)
      .post('/suburbRevenueIncreaseOrDecrease')
      .send({ suburbs: ['Academia'] })
      .expect(401);

    expect(response.text).toBe('Unauthorized');
  });

  it('should respond with 401 if incorrect authorization header is provided', async () => {
    const response = await request(app)
      .post('/suburbRevenueIncreaseOrDecrease')
      .send({ suburbs: ['Academia'] })
      .set('Authorization', `Bearer ${INCORRECT_TOKEN}`)
      .expect(401);

    expect(response.text).toBe('Unauthorized');
  });
});



describe('GET /time-periods-ratios', () => {
  beforeAll(() => {
    // Mock implementation of database query for tokens and units
    const mockTokensQuery = "SELECT tokensBoughtToday, tokensBoughtThisMonth, tokensBoughtThisYear FROM mockTokensTable";
    const mockUnitsQuery = "SELECT unitsUsedToday, unitsUsedThisMonth, unitsUsedThisYear FROM mockUnitsTable";
    
    connection.query.mockImplementation((query, callback) => {
      if (query === mockTokensQuery) {
        callback(null, [{ tokensBoughtToday: 100, tokensBoughtThisMonth: 1000, tokensBoughtThisYear: 12000 }]);
      } else if (query === mockUnitsQuery) {
        callback(null, [{ unitsUsedToday: 50, unitsUsedThisMonth: 500, unitsUsedThisYear: 6000 }]);
      } else {
        callback(new Error('Invalid query'));
      }
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with the correct structure and status code', async () => {
    const response = await request(app)
      .get('/time-periods-ratios')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      tokensBoughtToday: 100,
      unitsUsedToday: 50,
      percentageUsedToday: 50,
      tokensBoughtThisMonth: 1000,
      unitsUsedThisMonth: 500,
      percentageUsedThisMonth: 50,
      tokensBoughtThisYear: 12000,
      unitsUsedThisYear: 6000,
      percentageUsedThisYear: 50
    }));
  });

  it('should respond with 401 if no authorization header is provided', async () => {
    const response = await request(app).get('/time-periods-ratios');

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });

  it('should respond with 401 if incorrect authorization header is provided', async () => {
    const response = await request(app)
      .get('/time-periods-ratios')
      .set('Authorization', INCORRECT_TOKEN);

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });
});


describe('GET /WeekRatio', () => {
  beforeAll(() => {
    // Mock implementation of database query for current and last week ratios
    const mockCurrentWeekQuery = "SELECT date, tokensBoughtThisDay, unitsUsedThisDay FROM mockCurrentWeekTable";
    const mockLastWeekQuery = "SELECT date, tokensBoughtThisDay, unitsUsedThisDay FROM mockLastWeekTable";
    
    connection.query.mockImplementation((query, callback) => {
      if (query === mockCurrentWeekQuery) {
        callback(null, [{ date: '2023-01-01', tokensBoughtThisDay: 10, unitsUsedThisDay: 5 }]);
      } else if (query === mockLastWeekQuery) {
        callback(null, [{ date: '2022-12-25', tokensBoughtThisDay: 8, unitsUsedThisDay: 4 }]);
      } else {
        callback(new Error('Invalid query'));
      }
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with the correct structure and status code', async () => {
    const response = await request(app)
      .get('/WeekRatio')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      currentWeek: [{ date: '2023-01-01', tokensBoughtThisDay: 10, unitsUsedThisDay: 5, percentageUsedThisDay: 50 }],
      lastWeek: [{ date: '2022-12-25', tokensBoughtThisDay: 8, unitsUsedThisDay: 4, percentageUsedThisDay: 50 }]
    }));
  });

  it('should respond with 401 if no authorization header is provided', async () => {
    const response = await request(app).get('/WeekRatio');

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });

  it('should respond with 401 if incorrect authorization header is provided', async () => {
    const response = await request(app)
      .get('/WeekRatio')
      .set('Authorization', INCORRECT_TOKEN);

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });
});


describe('GET /monthRatios', () => {
  beforeAll(() => {
    // Mock implementation of database query for current and last year month ratios
    const mockCurrentYearQuery = "SELECT month, tokensBoughtThisMonth, unitsUsedThisMonth FROM mockCurrentYearTable";
    const mockLastYearQuery = "SELECT month, tokensBoughtThisMonth, unitsUsedThisMonth FROM mockLastYearTable";
    
    connection.query.mockImplementation((query, callback) => {
      if (query === mockCurrentYearQuery) {
        callback(null, [{ month: 1, tokensBoughtThisMonth: 100, unitsUsedThisMonth: 50 }]);
      } else if (query === mockLastYearQuery) {
        callback(null, [{ month: 1, tokensBoughtThisMonth: 80, unitsUsedThisMonth: 40 }]);
      } else {
        callback(new Error('Invalid query'));
      }
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with the correct structure and status code', async () => {
    const response = await request(app)
      .get('/monthRatios')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      currentYear: [{ month: 1, tokensBoughtThisMonth: 100, unitsUsedThisMonth: 50, percentageUsedThisMonth: 50 }],
      lastYear: [{ month: 1, tokensBoughtThisMonth: 80, unitsUsedThisMonth: 40, percentageUsedThisMonth: 50 }]
    }));
  });

  it('should respond with 401 if no authorization header is provided', async () => {
    const response = await request(app).get('/monthRatios');

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });

  it('should respond with 401 if incorrect authorization header is provided', async () => {
    const response = await request(app)
      .get('/monthRatios')
      .set('Authorization', INCORRECT_TOKEN);

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });
});
