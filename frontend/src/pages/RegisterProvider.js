import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterProvider.css';

const API_URL = process.env.REACT_APP_API_URL;

export default function RegisterProvider() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ user_id: '', service_name: '', description: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/providers/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const available = (res.data || []).filter(u => u.hasProvider);
        setUsers(available);
      } catch (err) {
        setMessage(err.response?.data?.error || 'Failed to load provider users.');
      }
    };

    fetchUsers();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user_id || !form.service_name) {
      setMessage('Please select a provider user and enter a service name.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/providers`,
        {
          user_id: Number(form.user_id),
          service_name: form.service_name.trim(),
          description: form.description.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/admin/providers');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create provider.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-card">
          <h1>Create Provider</h1>
          <p>Assign a provider profile to a registered provider user.</p>
        </div>
      </div>

      <div className="admin-content-card">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <label>
              Provider User
              <select name="user_id" value={form.user_id} onChange={handleChange} disabled={loading}>
                <option value="">Select a provider user</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Service Name
              <input
                name="service_name"
                type="text"
                placeholder="e.g., Dental Checkup"
                value={form.service_name}
                onChange={handleChange}
                disabled={loading}
              />
            </label>
          </div>

          <label>
            Description
            <textarea
              name="description"
              rows="4"
              placeholder="Short description of the service"
              value={form.description}
              onChange={handleChange}
              disabled={loading}
            />
          </label>

          {message && <div className="form-message">{message}</div>}

          <div className="admin-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/admin/providers')} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
