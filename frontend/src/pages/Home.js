import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL;

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    if (token && user) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const aptData = Array.isArray(res.data) ? res.data : res.data.appointments || [];
      setAppointments(aptData);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await axios.delete(`${API_URL}/api/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(appointments.filter(a => a.id !== appointmentId));
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_time);
    const now = new Date();
    if (filter === 'upcoming') return aptDate > now && apt.status !== 'cancelled';
    if (filter === 'past') return aptDate <= now;
    return true;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      booked: { label: 'Accepted', color: '#28a745', bgColor: '#e8f5e9' },
      cancelled: { label: 'Cancelled', color: '#dc3545', bgColor: '#ffebee' },
      completed: { label: 'Completed', color: '#17a2b8', bgColor: '#e0f7fa' }
    };
    return statusMap[status] || { label: status, color: '#666', bgColor: '#f5f5f5' };
  };

  // Show dashboard for authenticated users
  if (token && user && !loading) {
    return (
      <div className="home">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1>My Appointments</h1>
              <p className="subtitle">Manage and track your bookings</p>
            </div>
            <div>
              <button onClick={() => navigate('/book')} className="btn btn-primary">
                + Book New Appointment
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>{appointments.filter(a => new Date(a.appointment_time) > new Date() && a.status !== 'cancelled').length}</h3>
                <p>Upcoming Appointments</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✓</div>
              <div className="stat-content">
                <h3>{appointments.filter(a => a.status === 'completed').length}</h3>
                <p>Completed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✕</div>
              <div className="stat-content">
                <h3>{appointments.filter(a => a.status === 'cancelled').length}</h3>
                <p>Cancelled</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="dashboard-filters">
            <button
              className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Past
            </button>
          </div>

          {/* Appointments List */}
          <div className="appointments-list">
            {filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No {filter} appointments</h3>
                <p>You have no {filter} appointments at the moment.</p>
                <div class="d-inline-block">
                  <button onClick={() => navigate('/book')} className="btn btn-primary">
                    Book First Appointment
                  </button>
                </div>
              </div>
            ) : (
              filteredAppointments.map(apt => {
                const statusInfo = getStatusBadge(apt.status);
                return (
                  <div key={apt.id} className="appointment-card">
                    <div className="appointment-info">
                      <div className="appointment-date">
                        <div className="appointment-day">
                          {new Date(apt.appointment_time).getDate()}
                        </div>
                        <div className="appointment-month">
                          {new Date(apt.appointment_time).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      <div className="appointment-details">
                        <h4>{apt.provider?.service_name || 'Appointment'}</h4>
                        <p className="provider">{apt.provider?.service_name || `Provider #${apt.provider_id}`}</p>
                        <p className="time">
                          🕐 {new Date(apt.appointment_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="appointment-status-actions">
                      <span
                        className="status-badge"
                        style={{
                          color: statusInfo.color,
                          backgroundColor: statusInfo.bgColor,
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {statusInfo.label}
                      </span>
                      {new Date(apt.appointment_time) > new Date() && apt.status !== 'cancelled' && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return <div className="home"><div className="spinner"></div></div>;
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
          <div className="d-inline-block">
            <Link to="/register" className="btn btn-primary btn-large">Start Booking Now</Link>
          </div>
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
