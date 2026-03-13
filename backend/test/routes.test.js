import { expect } from 'chai';
import request from 'supertest';
import express from 'express';
import router from '../src/routes.js';

const app = express();
app.use(express.json());
app.use('/api', router);

const {
  adminToken,
  clientToken,
  providerToken,
  providerId
} = globalThis.__testData;
let appointmentId;
before(async () => {
  if (!providerId) {
    throw new Error('Seeded providerId is missing');
  }
});

describe('API Routes', () => {

  describe('/providers Routes', () => {
    it('should list providers', async () => {
      const res = await request(app)
        .get('/api/providers');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('/appointments Routes', () => {

    it('should book appointment', async () => {

      const res = await request(app)
        .post('/api/appointments/')
        .set('Authorization', clientToken)
        .send({
          provider_id: providerId,
          appointment_time: '2026-03-15T10:00:00.000Z'
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('appointment');
      appointmentId = res.body.appointment.id;

    });

    it('should list appointments', async () => {

      const res = await request(app)
        .get('/api/appointments/')
        .set('Authorization', adminToken);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('appointments');

    });

    it('should update appointment status', async () => {

      const res = await request(app)
        .patch(`/api/appointments/${appointmentId}/status`)
        .set('Authorization', providerToken)
        .send({
          status: 'completed'
        });

      expect(res.status).to.equal(200);

    });

    it('should cancel appointment', async () => {

      const res = await request(app)
        .post(`/api/appointments/${appointmentId}/cancel`)
        .set('Authorization', clientToken);

      expect(res.status).to.equal(200);

    });

  });

});
