import React, { useState } from 'react';
import axios from 'axios';

const JobCard = ({ job, user }) => {
  const isPlatform = job.source === 'platform';
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [message, setMessage] = useState('');

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/applications', {
        jobId: job.id,
        message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplied(true);
      setShowApplyForm(false);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div>
          <h3 className="job-title">{job.title}</h3>
          <p className="job-org">{job.orgName}</p>
        </div>
        <span className={`badge ${isPlatform ? 'badge-platform' : 'badge-scraped'}`}>
          {isPlatform ? '🏛️ Platform Original' : '🔗 Scraped'}
        </span>
      </div>

      <div className="job-meta">
        <span className="job-meta-item">📍 {job.location}</span>
        <span className="job-meta-item">⏰ Deadline: {job.deadline}</span>
        {job.neededVolunteers && (
          <span className="job-meta-item">👥 {job.neededVolunteers} volunteers needed</span>
        )}
        <span className={`experience-badge ${job.experienceRequired ? 'exp-required' : 'exp-none'}`}>
          {job.experienceRequired ? '🎓 Experience Required' : '✅ No Experience Needed'}
        </span>
      </div>

      {job.description && (
        <p className="job-description">{job.description}</p>
      )}

      <div className="job-card-footer">
        {isPlatform ? (
          <>
            {user?.role === 'Volunteer' ? (
              applied ? (
                <button className="btn btn-sm" disabled style={{ background: 'var(--accent)', cursor: 'default' }}>
                  ✓ Application Sent
                </button>
              ) : showApplyForm ? (
                <form onSubmit={handleApply} style={{ marginTop: '10px' }}>
                  <textarea 
                    className="issue-feed-desc" 
                    placeholder="Why do you want to join? (Optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ width: '100%', marginBottom: '10px', fontSize: '13px', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="btn btn-sm">
                      {loading ? 'Sending...' : 'Confirm'}
                    </button>
                    <button type="button" onClick={() => setShowApplyForm(false)} className="btn btn-sm btn-outline">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setShowApplyForm(true)} className="btn btn-sm">
                  Apply Now
                </button>
              )
            ) : user?.id === job.postedBy ? (
              <Link to="/dashboard" className="btn btn-sm btn-outline">
                Manage Applicants
              </Link>
            ) : (
              <button className="btn btn-sm" disabled style={{ opacity: 0.5 }}>
                Volunteers Only
              </button>
            )}
          </>
        ) : (
          <a
            href={job.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline"
          >
            🌐 Visit NGO Website
          </a>
        )}
      </div>
    </div>
  );
};

export default JobCard;
