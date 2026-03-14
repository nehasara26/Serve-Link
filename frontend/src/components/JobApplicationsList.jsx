import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JobApplicationsList = ({ jobId, onClose, onStatusUpdate }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/applications/job/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data);
      } catch (err) {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [jobId]);

  const updateStatus = async (appId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/applications/${appId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(apps => apps.map(app => 
        app.id === appId ? { ...app, status } : app
      ));
      if (onStatusUpdate) onStatusUpdate();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', margin: 0 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Applicants</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-light)' }}>&times;</button>
        </div>

        {loading ? (
          <div className="loading-state">Loading applicants...</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : applications.length === 0 ? (
          <div className="empty-state">No applications yet for this opportunity.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map(app => (
              <div key={app.id} className="issue-item" style={{ background: 'var(--bg-light)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{app.volunteerName}</h3>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--text-light)' }}>{app.volunteerEmail}</p>
                    <div className="issue-feed-desc" style={{ marginBottom: '12px', fontStyle: 'italic' }}>
                      "{app.message || 'No message provided.'}"
                    </div>
                    <span className={`badge ${
                      app.status === 'accepted' ? 'badge-platform' : 
                      app.status === 'rejected' ? 'btn-danger' : ''
                    }`} style={{ fontSize: '10px', padding: '2px 8px', background: app.status === 'rejected' ? '#fee2e2' : '', color: app.status === 'rejected' ? '#991b1b' : '' }}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {app.status === 'pending' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateStatus(app.id, 'rejected')}
                        className="btn btn-sm btn-danger"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => updateStatus(app.id, 'accepted')}
                        className="btn btn-sm btn-accent"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicationsList;
