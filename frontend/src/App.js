import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AppointmentBooking from './pages/AppointmentBooking';
import ProviderDashboard from './pages/ProviderDashboard';
import ManageProviders from './pages/ManageProviders';
import RegisterProvider from './pages/RegisterProvider';
import axios from 'axios';

function App() {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.data.logout) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

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
        <Route
          path="/admin/providers"
          element={
            <ProtectedAdminRoute>
              <ManageProviders />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/providers/new"
          element={
            <ProtectedAdminRoute>
              <RegisterProvider />
            </ProtectedAdminRoute>
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

function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;
