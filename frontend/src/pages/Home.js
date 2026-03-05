import React, { useState } from 'react';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import AppointmentBooking from './AppointmentBooking';
import ProviderCalendar from './ProviderCalendar';

export default function Home() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  return (
    <div>
      <h1>Welcome to Appointment Booking</h1>
      {!token ? (
        <>
          <LoginForm onLogin={(t, u) => { setToken(t); setUser(u); }} />
          <RegisterForm />
        </>
      ) : (
        <>
          {user?.role === 'client' && <AppointmentBooking token={token} />}
          {user?.role === 'provider' && <ProviderCalendar token={token} providerId={user.id} />}
          <button onClick={() => { setToken(null); setUser(null); }}>Logout</button>
        </>
      )}
    </div>
  );
}
