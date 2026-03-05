import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL;

export default function Dashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAppointments();
    }, [token, navigate]);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(Array.isArray(res.data) ? res.data : []);
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
        if (filter === 'upcoming') return aptDate > now;
        if (filter === 'past') return aptDate <= now;
        return true;
    });

    if (loading) {
        return <div className="dashboard"><div className="spinner"></div></div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>My Appointments</h1>
                        <p className="subtitle">Manage and track your bookings</p>
                    </div>
                    <button onClick={() => navigate('/book')} className="btn btn-primary">
                        + Book New Appointment
                    </button>
                </div>

                {/* Stats */}
                <div className="dashboard-stats">
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-content">
                            <h3>{filteredAppointments.length}</h3>
                            <p>{filter === 'upcoming' ? 'Upcoming' : 'Past'} Appointments</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">✓</div>
                        <div className="stat-content">
                            <h3>{appointments.filter(a => new Date(a.appointment_time) <= new Date()).length}</h3>
                            <p>Completed</p>
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
                            <button onClick={() => navigate('/book')} className="btn btn-primary">
                                Book First Appointment
                            </button>
                        </div>
                    ) : (
                        filteredAppointments.map(apt => (
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
                                        <h4>{apt.service_name}</h4>
                                        <p className="provider">{apt.provider_name}</p>
                                        <p className="time">
                                            🕐 {new Date(apt.appointment_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="appointment-actions">
                                    {new Date(apt.appointment_time) > new Date() && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleCancelAppointment(apt.id)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
