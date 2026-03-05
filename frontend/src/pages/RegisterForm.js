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

function validateName(name) {
    return name && name.trim().length >= 2;
}

function validatePassword(password) {
    return password && password.length >= 6;
}

export default function RegisterForm({ onSuccess }) {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'client' });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        const errs = {};
        if (!validateName(form.name)) errs.name = 'Name must be at least 2 characters';
        if (!form.email) errs.email = 'Email is required';
        else if (!validateEmail(form.email)) errs.email = 'Please enter a valid email';
        if (!validatePassword(form.password)) errs.password = 'Password must be at least 6 characters';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        return errs;
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
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
            await axios.post(`${API_URL}/api/auth/register`, {
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role
            });
            setMessage('✓ Account created! Redirecting to login...');
            setTimeout(() => {
                onSuccess && onSuccess();
            }, 1500);
        } catch (err) {
            setMessage(err.response?.data?.error || '✗ Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormContainer>
            <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <FormField label="Full Name" error={errors.name}>
                    <input
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </FormField>

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

                {/* Role Field */}
                <FormField label="I am a" error={errors.role}>
                    <select name="role" value={form.role} onChange={handleChange} disabled={loading}>
                        <option value="client">Client (Booking Appointments)</option>
                        <option value="provider">Service Provider</option>
                    </select>
                </FormField>

                {/* Password Field */}
                <FormField label="Password" error={errors.password}>
                    <div style={{ position: 'relative' }}>
                        <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="At least 6 characters"
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

                {/* Confirm Password Field */}
                <FormField label="Confirm Password" error={errors.confirmPassword}>
                    <input
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </FormField>

                {/* Submit Button */}
                <Button type="submit" disabled={loading}>
                    {loading ? '⏳ Creating Account...' : 'Create Account'}
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
