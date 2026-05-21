import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';
import scrapedJobs from '../data/scrapedData.json';

const ListingsPage = ({ user, setAuth }) => {
  const [platformJobs, setPlatformJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'platform' | 'scraped'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/jobs');
        setPlatformJobs(res.data);
      } catch (err) {
        console.error('Failed to fetch platform jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const allJobs = [...platformJobs, ...scrapedJobs];

  const filteredJobs = allJobs.filter(job => {
    if (filter === 'platform') return job.source === 'platform';
    if (filter === 'scraped') return job.source === 'scraped';
    return true;
  });

  return (
    <div className="app-container bg-aura-dashboard" style={{ minHeight: '100vh' }}>
      <Navbar user={user} setAuth={setAuth} />

      <div className="container" style={{ maxWidth: '1000px', marginTop: '24px' }}>
        {/* Stats Banner */}
        <div className="listings-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
          <div className="bento-card" style={{ padding: '24px', textAlign: 'center', marginBottom: 0 }}>
            <span className="stat-num" style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: '900' }}>{platformJobs.length}</span>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Platform Roles</span>
          </div>
          <div className="bento-card" style={{ padding: '24px', textAlign: 'center', marginBottom: 0 }}>
            <span className="stat-num" style={{ fontSize: '2.5rem', color: 'var(--accent)', fontWeight: '900' }}>{scrapedJobs.length}</span>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Scraped Roles</span>
          </div>
          <div className="bento-card" style={{ padding: '24px', textAlign: 'center', marginBottom: 0 }}>
            <span className="stat-num" style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: '900' }}>{allJobs.length}</span>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Total Impact</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Roles
            </button>
            <button
              className={`filter-tab ${filter === 'platform' ? 'active' : ''}`}
              onClick={() => setFilter('platform')}
            >
              Platform Native
            </button>
            <button
              className={`filter-tab ${filter === 'scraped' ? 'active' : ''}`}
              onClick={() => setFilter('scraped')}
            >
              NGO Network
            </button>
          </div>
        </div>

        {/* Job Grid */}
        {loading ? (
          <div className="loading-state">Loading opportunities...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state">
            <p>No {filter !== 'all' ? filter : ''} listings found.</p>
            {filter === 'platform' && (
              <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                No jobs have been posted to the platform yet.
              </p>
            )}
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map(job => (
              <JobCard key={job.id || job._id} job={job} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsPage;
