import React, { useState } from 'react';
import axios from 'axios';

const CreateJobModal = ({ onClose, onJobCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    orgName: '', // Usually pre-filled from user profile
    location: '',
    deadline: '',
    neededVolunteers: 1,
    description: '',
    experienceRequired: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/jobs', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onJobCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', margin: 0 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Post New Opportunity</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-light)' }}>&times;</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input name="title" required value={formData.title} onChange={onChange} placeholder="e.g. Community Garden Assistant" />
          </div>

          <div className="form-group">
            <label className="form-label">Organization Name *</label>
            <input name="orgName" required value={formData.orgName} onChange={onChange} placeholder="Your Organization Name" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input name="location" required value={formData.location} onChange={onChange} placeholder="City, Country" />
            </div>
            <div className="form-group">
              <label className="form-label">Deadline *</label>
              <input name="deadline" type="date" required value={formData.deadline} onChange={onChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Volunteers Needed *</label>
            <input name="neededVolunteers" type="number" min="1" required value={formData.neededVolunteers} onChange={onChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" rows="4" value={formData.description} onChange={onChange} placeholder="Describe the role and requirements..." />
          </div>

          <div className="form-group flex items-center gap-4">
            <input name="experienceRequired" type="checkbox" checked={formData.experienceRequired} onChange={onChange} style={{ width: 'auto' }} />
            <label className="form-label" style={{ margin: 0 }}>Previous Experience Required</label>
          </div>

          <div className="flex gap-4" style={{ marginTop: '24px' }}>
            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: 'var(--border)', color: 'var(--text-dark)' }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn" style={{ flex: 1 }}>
              {loading ? 'Posting...' : 'Post Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobModal;
