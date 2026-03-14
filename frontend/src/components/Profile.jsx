import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Profile = ({ user, setAuth }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchProfile();
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading profile...</div>;
  if (!profileData) return <div className="error-state">Failed to load profile.</div>;

  const isVol = profileData.role === 'Volunteer';

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '40px 20px' }}>
      <nav className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '10px 40px' }}>
        <h1 style={{ margin: 0 }}>Serve-Link</h1>
        <div className="flex gap-4 items-center">
          <Link to="/dashboard" className="nav-link">🏠 Dashboard</Link>
          <button 
            onClick={() => { localStorage.removeItem('token'); setAuth(null); navigate('/login'); }} 
            className="btn btn-danger btn-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="card" style={{ marginTop: '80px', padding: '40px' }}>
        <div className="flex items-center gap-6" style={{ marginBottom: '32px' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: isVol ? 'var(--primary)' : 'var(--accent)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '3rem',
            color: 'white',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
          }}>
            {isVol ? '🙋' : '🏢'}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.4rem' }}>{profileData.name || profileData.orgName}</h1>
            <p style={{ margin: '4px 0', color: 'var(--text-light)', fontSize: '1.1rem' }}>
              {profileData.email} • <span className="badge" style={{ verticalAlign: 'middle' }}>{profileData.role}</span>
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '32px' }}>
          {isVol ? (
            <div className="flex flex-col gap-6">
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>🛠️ My Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills?.map(skill => (
                    <span key={skill} className="badge badge-platform">{skill}</span>
                  )) || <p style={{ color: 'var(--text-light)' }}>No skills listed.</p>}
                </div>
              </div>
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>💖 Causes I Care About</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.causes?.map(cause => (
                    <span key={cause} className="badge badge-scraped">{cause}</span>
                  )) || <p style={{ color: 'var(--text-light)' }}>No causes listed.</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h4 style={{ color: 'var(--text-light)', marginBottom: '4px' }}>Organization Type</h4>
                  <p style={{ fontWeight: 600 }}>{profileData.orgType || 'N/A'}</p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-light)', marginBottom: '4px' }}>Registration ID</h4>
                  <p style={{ fontWeight: 600, fontFamily: 'monospace' }}>{profileData.registrationNumber || 'N/A'}</p>
                </div>
                <div>
                <h4 style={{ color: 'var(--text-light)', marginBottom: '4px' }}>Contact Person</h4>
                <p style={{ fontWeight: 600 }}>{profileData.contactPerson || 'N/A'}</p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-light)', marginBottom: '4px' }}>Website</h4>
                  <a href={profileData.website} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    {profileData.website || 'N/A'}
                  </a>
                </div>
              </div>
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>📝 About Us</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>{profileData.description || 'No description provided.'}</p>
              </div>
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem' }}>🌍 Focus Sectors</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.sectors?.map(sector => (
                    <span key={sector} className="badge badge-platform" style={{ background: 'var(--accent)', color: 'white' }}>{sector}</span>
                  )) || <p style={{ color: 'var(--text-light)' }}>No sectors listed.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <Link to="/edit-profile" className="btn btn-outline" style={{ padding: '10px 30px' }}>
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
