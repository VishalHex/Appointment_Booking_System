import { registerUser, authenticateUser } from '../services/authService.js';

export async function register(req, res) {
  try {
    const user = await registerUser(req.body);
    // Remove sensitive fields before sending response
    const { password_hash, ...safeUser } = user.toJSON();
    res.status(201).json({ user: safeUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { user, token } = await authenticateUser(req.body.email, req.body.password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    // Remove sensitive fields before sending response
    const { password_hash, ...safeUser } = user.toJSON();
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ error: err.message });
  }
}
