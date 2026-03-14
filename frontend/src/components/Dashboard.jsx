import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import DiscoveryMap from './DiscoveryMap';
import CreateJobModal from './CreateJobModal';
import JobApplicationsList from './JobApplicationsList';

const Dashboard = ({ user, setAuth }) => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [topIssues, setTopIssues] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [nearbyOrgs, setNearbyOrgs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewAppJobId, setViewAppJobId] = useState(null);
  const [loadingNearby, setLoadingNearby] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchIssues();
      fetchTopIssues();
      if (user.role === 'Organization') {
        fetchMyJobs();
      } else {
        fetchMyApplications();
      }
      fetchNearbyOrgs();
    }
  }, [user, navigate]);

  const fetchIssues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/issues');
      setIssues(res.data.slice(0, 5));
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

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/jobs/org/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/applications/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNearbyOrgs = async () => {
    setLoadingNearby(true);
    try {
      // For demo, we use a fixed location (Kochi center) if geolocation is unavailable
      const lat = 9.9312;
      const lng = 76.2673;
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/organizations/nearby?lat=${lat}&lng=${lng}&radius=50000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNearbyOrgs(res.data.slice(0, 6));
    } catch (err) {
      console.error('Failed to fetch nearby orgs:', err);
    } finally {
      setLoadingNearby(false);
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
      <nav className="navbar" style={{ padding: '16px 48px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>Serve-Link</h1>
        <div className="flex gap-8 items-center">
          <Link to="/listings" className="nav-link">Listings</Link>
          <Link to="/issues" className="nav-link">Issues</Link>
          {user?.role === 'Volunteer' && <Link to="/report-issue" className="nav-link">Report</Link>}
          <Link to="/profile" className="profile-link" title="My Profile" style={{ textDecoration: 'none' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              background: 'var(--bg-warm)', 
              color: 'var(--primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '800',
              border: '1.5px solid var(--primary)',
              transition: 'all 0.2s ease'
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </Link>
          <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ boxShadow: 'none' }}>Logout</button>
        </div>
      </nav>

      <div className="container dashboard-grid" style={{ marginTop: '32px' }}>
        
        {/* Left Column: Role-Specific Content */}
        <div className="flex flex-col gap-6">
          
          {user?.role === 'Organization' ? (
            <div className="card">
              <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>📦 My Job Listings</h2>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-sm">
                  + Post Job
                </button>
              </div>
              {myJobs.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px' }}>
                  <p>You haven't posted any jobs yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {myJobs.map(job => (
                    <div key={job.id} className="issue-item">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>{job.title}</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-light)' }}>
                            📍 {job.location} | 👥 Needs {job.neededVolunteers}
                          </p>
                        </div>
                        <button 
                          onClick={() => setViewAppJobId(job.id)}
                          className="btn btn-sm btn-outline"
                        >
                          Applicants
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
                <h2 style={{ margin: 0 }}>📝 My Applications</h2>
                <Link to="/listings" className="btn btn-sm btn-accent">Find Opportunities</Link>
              </div>
              {myApplications.length === 0 ? (
                <p style={{ color: 'var(--text-light)', padding: '20px 0' }}>You haven't applied to any jobs yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {myApplications.map(app => (
                    <div key={app.id} className="issue-item">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '15px' }}>{app.jobTitle}</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--primary)' }}>{app.orgName}</p>
                        </div>
                        <span className={`badge ${
                          app.status === 'accepted' ? 'badge-platform' : 
                          app.status === 'rejected' ? 'btn-danger' : 'badge-scraped'
                        }`} style={{ background: app.status === 'rejected' ? '#fee2e2' : app.status === 'accepted' ? '#dcfce7' : '', color: app.status === 'rejected' ? '#991b1b' : app.status === 'accepted' ? '#166534' : '' }}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Closest NGOs Tab (New) */}
          <div className="card">
            <h2 style={{ margin: '0 0 16px' }}>📍 Closest NGOs to You</h2>
            {loadingNearby ? (
              <p>Finding nearby impact...</p>
            ) : nearbyOrgs.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>No NGOs found nearby.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {nearbyOrgs.map(org => (
                  <div key={org.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '10px', background: '#f8fafc' }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '14px' }}>{org.name || org.orgName}</h4>
                    <span className="badge" style={{ fontSize: '10px', padding: '2px 8px' }}>{org.orgType}</span>
                    <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-light)' }}>
                      {org.sectors?.slice(0, 2).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Link to="/listings" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>Explore Full Map →</Link>
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Map */}
        <div>
          <div className="card">
            <h2 style={{ margin: '0 0 16px' }}>📊 Top Issues Analytics</h2>
            {topIssues.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>Not enough data to generate analytics.</p>
            ) : (
              <div>
                {topIssues.map((ti, index) => (
                  <div key={index} className="flex justify-between items-center" style={{ padding: '10px', background: '#f0f9ff', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid var(--primary)' }}>
                    <span style={{ fontWeight: '600', color: 'var(--primary-dark)', fontSize: '14px' }}>{ti.title}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '14px' }}>{ti.upvoteCount} ▲</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'none' }}>
            <div style={{ padding: '20px 24px', background: '#FFF7F2', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ margin: 0, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>🗺️ NGO Discovery Map</h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Real-time impact locations</p>
            </div>
            <div className="map-container" style={{ height: '300px' }}>
              <DiscoveryMap />
            </div>
          </div>
          
          {/* Issue Preview (Moved to right or kept as is) */}
          <div className="card" style={{ marginTop: '24px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>🔥 Community Feed</h2>
              <Link to="/issues" style={{ fontSize: '13px', color: 'var(--primary)' }}>All →</Link>
            </div>
            {issues.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>No issues reported yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {issues.map(issue => (
                  <li key={issue.id} className="issue-item" style={{ marginBottom: '10px', paddingBottom: '10px' }}>
                    <div className="flex justify-between items-center">
                      <Link to={`/issues/${issue.id}`} style={{ fontWeight: '600', color: 'var(--primary)', textDecoration: 'none', fontSize: '14px' }}>
                        {issue.title}
                      </Link>
                      <span className="badge" style={{ fontSize: '10px' }}>{issue.category}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateJobModal 
          onClose={() => setShowCreateModal(false)} 
          onJobCreated={fetchMyJobs} 
        />
      )}
      {viewAppJobId && (
        <JobApplicationsList 
          jobId={viewAppJobId} 
          onClose={() => setViewAppJobId(null)} 
          onStatusUpdate={fetchMyJobs}
        />
      )}
    </div>
  );
};

export default Dashboard;
