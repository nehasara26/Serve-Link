import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { Building2, Link2, MapPin, Clock, Users, GraduationCap, CheckCircle2, Send, ExternalLink } from 'lucide-react';

const JobCard = ({ job, user }) => {
  const isPlatform = job.source === 'platform';
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [message, setMessage] = useState('');
  // Reduced-motion fallback: brief scale pulse on the button
  const [pulsing, setPulsing] = useState(false);
  const applyBtnRef = useRef(null);

  const triggerAuraBoost = useCallback(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // Accessibility fallback: simple scale pulse
      setPulsing(true);
      setTimeout(() => setPulsing(false), 400);
      return;
    }

    // Nudge the aura background to momentarily brighten
    window.dispatchEvent(new CustomEvent('apply-aura-boost'));
  }, []);

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
      triggerAuraBoost();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bento-card">
      <div className="job-card-header">
        <div>
          <h3 className="job-title">{job.title}</h3>
          <p className="job-org">{job.orgName}</p>
        </div>
        <span className={`bento-pill ${isPlatform ? 'org' : 'scraped'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {isPlatform ? <><Building2 size={12} /> Platform Original</> : <><Link2 size={12} /> Scraped</>}
        </span>
      </div>

      <div className="job-meta">
        <span className="job-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {job.location}</span>
        <span className="job-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Deadline: {job.deadline}</span>
        {job.neededVolunteers && (
          <span className="job-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {job.neededVolunteers} volunteers needed</span>
        )}
        <span className={`experience-badge ${job.experienceRequired ? 'exp-required' : 'exp-none'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {job.experienceRequired ? <><GraduationCap size={14} /> Experience Required</> : <><CheckCircle2 size={14} /> No Experience Needed</>}
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
                    <button
                      ref={applyBtnRef}
                      type="submit"
                      disabled={loading}
                      className={`btn btn-sm${pulsing ? ' apply-pulse' : ''}`}
                    >
                      {loading ? 'Sending...' : 'Confirm'}
                    </button>
                    <button type="button" onClick={() => setShowApplyForm(false)} className="btn btn-sm btn-outline">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  ref={applyBtnRef}
                  onClick={() => { setShowApplyForm(true); triggerAuraBoost(); }}
                  className={`action-btn-circ${pulsing ? ' apply-pulse' : ''}`}
                  title="Apply Now"
                  style={{ width: '40px', height: '40px', background: '#1e293b' }}
                >
                  <Send size={18} strokeWidth={2.5} color="#fff" />
                </button>
              )
            ) : user?.id === job.postedBy ? (
              <a href="/dashboard" className="btn btn-sm btn-outline">
                Manage Applicants
              </a>
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
            className="action-btn-circ"
            title="Visit NGO Website"
            style={{ width: '40px', height: '40px', background: '#1e293b' }}
          >
            <ExternalLink size={18} strokeWidth={2.5} color="#fff" />
          </a>
        )}
      </div>
    </div>
  );
};

export default JobCard;
