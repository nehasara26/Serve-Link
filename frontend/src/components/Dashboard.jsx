import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
        // Fetch all issues (Mocking real API flow)
        const res = await axios.get('http://localhost:5000/api/issues');
        setIssues(res.data);
    } catch(err) {
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
    } catch(err) {
        console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(null);
    navigate('/login');
  };

  return (
    <div className="container" style={{maxWidth: '100%', padding: '0'}}>
      <nav className="navbar">
        <h1 style={{margin: 0}}>Volunteer Platform ({user?.role})</h1>
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </nav>

      <div className="container dashboard-grid" style={{marginTop: '20px'}}>
        {/* Basic Issues Feed */}
        <div className="card">
            <h2>Community Issues</h2>
            {issues.length === 0 ? <p style={{color: 'var(--text-light)'}}>No issues reported yet.</p> : (
                <ul style={{listStyle: 'none', padding: 0}}>
                    {issues.map(issue => (
                        <li key={issue._id} className="issue-item">
                            <h3 className="text-primary" style={{marginBottom: '5px'}}>{issue.title} <span className="issue-tag">{issue.category}</span></h3>
                            <p style={{margin: '10px 0'}}>{issue.description}</p>
                            <div className="flex justify-between items-center" style={{fontSize: '14px', color: 'var(--text-light)'}}>
                                <span>Status: <strong style={{color: issue.status === 'Open' ? '#16a34a' : '#ea580c'}}>{issue.status}</strong></span>
                                <span>Upvotes: {issue.upvotes?.length || 0}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {/* Analytics & Map */}
        <div>
            <div className="card">
                <h2>Top Issues Analytics</h2>
                {topIssues.length === 0 ? <p style={{color: 'var(--text-light)'}}>Not enough data to generate analytics.</p> : (
                    <div>
                        {topIssues.map((ti, index) => (
                           <div key={index} className="flex justify-between items-center" style={{padding: '10px', background: '#eff6ff', borderRadius: '4px', marginBottom: '8px'}}>
                               <span style={{fontWeight: '500', color: 'var(--primary-dark)'}}>{index + 1}. {ti.title}</span>
                               <span style={{fontWeight: 'bold', color: 'var(--primary)'}}>{ti.upvoteCount} Upvotes</span>
                           </div> 
                        ))}
                    </div>
                )}
            </div>

            <div className="card" style={{padding: 0}}>
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
