import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Briefcase, MessageCircle } from 'lucide-react';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import ListingsPage from './pages/ListingsPage';
import IssuesPage from './pages/IssuesPage';
import ReportIssuePage from './pages/ReportIssuePage';
import IssueDetailPage from './pages/IssueDetailPage';
import AuraBackground from './components/AuraBackground';
import PlexusBackground from './components/PlexusBackground';
import EditProfilePage from './pages/EditProfilePage';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser({ id: res.data.id || res.data._id, name: res.data.name, role: res.data.role });
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-light)' }}>Loading ServeLink...</p>
    </div>
  );

  return (
    <Router>
      <div className="font-sans text-gray-900 antialiased">
        <AuraBackground />
        <PlexusBackground />

        {!user && (
          <div style={{ position: 'absolute', top: '24px', right: '48px', zIndex: 100 }}>
            <ThemeToggle />
          </div>
        )}

        <Routes>
          {/* Home / Landing */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" /> : (
              <div className="app-container bg-aura-dashboard" style={{ minHeight: '100vh', paddingTop: '15vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <img src="/src/assets/ServeLink logo.svg" alt="ServeLink logo" style={{ height: '120px', marginBottom: '16px', display: 'block' }} />
                  <h1 className="text-primary" style={{ fontSize: '4rem', fontWeight: '800', margin: '0 0 24px 0', lineHeight: '1.1' }}>ServeLink</h1>
                  <p style={{ color: 'var(--text-light)', maxWidth: '480px', margin: '0 0 32px 0', fontSize: '1.1rem' }}>
                    A platform to connect NGOs and volunteers, empowering community-driven change mapped in real-time.
                  </p>
                  <div className="flex gap-4" style={{ justifyContent: 'center' }}>
                    <Link to="/login" className="btn btn-accent">Sign In</Link>
                    <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Get Started</Link>
                  </div>
                  {/* Allow browsing without login */}
                  <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/listings" style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={16} /> Browse Job Listings
                    </Link>
                    <Link to="/issues" style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MessageCircle size={16} /> Community Issues
                    </Link>
                  </div>
                </div>
              </div>
            )
          } />

          {/* Auth */}
          <Route path="/login" element={<Login setAuth={setUser} />} />
          <Route path="/register" element={<Register setAuth={setUser} />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard user={user} setAuth={setUser} />} />
          <Route path="/profile" element={<Profile user={user} setAuth={setUser} />} />

          {/* Feature Routes */}
          <Route path="/listings" element={<ListingsPage user={user} setAuth={setUser} />} />
          <Route path="/issues" element={<IssuesPage user={user} setAuth={setUser} />} />
          <Route path="/report-issue" element={<ReportIssuePage user={user} setAuth={setUser} />} />
          <Route path="/issues/:id" element={<IssueDetailPage user={user} setAuth={setUser} />} />
          <Route path="/edit-profile" element={<EditProfilePage user={user} setAuth={setUser} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
