
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FormContainer from '../components/FormContainer';
import FormField from '../components/FormField';
import Button from '../components/Button';
import '../components/FormContainer.css';
const API_URL = process.env.REACT_APP_API_URL;

export default function AppointmentBooking({ token }) {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/providers`).then(res => setProviders(res.data));
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      axios.get(`${API_URL}/api/providers/${selectedProvider}/slots`).then(res => setSlots(res.data));
    } else {
      setSlots([]);
    }
  }, [selectedProvider]);

  const handleBook = async e => {
    e.preventDefault();
    if (!selectedProvider || !selectedSlot) {
      setMessage('Please select a provider and a time slot.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/appointments`, {
        provider_id: selectedProvider,
        appointment_time: selectedSlot
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Appointment booked! Reminder will be sent.');
      setSelectedProvider('');
      setSelectedSlot('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleBook}>
        <h2>Book Appointment</h2>
        <FormField>
          <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)} required>
            <option value="">Select Provider</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.service_name}</option>)}
          </select>
        </FormField>
        <FormField>
          <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} required disabled={!slots.length}>
            <option value="">Select Time Slot</option>
            {slots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
          </select>
        </FormField>
        <Button type="submit" disabled={!selectedProvider || !selectedSlot || loading}>
          {loading ? 'Booking...' : 'Book'}
        </Button>
        <div style={{ marginTop: 10, color: message.includes('booked') ? 'green' : 'red' }}>{message}</div>
      </form>
    </FormContainer>
  );
}
