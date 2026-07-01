const request = require('supertest');
const server = require('../server');

describe('API Endpoints', () => {
  afterAll((done) => {
    server.close(done);
  });

  describe('GET /', () => {
    test('should return welcome message with status 200', async () => {
      const response = await request(server).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Hello from Kubernetes CI/CD Pipeline!');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('hostname');
    });

    test('should return valid JSON', async () => {
      const response = await request(server).get('/');
      
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeInstanceOf(Object);
    });
  });

  describe('GET /health', () => {
    test('should return healthy status', async () => {
      const response = await request(server).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should return uptime as number', async () => {
      const response = await request(server).get('/health');
      
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /ready', () => {
    test('should return ready status', async () => {
      const response = await request(server).get('/ready');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ready');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /nonexistent', () => {
    test('should return 404 for non-existent route', async () => {
      const response = await request(server).get('/nonexistent');
      
      expect(response.status).toBe(404);
    });
  });
});
