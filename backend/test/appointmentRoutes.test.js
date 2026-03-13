import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import router from '../src/routes.js';

const app = express();
app.use(express.json());
app.use('/api', router);

const {
  adminToken,
  providerToken,
  clientToken,
  otherClientToken,
  providerId
} = globalThis.__testData;
let appointmentId;

before(async () => {
  if (!providerId) {
    throw new Error('Seeded providerId is missing');
  }
});

describe('Appointment Routes', () => {
  it('should book appointment as client', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', clientToken)
      .send({
        provider_id: providerId,
        appointment_time: '2026-03-15T10:00:00.000Z'
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('appointment');
    appointmentId = res.body.appointment.id;
  });

  it('should reject booking from non-client role', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', providerToken)
      .send({
        provider_id: providerId,
        appointment_time: '2026-03-15T11:00:00.000Z'
      });

    expect(res.status).to.equal(403);
  });

  it('should prevent duplicate appointment for same client and time', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', clientToken)
      .send({
        provider_id: providerId,
        appointment_time: '2026-03-15T10:00:00.000Z'
      });

    expect(res.status).to.equal(409);
  });

  it('should prevent duplicate appointment for same provider and time', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', otherClientToken)
      .send({
        provider_id: providerId,
        appointment_time: '2026-03-15T10:00:00.000Z'
      });

    expect(res.status).to.equal(409);
  });

  it('should list appointments for client', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', clientToken);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('appointments');
    expect(res.body.appointments.every(a => a.client_id === res.body.appointments[0].client_id)).to.equal(true);
  });

  it('should list appointments for provider', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', providerToken);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('appointments');
  });

  it('should allow provider to update appointment status', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set('Authorization', providerToken)
      .send({ status: 'completed' });

    expect(res.status).to.equal(200);
  });

  it('should reject status update from client', async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/status`)
      .set('Authorization', clientToken)
      .send({ status: 'completed' });

    expect(res.status).to.equal(403);
  });

  it('should allow client to cancel their appointment', async () => {
    const res = await request(app)
      .post(`/api/appointments/${appointmentId}/cancel`)
      .set('Authorization', clientToken);

    expect(res.status).to.equal(200);
  });

  it('should prevent other client from cancelling appointment', async () => {
    const res = await request(app)
      .post(`/api/appointments/${appointmentId}/cancel`)
      .set('Authorization', otherClientToken);

    expect(res.status).to.equal(403);
  });

  it('should allow admin to cancel appointment', async () => {
    const res = await request(app)
      .post(`/api/appointments/${appointmentId}/cancel`)
      .set('Authorization', adminToken);

    expect(res.status).to.equal(200);
  });

  it('should list available slots without auth', async () => {
    const res = await request(app)
      .get(`/api/appointments/provider/${providerId}/slots`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });
});
