import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import DiscoveryMap from './DiscoveryMap';
import CreateJobModal from './CreateJobModal';
import JobApplicationsList from './JobApplicationsList';
import { Package, ClipboardList, MapPin, BarChart3, Map as MapIcon, Flame, Plus } from 'lucide-react';

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

  return (
    <div className="app-container bg-aura-dashboard container" style={{ maxWidth: '100%', padding: '0' }}>
      <Navbar user={user} setAuth={setAuth} />

      <div className="container dashboard-grid" style={{ marginTop: '32px' }}>

        {/* Left Column: Role-Specific Content, Closest NGOs, and Community Feed */}
        <div className="flex flex-col gap-6">

          {user?.role === 'Organization' ? (
            <div className="bento-card">
              <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: '700' }}>
                  <Package size={26} color="var(--primary)" /> My Job Listings
                </h2>
                <button onClick={() => setShowCreateModal(true)} className="action-btn-circ" title="Post Job">
                  <Plus size={20} strokeWidth={2.5} />
                </button>
              </div>
              {myJobs.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px' }}>
                  <p>You haven't posted any jobs yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {myJobs.map(job => (
                    <div key={job.id} className="issue-item flex flex-col" style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600' }}>{job.title}</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} /> {job.location} | 👥 Needs {job.neededVolunteers}
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
            <div className="bento-card">
              <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: '700' }}>
                  <ClipboardList size={26} color="var(--primary)" /> My Applications
                </h2>
                <Link to="/listings" className="btn btn-sm btn-accent">Find Opportunities</Link>
              </div>
              {myApplications.length === 0 ? (
                <p style={{ color: 'var(--text-light)', padding: '20px 0' }}>You haven't applied to any jobs yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {myApplications.map(app => (
                    <div key={app.id} className="issue-item flex flex-col" style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-warm)' }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '600' }}>{app.jobTitle}</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-light)' }}>{app.orgName}</p>
                        </div>
                        <span className={`bento-pill ${app.status === 'accepted' ? 'org' :
                          app.status === 'rejected' ? 'urgent' : 'scraped'
                          }`} style={{ marginBottom: 0 }}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Closest NGOs Tab */}
          <div className="bento-card">
            <h2 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: '700' }}>
              <MapPin size={26} color="var(--primary)" /> Closest NGOs to You
            </h2>
            {loadingNearby ? (
              <p>Finding nearby impact...</p>
            ) : nearbyOrgs.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>No NGOs found nearby.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {nearbyOrgs.map(org => (
                  <div key={org.id} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-warm)' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: '600' }}>{org.name || org.orgName}</h4>
                    <span className="bento-pill scraped" style={{ fontSize: '10px', padding: '4px 10px', marginBottom: '8px' }}>{org.orgType}</span>
                    <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-light)' }}>
                      {org.sectors?.slice(0, 2).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link to="/listings" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>Explore Full Map →</Link>
            </div>
          </div>

          {/* Community Feed (Moved to Left Side) */}
          <div className="bento-card">
            <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: '700' }}>
                <Flame size={26} color="var(--primary)" /> Community Feed
              </h2>
              <Link to="/issues" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600' }}>All Updates →</Link>
            </div>
            {issues.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>No issues reported yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {issues.map(issue => (
                  <li key={issue.id} className="issue-item" style={{ padding: '16px', marginBottom: '12px', border: '1px solid var(--border)', borderRadius: '12px', transition: 'box-shadow 0.2s', background: 'var(--bg-warm)' }}>
                    <div className="flex justify-between items-center">
                      <Link to={`/issues/${issue.id}`} style={{ fontWeight: '600', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '15px' }}>
                        {issue.title}
                      </Link>
                      <span className="bento-pill scraped" style={{ fontSize: '10px', padding: '4px 10px', marginBottom: 0 }}>{issue.category}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Analytics & Map */}
        <div className="flex flex-col gap-6">
          <div className="bento-card" onClick={() => navigate('/issues')} style={{ cursor: 'pointer' }} title="View all issues">
            <h2 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: '700' }}>
              <BarChart3 size={26} color="var(--primary)" /> Top Issues Analytics
            </h2>
            {topIssues.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>Not enough data to generate analytics.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {topIssues.map((ti, index) => (
                  <div key={index} className="flex justify-between items-center" style={{ padding: '16px', background: 'var(--bg-warm)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>{ti.title}</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {ti.upvoteCount} <Flame size={14} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapIcon size={26} color="var(--primary)" /> NGO Discovery Map
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-light)', marginLeft: '38px' }}>Real-time impact locations</p>
            </div>
            <div className="map-container" style={{ height: '360px', width: '100%', borderRadius: '0' }}>
              <DiscoveryMap />
            </div>
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
