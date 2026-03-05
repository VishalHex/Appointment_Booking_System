import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (token && user) {
    navigate(user.role === 'provider' ? '/provider-dashboard' : '/dashboard');
    return null;
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Professional Appointment Booking Made Easy</h1>
          <p>Schedule appointments with service providers in just a few clicks. Receive automatic reminders and manage your calendar effortlessly.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="illustration">📅</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose AppointmentPro?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Easy Booking</h3>
              <p>Intuitive interface to browse providers and select available time slots with just a few clicks.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📬</div>
              <h3>Smart Reminders</h3>
              <p>Automatic email and SMS reminders before your appointments so you never miss them again.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Manage Calendar</h3>
              <p>View all your appointments in one place and easily reschedule or cancel when needed.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>For Providers</h3>
              <p>Manage your availability, track bookings, and grow your business with our provider dashboard.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Safe</h3>
              <p>Your data is protected with secure authentication and industry-standard security practices.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast & Reliable</h3>
              <p>Lightning-fast booking confirmation with a reliable system you can depend on.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Sign Up</h4>
              <p>Create your account as a client or service provider</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Browse</h4>
              <p>Find service providers that match your needs</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Book</h4>
              <p>Select available time slot and book instantly</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h4>Confirm</h4>
              <p>Get confirmation and reminders automatically</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to streamline your appointments?</h2>
          <p>Join thousands of users who trust AppointmentPro for their scheduling needs.</p>
          <Link to="/register" className="btn btn-primary btn-large">Start Booking Now</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 AppointmentPro. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
