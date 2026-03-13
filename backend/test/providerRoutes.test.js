import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import router from '../src/routes.js';
import { createProviderProfile, seedUser } from './testUtils.js';

const app = express();
app.use(express.json());
app.use('/api', router);

const {
  adminToken,
  clientToken,
  providerToken,
  clientUserId
} = globalThis.__testData;
let providerId;
let providerUserId;

before(async () => {
  const providerUser = await seedUser({
    name: 'Provider Routes Suite',
    email: 'provider-routes-suite@example.com',
    password: 'password123',
    role: 'provider'
  });
  providerUserId = providerUser.id;
});

describe('Provider Routes', () => {
  it('should list providers', async () => {
    const res = await request(app).get('/api/providers');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body.length).to.be.greaterThan(0);
  });

  it('should allow admin to create provider profile', async () => {
    const res = await createProviderProfile(app, adminToken, {
      user_id: providerUserId,
      service_name: 'Dental Care',
      description: 'General dental services'
    });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('provider');
    providerId = res.body.provider.id;
  });

  it('should prevent non-admin from creating provider profile', async () => {
    const res = await request(app)
      .post('/api/providers')
      .set('Authorization', clientToken)
      .send({
        user_id: providerUserId,
        service_name: 'Not Allowed',
        description: 'Should fail'
      });

    expect(res.status).to.equal(403);
  });

  it('should reject provider profile for non-provider role', async () => {
    const res = await request(app)
      .post('/api/providers')
      .set('Authorization', adminToken)
      .send({
        user_id: clientUserId,
        service_name: 'Invalid',
        description: 'Invalid role'
      });

    expect(res.status).to.equal(400);
  });

  it('should reject duplicate provider profiles for same user', async () => {
    const res = await request(app)
      .post('/api/providers')
      .set('Authorization', adminToken)
      .send({
        user_id: providerUserId,
        service_name: 'Duplicate',
        description: 'Duplicate profile'
      });

    expect(res.status).to.equal(409);
  });

  it('should list provider users for admin', async () => {
    const res = await request(app)
      .get('/api/providers/users')
      .set('Authorization', adminToken);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    const match = res.body.find(u => u.id === providerUserId);
    expect(match).to.have.property('hasProvider', true);
  });

  it('should update provider details as admin', async () => {
    const res = await request(app)
      .patch(`/api/providers/${providerId}`)
      .set('Authorization', adminToken)
      .send({
        service_name: 'Advanced Dental Care',
        description: 'Updated description'
      });

    expect(res.status).to.equal(200);
    expect(res.body.provider.service_name).to.equal('Advanced Dental Care');
  });

  it('should return provider slots without auth', async () => {
    const res = await request(app)
      .get(`/api/providers/${providerId}/slots`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('should return provider calendar without auth', async () => {
    const res = await request(app)
      .get(`/api/providers/${providerId}/calendar`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('calendar');
  });

  it('should reject provider update for non-admin', async () => {
    const res = await request(app)
      .patch(`/api/providers/${providerId}`)
      .set('Authorization', providerToken)
      .send({ service_name: 'Should fail' });

    expect(res.status).to.equal(403);
  });

  it('should delete provider as admin', async () => {
    const res = await request(app)
      .delete(`/api/providers/${providerId}`)
      .set('Authorization', adminToken);

    expect(res.status).to.equal(200);
  });
});
