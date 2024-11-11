const request = require('supertest');
const app = require('../app/index');

describe('API Endpoints', () => {
  describe('GET /api/', () => {
    it('should return welcome message', async () => {
      const res = await request(app).get('/api/');
      expect(res.statusCode).toEqual(200);
      expect(res.text).toBe('Welcome to SecureApp API');
    });
  });

  describe('POST /api/data', () => {
    it('should accept and return posted data', async () => {
      const testData = { test: 'value' };
      const res = await request(app)
        .post('/api/data')
        .send(testData);
      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toEqual(testData);
    });
  });
});