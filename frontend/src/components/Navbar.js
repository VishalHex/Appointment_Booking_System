import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { FaCalendarAlt } from 'react-icons/fa';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  const isActive = (path) => {
    return window.location.pathname === path ? 'active-link' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span className="logo-icon"><FaCalendarAlt /></span>
            <span className="logo-text">AppointmentPro</span>
          </Link>
        </div>

        <button
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          {token && (
            <li>
              <Link to="/book" className={`nav-link ${isActive('/book')}`} onClick={() => setIsMenuOpen(false)}>
                Book Appointment
              </Link>
            </li>
          )}
          {!token && (
            <>
              <li>
                <Link to="/login" className={`nav-link ${isActive('/login')}`} onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className={`nav-link ${isActive('/register')}`} onClick={() => setIsMenuOpen(false)}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className={`nav-user ${isMenuOpen ? 'active' : ''}`}>
          {token && user ? (
            <div className="user-profile">
              <span className="user-avatar">{user.name?.charAt(0).toUpperCase()}</span>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
