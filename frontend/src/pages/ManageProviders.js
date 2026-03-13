import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ManageProviders.css';
import { FaRegUser } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL;

export default function ManageProviders() {
  const token = localStorage.getItem('token');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ service_name: '', description: '' });

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/providers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProviders(res.data || []);
      setMessage('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to load providers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const filteredProviders = useMemo(() => {
    if (!query) return providers;
    const q = query.toLowerCase();
    return providers.filter(p =>
      (p.service_name || '').toLowerCase().includes(q) ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    );
  }, [providers, query]);

  const startEdit = (provider) => {
    setEditingId(provider.id);
    setEditForm({
      service_name: provider.service_name || '',
      description: provider.service_description || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ service_name: '', description: '' });
  };

  const saveEdit = async () => {
    try {
      await axios.patch(
        `${API_URL}/api/providers/${editingId}`,
        {
          service_name: editForm.service_name.trim(),
          description: editForm.description.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProviders();
      cancelEdit();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update provider.');
    }
  };

  const deleteProvider = async (providerId) => {
    if (!window.confirm('Delete this provider profile? This cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/api/providers/${providerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchProviders();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to delete provider.');
    }
  };

  const totalProviders = providers.length;
  const filteredCount = filteredProviders.length;

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-card">
          <h1>Manage Providers</h1>
          <p>Admin-only access to create, edit, and remove providers.</p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon"><FaRegUser /></div>
          <div>
            <h3>{totalProviders}</h3>
            <p>Total Providers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaRegUser /></div>
          <div>
            <h3>{filteredCount}</h3>
            <p>Filtered Results</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaRegUser /></div>
          <div>
            <h3>{Math.max(0, totalProviders - filteredCount)}</h3>
            <p>Hidden by Search</p>
          </div>
        </div>
      </div>

      <div className="admin-actions-bar">
        <div className="search-wrap">
          <input
            type="text"
            placeholder="Search by service, name, or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn-secondary" onClick={fetchProviders}>
            Refresh
          </button>
        </div>
        <Link to="/admin/providers/new" className="btn-primary">
          Add Provider
        </Link>
      </div>

      {message && <div className="admin-message">{message}</div>}

      <div className="admin-content-card">
        {loading ? (
          <div className="admin-loading">Loading providers...</div>
        ) : (
          <div className="provider-grid">
            {filteredProviders.length === 0 ? (
              <div className="admin-empty">
                <h3>No providers found</h3>
                <p>Try adjusting your search or add a new provider.</p>
              </div>
            ) : (
              filteredProviders.map(provider => (
                <div key={provider.id} className="provider-card">
                  <div className="provider-info">
                    <h3>{provider.service_name}</h3>
                    <p className="provider-desc">{provider.service_description || 'No description yet.'}</p>
                    <p className="provider-meta">
                      Contact: {provider.name || 'N/A'} {provider.email ? `(${provider.email})` : ''}
                    </p>
                  </div>

                  {editingId === provider.id ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={editForm.service_name}
                        onChange={(e) => setEditForm({ ...editForm, service_name: e.target.value })}
                        placeholder="Service name"
                      />
                      <textarea
                        rows="3"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Description"
                      />
                      <div className="edit-actions">
                        <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                        <button className="btn-primary" onClick={saveEdit}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="provider-actions">
                      <button className="btn-secondary" onClick={() => startEdit(provider)}>Edit</button>
                      <button className="btn-danger" onClick={() => deleteProvider(provider.id)}>Delete</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
