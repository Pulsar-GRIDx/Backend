const request = require('supertest');
const app = require('../app');

const JWT_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBZG1pbl9JRCI6MTAsIkVtYWlsIjoiYWRtaW5AcHVsc2FyLmNvbSIsIkFjY2Vzc0xldmVsIjoiMSIsImlhdCI6MTcxOTIyOTk3MCwiZXhwIjoxNzE5MjMzNTcwfQ.haI420DfP3SfmVCdi0eO3g7Vp0y9RA6kIF04eFL48ww';


jest.spyOn(console, 'error').mockImplementation(() => {});


describe('Test /totalMeters route', () => {
  it('should return total meters', async () => {
    const response = await request(app)
      .get('/totalMeters')
      .set('Authorization', JWT_TOKEN); 
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalMeters');
    expect(typeof response.body.totalMeters).toBe('number');
  });

  it('should return 401 if no token is provided ', async () => {
    const response = await request(app).get('/totalMeters');
    expect(response.status).toBe(401);
  });

 
  
});


