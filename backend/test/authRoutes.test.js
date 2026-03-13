import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import router from '../src/routes.js';
import { User } from '../src/models.js';

const app = express();
app.use(express.json());
app.use('/api', router);

before(async () => {
  // Shared setup already syncs the database.
});

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test-user@example.com',
        password: 'password123',
        role: 'client'
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('user');
    expect(res.body.user.email).to.equal('test-user@example.com');
  });

  it('should reject registration with invalid payload', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'X',
        email: 'not-an-email',
        password: '123',
        role: 'client'
      });

    expect(res.status).to.equal(400);
  });

  it('should reject duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate User',
        email: 'test-user@example.com',
        password: 'password123',
        role: 'client'
      });

    expect(res.status).to.equal(400);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-user@example.com',
        password: 'password123'
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test-user@example.com',
        password: 'wrongpass'
      });

    expect(res.status).to.equal(401);
  });

  it('should reject login for non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nope@example.com',
        password: 'password123'
      });

    expect(res.status).to.equal(401);
  });
});
