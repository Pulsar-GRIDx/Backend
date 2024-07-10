const request = require('supertest');
const express = require('express');
const router = require('../../routes/meterPercentageCountRoutes');
const connection = require('../../config/db');
const jwt = require('jsonwebtoken');

jest.mock('../../config/db');

const app = express();
app.use('/', router);

// Mock JWT token
const INCORRECT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBZG1pbl9JRCI6MTAsIkVtYWlsIjoiYWRtaW5AcHVsc2FyLmNvbSIsIkFjY2Vzc0xldmVsIjoiMSIsImlhdCI6MTcyMDYwMjk5MCwiZXhwIjoxNzIwNjA2NTkwfQ.8YUDQQTELCzdb_jKMzkBVRmk6UYUIiAgiuyvENHw6OU';

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