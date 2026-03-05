import React, { useState } from 'react';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export default function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!validateEmail(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleChange = e => {
    try {
      setForm({ ...form, [e.target.name]: e.target.value });
      setErrors({ ...errors, [e.target.name]: undefined });
    } catch (err) {
      setMessage('Error updating form: ' + err.message);
    }
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
      await axios.post(`${API_URL}/api/auth/register`, form);
      setMessage('Registration successful!');
      setForm({ name: '', email: '', password: '', role: 'client' });
    } catch (err) {
      setMessage(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8, background: '#fafafa' }}>
      <h2>Register</h2>
      <div style={{ marginBottom: 10 }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={{ width: '100%' }} />
        {errors.name && <div style={{ color: 'red', fontSize: 12 }}>{errors.name}</div>}
      </div>
      <div style={{ marginBottom: 10 }}>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={{ width: '100%' }} />
        {errors.email && <div style={{ color: 'red', fontSize: 12 }}>{errors.email}</div>}
      </div>
      <div style={{ marginBottom: 10 }}>
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} style={{ width: '100%' }} />
        {errors.password && <div style={{ color: 'red', fontSize: 12 }}>{errors.password}</div>}
      </div>
      <div style={{ marginBottom: 10 }}>
        <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%' }}>
          <option value="client">Client</option>
          <option value="provider">Provider</option>
        </select>
      </div>
      <button type="submit" disabled={loading} style={{ width: '100%', padding: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
        {loading ? 'Registering...' : 'Register'}
      </button>
      <div style={{ marginTop: 10, color: message.includes('success') ? 'green' : 'red' }}>{message}</div>
    </form>
  );
}
