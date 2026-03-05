import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import '../pages/Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleRegistrationSuccess = () => {
    setRegistrationSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  if (registrationSuccess) {
    return (
      <div className="auth-page">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Registration Successful!</h2>
          <p>Your account has been created. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join AppointmentPro today</p>
          </div>
          <RegisterForm onSuccess={handleRegistrationSuccess} />
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Sign in here</Link></p>
          </div>
        </div>
        <div className="auth-image">
          <div className="image-placeholder">👋</div>
          <h3>Welcome Aboard</h3>
          <p>Get started in just a few minutes with AppointmentPro.</p>
        </div>
      </div>
    </div>
  );
}
