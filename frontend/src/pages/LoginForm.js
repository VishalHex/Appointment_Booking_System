import React, { useState } from 'react';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!validateEmail(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form);
      setMessage('Login successful!');
      onLogin && onLogin(res.data.token, res.data.user);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8, background: '#fafafa' }}>
      <h2>Login</h2>
      <div style={{ marginBottom: 10 }}>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={{ width: '100%' }} />
        {errors.email && <div style={{ color: 'red', fontSize: 12 }}>{errors.email}</div>}
      </div>
      <div style={{ marginBottom: 10 }}>
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} style={{ width: '100%' }} />
        {errors.password && <div style={{ color: 'red', fontSize: 12 }}>{errors.password}</div>}
      </div>
      <button type="submit" disabled={loading} style={{ width: '100%', padding: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <div style={{ marginTop: 10, color: message.includes('success') ? 'green' : 'red' }}>{message}</div>
    </form>
  );
}
