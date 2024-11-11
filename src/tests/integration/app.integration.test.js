# app.integration.test.js
const request = require('supertest');
const config = require('../../app/config/config');

const baseUrl = `http://localhost:${config.port}`;

describe('Integration Tests', () => {
  describe('API Integration', () => {
    it('should successfully connect to the API', async () => {
      const res = await request(baseUrl).get('/api/');
      expect(res.statusCode).toEqual(200);
    });

    it('should handle data submission', async () => {
      const testData = { integration: 'test' };
      const res = await request(baseUrl)
        .post('/api/data')
        .send(testData);
      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toEqual(testData);
    });
  });
});