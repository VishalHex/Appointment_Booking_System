import React, { useState } from 'react';
import axios from 'axios';
import FormContainer from '../components/FormContainer';
import FormField from '../components/FormField';
import Button from '../components/Button';
import '../components/FormContainer.css';

const API_URL = process.env.REACT_APP_API_URL;

function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!validateEmail(form.email)) errs.email = 'Please enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (!validatePassword(form.password)) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: undefined });
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
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: form.email,
        password: form.password
      });
      setMessage('✓ Login successful! Redirecting...');
      setTimeout(() => {
        onLogin && onLogin(res.data.token, res.data.user);
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.error || '✗ Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <FormField label="Email Address" error={errors.email}>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />
        </FormField>

        {/* Password Field */}
        <FormField label="Password" error={errors.password}>
          <div style={{ position: 'relative' }}>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </FormField>

        {/* Remember Me */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>Remember me</span>
          </label>
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={loading}>
          {loading ? '⏳ Logging in...' : 'Sign In'}
        </Button>

        {/* Message */}
        {message && (
          <div className={message.includes('✓') ? 'form-success' : 'form-error'} style={{ marginTop: '1rem' }}>
            {message}
          </div>
        )}
      </form>
    </FormContainer>
  );
}
