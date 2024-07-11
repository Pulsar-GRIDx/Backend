const request = require('supertest');
const express = require('express');
const router = require('../../meter/getSuburbEnergyRoute');
const connection = require('../../config/db');
const NodeCache = require('node-cache');
const jwt = require('jsonwebtoken');

jest.mock('../../config/db');

const app = express();
app.use(express.json());
app.use('/', router);

// Mock JWT token
const INCORRECT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBZG1pbl9JRCI6MTAsIkVtYWlsIjoiYWRtaW5AcHVsc2FyLmNvbSIsIkFjY2Vzc0xldmVsIjoiMSIsImlhdCI6MTcyMDY5NjcyMiwiZXhwIjoxNzIwNzAwMzIyfQ.RdgARr3aHiscUZa2qH1TIQMIAGMwtOIF9qaMKiYq6JI';

const SECRET_KEY = process.env.SECRET_KEY || 'test_secret_key';
const AUTH_TOKEN = jwt.sign({ user: 'testUser' }, SECRET_KEY, { expiresIn: '1h' });

// Mock NodeCache
jest.mock('node-cache');
const mockCache = new NodeCache();
mockCache.get = jest.fn();
mockCache.set = jest.fn();

// Mocking data for suburbs and cache
const mockSuburbs = ['Academia'];
const mockCacheResult = {
  weekly: 100,
  monthly: 500,
  yearly: 1200
};

describe('POST /getSuburbEnergy', () => {
  beforeAll(() => {
    connection.query.mockImplementation((query, params, callback) => {
      if (query === 'SELECT DISTINCT DRN FROM MeterLocationInfoTable WHERE Suburb = Academia') {
        callback(null, [{ DRN: 'DRN1' }, { DRN: 'DRN2' }]);
      } else {
        callback(new Error('Invalid query'));
      }
    });

    mockCache.get.mockImplementation((suburb) => {
      if (suburb === 'Academia') {
        return mockCacheResult;
      }
      return undefined;
    });

    mockCache.set.mockImplementation((suburb, result) => {
      // Mock implementation for cache set
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond with the correct structure and status code', async () => {
    const response = await request(app)
      .post('/getSuburbEnergy')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ suburbs: mockSuburbs });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      suburbsWeekly: { Suburb1: mockCacheResult.weekly, Suburb2: undefined },
      suburbsMonthly: { Suburb1: mockCacheResult.monthly, Suburb2: undefined },
      suburbsYearly: { Suburb1: mockCacheResult.yearly, Suburb2: undefined }
    });
  });

  it('should respond with 400 if suburbs data is not an array', async () => {
    const response = await request(app)
      .post('/getSuburbEnergy')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ suburbs: 'Sub9' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid suburbs data. Expecting an array.' });
  });

  it('should respond with 500 if database query fails', async () => {
    connection.query.mockImplementationOnce((query, params, callback) => {
      callback(new Error('Database query error'));
    });

    const response = await request(app)
      .post('/getSuburbEnergy')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .send({ suburbs: mockSuburbs });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'An error occurred while querying the database.' });
  });

  it('should respond with 401 if no authorization header is provided', async () => {
    const response = await request(app)
      .post('/getSuburbEnergy')
      .send({ suburbs: mockSuburbs });

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });

  it('should respond with 401 if incorrect authorization header is provided', async () => {
    const response = await request(app)
      .post('/getSuburbEnergy')
      .set('Authorization', INCORRECT_TOKEN)
      .send({ suburbs: mockSuburbs });

    expect(response.status).toBe(401);
    expect(response.text).toBe('Unauthorized');
  });
});
