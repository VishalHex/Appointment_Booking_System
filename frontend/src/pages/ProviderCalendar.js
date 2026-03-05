import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

export default function ProviderCalendar({ token, providerId }) {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (providerId) {
      axios.get(`${API_URL}/api/providers/${providerId}/calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setAppointments(res.data));
    }
  }, [providerId, token]);

  return (
    <div>
      <h2>Provider Calendar</h2>
      <ul>
        {appointments.map(app => (
          <li key={app.id}>
            {app.appointment_time} - {app.status} (Client: {app.client_id})
          </li>
        ))}
      </ul>
    </div>
  );
}
