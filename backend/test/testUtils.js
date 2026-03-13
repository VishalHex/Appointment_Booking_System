import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../src/models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function registerAndLogin(app, { name, email, password, role }) {
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password, role });

  if (registerRes.status !== 201) {
    throw new Error(`Register failed: ${registerRes.status} ${JSON.stringify(registerRes.body)}`);
  }

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  if (loginRes.status !== 200) {
    throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(loginRes.body)}`);
  }

  return {
    token: `Bearer ${loginRes.body.token}`,
    user: loginRes.body.user
  };
}

export async function createProviderProfile(app, adminToken, { user_id, service_name, description }) {
  const res = await request(app)
    .post('/api/providers')
    .set('Authorization', adminToken)
    .send({ user_id, service_name, description });

  if (res.status !== 201) {
    throw new Error(`Create provider failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return res;
}

export async function seedUser({ name, email, password, role }) {
  const password_hash = await bcrypt.hash(password, 10);
  return User.create({ name, email, password_hash, role });
}

export function signToken(user) {
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  return `Bearer ${token}`;
}
