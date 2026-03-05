import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import router from '../src/routes.js';
import { User } from '../src/models.js';

const app = express();
app.use(express.json());
app.use('/api', router);

describe('API Routes', () => {
  before(async () => {
    await User.sync({ force: true });
  });

  it('should register via /api/auth/register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'api@example.com', password: 'password123', role: 'client' });
    expect(res.status).to.equal(201);
    expect(res.body.user.email).to.equal('api@example.com');
  });

  it('should login via /api/auth/login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'api@example.com', password: 'password123' });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
  });
});
