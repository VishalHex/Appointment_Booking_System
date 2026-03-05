import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">
            <span className="logo-icon">📅</span>
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
          <li><Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
          {token && <li><Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>Dashboard</Link></li>}
          {token && <li><Link to="/book" className="nav-link" onClick={() => setIsMenuOpen(false)}>Book</Link></li>}
          {!token && (
            <>
              <li><Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>Login</Link></li>
              <li><Link to="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>Register</Link></li>
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
