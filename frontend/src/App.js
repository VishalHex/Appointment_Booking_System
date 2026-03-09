import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AppointmentBooking from './pages/AppointmentBooking';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <ProtectedAuthPages>
              <Login />
            </ProtectedAuthPages>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedAuthPages>
              <Register />
            </ProtectedAuthPages>
          }
        />
        <Route path="/book" element={<AppointmentBooking />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function ProtectedAuthPages({ children }) {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/'); // Redirect logged-in users to the home page
    }
  }, [token, navigate]);

  return children;
}

export default App;
