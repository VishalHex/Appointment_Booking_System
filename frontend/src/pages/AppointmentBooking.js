import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/AppointmentBooking.css';
import { FaCalendarDay, FaCheck, FaClock, FaLongArrowAltLeft, FaTools } from 'react-icons/fa';
import { FaSackDollar } from 'react-icons/fa6';
import { FcProcess } from 'react-icons/fc';


const API_URL = process.env.REACT_APP_API_URL;
const TIMEZONE = 'Asia/Kolkata';

function ProgressIndicator({ currentStep, totalSteps }) {
  return (
    <div className="progress-indicator">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="progress-step">
          <div className={`progress-circle ${i < currentStep ? 'completed' : i === currentStep ? 'active' : ''}`}>
            {i < currentStep ? '✓' : i + 1}
          </div>
          <div className="progress-label">
            {i === 0 && 'Service'}
            {i === 1 && 'Date & Time'}
            {i === 2 && 'Confirm'}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarPicker({ selectedDate, onSelectDate, allSlots }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      return new Date(selectedDate);
    }
    return new Date();
  });

  useEffect(() => {
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      setCurrentMonth(new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1));
    }
  }, [selectedDate]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDatesWithSlots = () => {
    if (!allSlots.length) return new Set();
    const datesSet = new Set();
    allSlots.forEach(slot => {
      const dateStr = slot.split('T')[0];
      datesSet.add(dateStr);
    });
    return datesSet;
  };

  const goToPreviousMonth = () => {
    const today = new Date();
    if (currentMonth.getMonth() > today.getMonth() || currentMonth.getFullYear() > today.getFullYear()) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    }
  };

  const goToNextMonth = () => {
    const maxDate = new Date(new Date().getTime() + 120 * 24 * 60 * 60 * 1000);
    if (currentMonth.getMonth() < maxDate.getMonth() || currentMonth.getFullYear() < maxDate.getFullYear()) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysArray = [];
  const datesWithSlots = getDatesWithSlots();
  const today = new Date();

  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(day);
  }

  const monthYear = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: TIMEZONE });

  return (
    <div className="calendar-picker">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="nav-btn">❮</button>
        <h3>{monthYear}</h3>
        <button onClick={goToNextMonth} className="nav-btn">❯</button>
      </div>

      <div className="weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="calendar-day empty"></div>;
          }

          const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasSlots = datesWithSlots.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isDisabled = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate()) || !hasSlots;

          return (
            <button
              key={`day-${day}`}
              className={`calendar-day ${isSelected ? 'selected' : ''} ${hasSlots && !isDisabled ? 'available' : 'unavailable'} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && onSelectDate(dateStr)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');

  const [isMessageSuccess, setIsMessageSuccess] = useState(null);

  const getCurrentStep = () => {
    if (!selectedProvider) return 0;
    if (!selectedSlot) return 1;
    return 2;
  };

  const getDaySlots = () => {
    if (!selectedDate || !allSlots.length) return [];
    const selectedDateStr = selectedDate.split('T')[0];
    return allSlots.filter(slot => slot.split('T')[0] === selectedDateStr);
  };

  const getAvailableSlots = () => {
    const daySlots = getDaySlots();
    if (!userAppointments.length) return daySlots;

    const bookedSlots = new Set();
    userAppointments.forEach(appointment => {
      bookedSlots.add(appointment.appointment_time);
    });

    return daySlots.filter(slot => !bookedSlots.has(slot));
  };

  const handleBookAppointment = async () => {
    if (!selectedProvider || !selectedSlot) {
      setMessage('Please select a provider and time slot');
      setIsMessageSuccess(false);
      return;
    }

    setBooking(true);
    try {
      await axios.post(
        `${API_URL}/api/appointments`,
        {
          provider_id: selectedProvider.id,
          appointment_time: selectedSlot
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✓ Appointment booked successfully! You will receive a confirmation email.');
      setIsMessageSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to book appointment. Please try again.';
      setMessage(`✗ ${errorMsg}`);
      setIsMessageSuccess(false);
    } finally {
      setBooking(false);
    }
  };

  const [allSlots, setAllSlots] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [providerAppointments, setProviderAppointments] = useState([]);

  const fetchSlots = useCallback(async () => {
    setFetchingSlots(true);
    try {
      const [slotsRes, calendarRes] = await Promise.all([
        axios.get(`${API_URL}/api/providers/${selectedProvider.id}/slots`),
        axios.get(`${API_URL}/api/providers/${selectedProvider.id}/calendar`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setAllSlots(slotsRes.data || []);
      setProviderAppointments(calendarRes.data || []);
      setSelectedDate(null);
      setSelectedSlot(null);
      setMessage('');
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setAllSlots([]);
      setProviderAppointments([]);
    } finally {
      setFetchingSlots(false);
    }
  }, [selectedProvider?.id, token]);

  useEffect(() => {
    if (selectedProvider) {
      fetchSlots();
    } else {
      setAllSlots([]);
      setSelectedDate(null);
      setSelectedSlot(null);
      setMessage('');
    }
  }, [selectedProvider, fetchSlots]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/providers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProviders(res.data || []);
      } catch (err) {
        console.error('Failed to fetch providers:', err);
      } finally {
        setLoading(false);
        setMessage('');
      }
    };

    fetchProviders();
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="appointment-booking">
        <div className="booking-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading available services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="appointment-booking">
      <div className="booking-container">
        <ProgressIndicator currentStep={getCurrentStep()} totalSteps={3} />

        <div className="booking-header">
          <h1 className='d-flex-all'>{<FaCalendarDay className='mr-2' color='#3b82f6' />} Book an Appointment</h1>
          <p>Choose a service, date, and time that works best for you</p>
        </div>

        {/* Step 1: Select Provider */}
        <div className="booking-section">
          <div className="step-header">
            <span className="step-number-appointment">1</span>
            <h2>Select a Service</h2>
          </div>

          {providers.length === 0 ? (
            <div className="no-services">
              <p>📭 No services available at the moment.</p>
              <p>Please check back later or contact support.</p>
            </div>
          ) : (
            <div className="services-grid">
              {providers.map(provider => (
                <div
                  key={provider.id}
                  className={`service-card ${selectedProvider?.id === provider.id ? 'selected' : ''}`}
                  onClick={() => setSelectedProvider(provider)}
                >
                  <div className="service-icon"><FaTools /></div>
                  <div className="service-info">
                    <h3>{provider.service_name}</h3>
                    <div className="service-details">
                      <span className="duration"><FaClock className='mr-1' color='#ff6c6c' /> 60 min</span>
                      <span className="price"><FaSackDollar className='mr-1' color='#10b981' /> $100</span>
                    </div>
                    <p className="service-description">
                      Professional service with expert consultation and follow-up support.
                    </p>
                    <div style={{ marginTop: '10px' }}>Contact Person: {provider.name || 'Not specified'}</div>

                  </div>
                  {selectedProvider?.id === provider.id && (
                    <div className="selected-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedProvider && (
            <div className="selected-service-summary">
              <div className="summary-badge">
                ✓ {selectedProvider.service_name} selected
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Select Date & Time */}
        {selectedProvider && (
          <div className="booking-section">
            <div className="step-header">
              <span className="step-number-appointment">2</span>
              <h2>Select Date & Time</h2>
            </div>

            {fetchingSlots ? (
              <div className="loading-slots">
                <div className="spinner"></div>
                <p>Loading available times...</p>
              </div>
            ) : (
              <div className="date-time-wrapper">
                <div className="calendar-section">
                  <h3>Choose a Date</h3>
                  <CalendarPicker
                    selectedDate={selectedDate}
                    onSelectDate={(dateStr) => {
                      setSelectedDate(dateStr);
                      setSelectedSlot(null);
                      setMessage('');
                    }}
                    allSlots={allSlots}
                  />
                </div>

                {selectedDate && (
                  <div className="time-section">
                    <h3>
                      Available Times for {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        timeZone: TIMEZONE
                      })}
                    </h3>

                    {getAvailableSlots().length > 0 ? (
                      <div className="time-slots-container">
                        <div className="time-slots-grid">
                          {getAvailableSlots().map((slot, idx) => {
                            const time = new Date(slot).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                              timeZone: TIMEZONE
                            });
                            const isSelected = selectedSlot === slot;
                            const isBooked = providerAppointments.some(
                              appointment => appointment.appointment_time.startsWith(slot) && appointment.status === 'booked'
                            );
                            return (
                              <button
                                key={idx}
                                className={`time-slot-button ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                                onClick={() => !isBooked && setSelectedSlot(slot) && setMessage('')}
                                disabled={isBooked}
                              >
                                {time}
                                {isBooked && <span className="booked-label">Booked</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="no-times-message">
                        <p>📅 No available times on this date.</p>
                        <p>Please select a different date.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* Step 3: Confirm Booking */}
        {selectedProvider && selectedSlot && (
          <div className="booking-section confirmation-page">
            <div className="step-header">
              <span className="step-number-appointment">3</span>
              <h2>Confirm Your Booking</h2>
            </div>
            <p>Please review your booking details below:</p>
            <div className="details">
              <h4>Booking Details</h4>
              <ul>
                <li>Service: {selectedProvider.service_name}</li>
                <li>Duration: 60 minutes</li>
                <li>
                  Date & Time: {new Date(selectedSlot).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: TIMEZONE
                  })} at {new Date(selectedSlot).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: TIMEZONE
                  })}
                </li>
                <li>Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</li>
              </ul>
            </div>
            <div className="actions">
              <button onClick={() => navigate('/dashboard')} className="back-btn">
                <FaLongArrowAltLeft className='mr-2' /> Back
              </button>
              <button
                onClick={handleBookAppointment}
                disabled={!selectedProvider || !selectedSlot || booking}
                className="confirm-btn"
              >
                {booking ? <><FcProcess className='mr-2' /> ' Booking...'</> : <><FaCheck className='mr-2' /> Confirm Booking</>}
              </button>
            </div>
            {/* Message */}
            {message && (
              <div className={isMessageSuccess ? 'booking-success' : 'booking-error'}>
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
