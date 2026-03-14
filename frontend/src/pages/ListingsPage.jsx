import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard';
import scrapedJobs from '../data/scrapedData.json';

const ListingsPage = () => {
  const [platformJobs, setPlatformJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'platform' | 'scraped'

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
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <h1 style={{ margin: 0 }}>📋 Job Listings</h1>
        <div className="flex gap-4 items-center">
          <Link to="/dashboard" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid white' }}>
            ← Dashboard
          </Link>
          <Link to="/issues" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid white' }}>
            Community Issues
          </Link>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Stats Banner */}
        <div className="listings-stats">
          <div className="stat-chip">
            <span className="stat-num">{platformJobs.length}</span>
            <span>Platform Original</span>
          </div>
          <div className="stat-chip">
            <span className="stat-num">{scrapedJobs.length}</span>
            <span>Scraped NGO Roles</span>
          </div>
          <div className="stat-chip">
            <span className="stat-num">{allJobs.length}</span>
            <span>Total Opportunities</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({allJobs.length})
          </button>
          <button
            className={`filter-tab ${filter === 'platform' ? 'active' : ''}`}
            onClick={() => setFilter('platform')}
          >
            🏛️ Platform ({platformJobs.length})
          </button>
          <button
            className={`filter-tab ${filter === 'scraped' ? 'active' : ''}`}
            onClick={() => setFilter('scraped')}
          >
            🔗 Scraped ({scrapedJobs.length})
          </button>
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
              <JobCard key={job.id || job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsPage;
