import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/ProviderDashboard.css';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCalendarDay, FaCheck, FaTimes } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

const socket = io(process.env.REACT_APP_API_URL);

export default function ProviderDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('booked');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/appointments`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAppointments(response.data.appointments);
                setFilteredAppointments(response.data.appointments);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [token]);

    useEffect(() => {
        socket.on('newBooking', (data) => {
            toast.success(`New booking received for service: ${data.appointment.provider.service_name}`);
            setAppointments((prevAppointments) => [...prevAppointments, data.appointment]);
        });

        socket.on('appointmentCancelled', (data) => {
            toast.info(`Appointment with "${data.appointment.user.name}" of ${data.appointment.provider.service_name} has been cancelled.`);
            setAppointments((prevAppointments) => prevAppointments.filter(appt => appt.id !== data.appointment.id));
        });

        return () => {
            socket.off('newBooking');
            socket.off('appointmentCancelled');
        };
    }, []);

    useEffect(() => {
        let filtered = appointments;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(appointment => appointment.status === filterStatus);
        }

        if (searchQuery) {
            filtered = filtered.filter(appointment =>
                appointment.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                new Date(appointment.appointment_time).toLocaleDateString().includes(searchQuery)
            );
        }

        setFilteredAppointments(filtered);
    }, [searchQuery, filterStatus, appointments]);

    const markAsCompleted = async (appointmentId) => {
        try {
            await axios.patch(
                `${API_URL}/api/appointments/${appointmentId}/status`,
                { status: 'completed' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const response = await axios.get(`${API_URL}/api/appointments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAppointments(response.data.appointments);
            setFilteredAppointments(response.data.appointments);
        } catch (error) {
            console.error('Error marking appointment as completed:', error);
        }
    };

    if (loading) {
        return <div>Loading appointments...</div>;
    }

    return (
        <div className="home">
            <ToastContainer />
            <div className="container">
                <header className="dashboard-header">
                    <div>
                        <h1>Upcoming Appointments</h1>
                        <p>Manage and track your bookings</p>
                    </div>
                </header>

                <div className="filters">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by client name or date"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="dashboard-stats">
                    <div
                        className={`filter-card ${filterStatus === 'all' ? 'selected' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        <div className="filter-icon"><FaCalendarDay /></div>
                        <div className="filter-content">
                            <h3>{appointments.length}</h3>
                            <p>All</p>
                        </div>
                    </div>
                    <div
                        className={`filter-card ${filterStatus === 'booked' ? 'selected' : ''}`}
                        onClick={() => setFilterStatus('booked')}
                    >
                        <div className="filter-icon"><FaCheck /></div>
                        <div className="filter-content">
                            <h3>{appointments.filter(a => a.status === 'booked').length}</h3>
                            <p>Booked</p>
                        </div>
                    </div>
                    <div
                        className={`filter-card ${filterStatus === 'completed' ? 'selected' : ''}`}
                        onClick={() => setFilterStatus('completed')}
                    >
                        <div className="filter-icon"><FaCheck color='#28a745' /></div>
                        <div className="filter-content">
                            <h3>{appointments.filter(a => a.status === 'completed').length}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div
                        className={`filter-card ${filterStatus === 'cancelled' ? 'selected' : ''}`}
                        onClick={() => setFilterStatus('cancelled')}
                    >
                        <div className="filter-icon"><FaTimes color='#dc3545' /></div>
                        <div className="filter-content">
                            <h3>{appointments.filter(a => a.status === 'cancelled').length}</h3>
                            <p>Cancelled</p>
                        </div>
                    </div>
                </div>

                <div className="appointments-section">
                    {filteredAppointments.length === 0 ? (
                        <p>No appointments found.</p>
                    ) : (
                        <ul className="appointment-list">
                            {filteredAppointments.map((appointment) => (
                                <li key={appointment.id} className="appointment-card-provider">
                                    <div className="appointment-provider-info">
                                        <div className="appointment-date">
                                            <div className="mb-1">{new Date(appointment.appointment_time).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</div>
                                            <div className="appointment-time">{new Date(appointment.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                        <div className="appointment-details">
                                            <h3>{appointment.provider.service_name}</h3>
                                            <p>Status: <span className={`status ${appointment.status}`}>{appointment.status.toUpperCase()}</span></p>
                                        </div>
                                    </div>
                                    <div className="appointment-actions">
                                        <div className='appointment-client'>
                                            <strong>Client Name:</strong> {appointment.client?.name || 'N/A'}
                                        </div>
                                        {appointment.status === 'booked' && (
                                            <button onClick={() => markAsCompleted(appointment.id)} className="complete-button">
                                                Mark as Completed
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}