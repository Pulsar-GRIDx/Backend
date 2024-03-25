//-------------------AuthTesting---------------------------------//

const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Mock your database connection
jest.mock('../src/config/db', () => ({
    query: jest.fn(),
}));

describe('POST /adminSignUp', () =>{
  Test('Should 200 success', async () =>{
    
  })

})