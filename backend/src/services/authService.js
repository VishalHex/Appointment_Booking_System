import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function registerUser({ name, email, password, role }) {
  try {
    console.log('Registering user with email:', name, email, password, role);
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash, role });
    return user;
  } catch (err) {
    throw new Error('Registration failed: ' + err.message);
  }
}

export async function authenticateUser(email, password) {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return null;
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    return { user, token };
  } catch (err) {
    throw new Error('Authentication failed: ' + err.message);
  }
}
