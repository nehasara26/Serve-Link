import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import DiscoveryMap from './DiscoveryMap';

const Dashboard = ({ user, setAuth }) => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [topIssues, setTopIssues] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchIssues();
      fetchTopIssues();
    }
  }, [user, navigate]);

  const fetchIssues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/issues');
      setIssues(res.data.slice(0, 5)); // Show top 5 in dashboard preview
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTopIssues = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/analytics/top-issues', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopIssues(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(null);
    navigate('/login');
  };

  return (
    <div className="container" style={{ maxWidth: '100%', padding: '0' }}>
      {/* Navbar */}
      <nav className="navbar">
        <h1 style={{ margin: 0 }}>Serve-Link <span style={{ fontSize: '14px', fontWeight: '400', opacity: 0.8 }}>({user?.role})</span></h1>
        <div className="flex gap-4 items-center">
          <Link to="/listings" className="nav-link">📋 Listings</Link>
          <Link to="/issues" className="nav-link">🗣️ Issues</Link>
          <Link to="/report-issue" className="nav-link">📢 Report</Link>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">Logout</button>
        </div>
      </nav>

      <div className="container dashboard-grid" style={{ marginTop: '20px' }}>
        {/* Community Issues Preview */}
        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>🔥 Top Community Issues</h2>
            <Link to="/issues" style={{ fontSize: '13px', color: 'var(--primary)' }}>View All →</Link>
          </div>
          {issues.length === 0 ? (
            <p style={{ color: 'var(--text-light)' }}>No issues reported yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {issues.map(issue => (
                <li key={issue.id} className="issue-item">
                  <div className="flex justify-between items-center">
                    <Link to={`/issues/${issue.id}`} style={{ fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}>
                      {issue.title}
                    </Link>
                    <span className="issue-tag">{issue.category}</span>
                  </div>
                  <p style={{ margin: '6px 0', fontSize: '14px', color: 'var(--text-light)' }}>{issue.description?.slice(0, 80)}...</p>
                  <div className="flex gap-4 items-center" style={{ fontSize: '13px' }}>
                    <span style={{ color: issue.status === 'Open' ? '#16a34a' : '#ea580c' }}>● {issue.status || 'Open'}</span>
                    <span>▲ {issue.upvoteCount || 0} upvotes</span>
                    {issue.mentionedOrg && <span>🏢 {issue.mentionedOrg}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Analytics & Map */}
        <div>
          <div className="card">
            <h2 style={{ margin: '0 0 16px' }}>📊 Top Issues Analytics</h2>
            {topIssues.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>Not enough data to generate analytics.</p>
            ) : (
              <div>
                {topIssues.map((ti, index) => (
                  <div key={index} className="flex justify-between items-center" style={{ padding: '10px', background: '#eff6ff', borderRadius: '4px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500', color: 'var(--primary-dark)' }}>{index + 1}. {ti.title}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{ti.upvoteCount} Upvotes</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: 'var(--primary-dark)', color: 'white' }}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>🗺️ NGO Discovery Map</h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.8 }}>5 Kochi NGOs · Click markers for details</p>
            </div>
            <div className="map-container">
              <DiscoveryMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
