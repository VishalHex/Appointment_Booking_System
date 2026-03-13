import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import router from '../src/routes.js';
import { Provider } from '../src/models.js';
import { createProviderProfile, seedUser } from './testUtils.js';

const app = express();
app.use(express.json());
app.use('/api', router);

const { adminToken } = globalThis.__testData;
let providerUserId;

before(async () => {
  const providerUser = await seedUser({
    name: 'Provider Admin Suite',
    email: 'provider-admin-suite@example.com',
    password: 'password123',
    role: 'provider'
  });
  providerUserId = providerUser.id;
});

describe('Admin Provider Management', () => {
  it('should list provider users for admin', async () => {
    const res = await request(app)
      .get('/api/providers/users')
      .set('Authorization', adminToken);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body.some(u => u.id === providerUserId)).to.equal(true);
  });

  it('should create a provider profile for a provider user', async () => {
    const res = await createProviderProfile(app, adminToken, {
      user_id: providerUserId,
      service_name: 'Dental Care',
      description: 'General dental services'
    });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('provider');
  });

  it('should prevent duplicate provider profiles for the same user', async () => {
    const res = await request(app)
      .post('/api/providers')
      .set('Authorization', adminToken)
      .send({
        user_id: providerUserId,
        service_name: 'Dental Care',
        description: 'Duplicate profile attempt'
      });

    expect(res.status).to.equal(409);
  });

  it('should allow admin to update provider details', async () => {
    const provider = await Provider.findOne({ where: { user_id: providerUserId } });

    const res = await request(app)
      .patch(`/api/providers/${provider.id}`)
      .set('Authorization', adminToken)
      .send({
        service_name: 'Advanced Dental Care',
        description: 'Updated description'
      });

    expect(res.status).to.equal(200);
    expect(res.body.provider.service_name).to.equal('Advanced Dental Care');
  });
});
