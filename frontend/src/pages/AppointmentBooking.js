import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/AppointmentBooking.css';

const API_URL = process.env.REACT_APP_API_URL;

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProviders();
  }, [token, navigate]);

  useEffect(() => {
    if (selectedProvider) {
      fetchSlots();
    } else {
      setSlots([]);
    }
  }, [selectedProvider]);

  const fetchProviders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/providers`);
      setProviders(res.data || []);
    } catch (err) {
      console.error('Failed to fetch providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/providers/${selectedProvider.id}/slots`);
      setSlots(res.data || []);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setSlots([]);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedProvider || !selectedSlot) {
      setMessage('Please select a provider and time slot');
      return;
    }

    setBooking(true);
    try {
      await axios.post(
        `${API_URL}/api/appointments`,
        {
          provider_id: selectedProvider.id,
          appointment_time: selectedSlot
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✓ Appointment booked successfully! You will receive a confirmation email.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setMessage('✗ Failed to book appointment. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="appointment-booking"><div className="spinner"></div></div>;
  }

  return (
    <div className="appointment-booking">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Book an Appointment</h1>
          <p>Select a service provider and choose your preferred time slot</p>
        </div>

        {/* Step 1: Select Provider */}
        <div className="booking-section">
          <h2>Step 1: Select Service Provider</h2>
          <div className="providers-grid">
            {providers.map(provider => (
              <div
                key={provider.id}
                className={`provider-card ${selectedProvider?.id === provider.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedProvider(provider);
                  setSelectedSlot(null);
                }}
              >
                <div className="provider-icon">👨‍💼</div>
                <h3>{provider.service_name}</h3>
                <p className="provider-name">{provider.name || 'Service Provider'}</p>
                <p className="provider-details">{provider.service_description || 'Professional services'}</p>
                <div className="provider-rating">
                  ⭐ {(Math.random() * 1 + 4).toFixed(1)} (42 reviews)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Select Time Slot */}
        {selectedProvider && (
          <div className="booking-section">
            <h2>Step 2: Select Time Slot</h2>
            {slots.length === 0 ? (
              <div className="no-slots">
                <p>No available slots for this provider. Please try another provider or date.</p>
              </div>
            ) : (
              <div className="slots-grid">
                {slots.map((slot, idx) => (
                  <button
                    key={idx}
                    className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {new Date(slot).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {selectedProvider && selectedSlot && (
          <div className="booking-section booking-confirmation">
            <h2>Step 3: Confirm Booking</h2>
            <div className="confirmation-details">
              <div className="detail-row">
                <span>Provider:</span>
                <strong>{selectedProvider.service_name}</strong>
              </div>
              <div className="detail-row">
                <span>Date & Time:</span>
                <strong>
                  {new Date(selectedSlot).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={message.includes('✓') ? 'booking-success' : 'booking-error'}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="booking-actions">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleBookAppointment}
            disabled={!selectedProvider || !selectedSlot || booking}
            className="btn btn-primary"
          >
            {booking ? '⏳ Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
