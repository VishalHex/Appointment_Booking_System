import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AppointmentBooking from './pages/AppointmentBooking';
import ProviderDashboard from './pages/ProviderDashboard';

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
        <Route
          path="/book"
          element={
            <ProtectedRoute>
              <AppointmentBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider-dashboard"
          element={
            <ProtectedRoute>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
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
      navigate('/');
    }
  }, [token, navigate]);

  return children;
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;
