import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Home, HandHeart, Building2, Wrench, Heart, FileText, Globe, Briefcase, GraduationCap, Award } from 'lucide-react';
import Navbar from './Navbar';

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
    <div className="app-container bg-aura-dashboard" style={{ minHeight: '100vh' }}>
      <Navbar user={user} setAuth={setAuth} />

      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="bento-card" style={{ padding: '40px' }}>
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
            {isVol ? <HandHeart size={48} /> : <Building2 size={48} />}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.4rem' }}>{profileData.name || profileData.orgName}</h1>
            <p style={{ margin: '4px 0', color: 'var(--text-light)', fontSize: '1.1rem' }}>
              {profileData.email} • <span className="bento-pill scraped" style={{ verticalAlign: 'middle', marginBottom: 0 }}>{profileData.role}</span>
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1.5px solid var(--border)', paddingTop: '32px' }}>
          {isVol ? (
            <div className="flex flex-col gap-6">
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Wrench size={20} /> My Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills?.map(skill => (
                    <span key={skill} className="bento-pill org">{skill}</span>
                  )) || <p style={{ color: 'var(--text-light)' }}>No skills listed.</p>}
                </div>
              </div>
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Heart size={20} /> Causes I Care About</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.causes?.map(cause => (
                    <span key={cause} className="bento-pill scraped">{cause}</span>
                  )) || <p style={{ color: 'var(--text-light)' }}>No causes listed.</p>}
                </div>
              </div>

              {/* About Me */}
              {profileData.about && (
                <div>
                  <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={20} /> About Me</h3>
                  <p style={{ lineHeight: 1.6, color: '#4b5563', whiteSpace: 'pre-wrap' }}>{profileData.about}</p>
                </div>
              )}

              {/* Experience */}
              {profileData.experience && profileData.experience.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={20} /> Experience</h3>
                  <div className="flex flex-col gap-3">
                    {profileData.experience.map((exp, idx) => (
                      <div key={idx} style={{ background: 'var(--bg-warm)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{exp.title}</h4>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profileData.education && profileData.education.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><GraduationCap size={20} /> Education</h3>
                  <div className="flex flex-col gap-3">
                    {profileData.education.map((edu, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-warm)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{edu.degree}</h4>
                          <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{edu.institution}</span>
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{edu.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {profileData.certifications && profileData.certifications.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={20} /> Certifications & Training</h3>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                    {profileData.certifications.map((cert, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{cert}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={20} /> About Us</h3>
                <p style={{ lineHeight: 1.6, color: '#4b5563' }}>{profileData.description || 'No description provided.'}</p>
              </div>
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={20} /> Focus Sectors</h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.sectors?.map(sector => (
                    <span key={sector} className="bento-pill urgent">{sector}</span>
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
    </div>
  );
};

export default Profile;
