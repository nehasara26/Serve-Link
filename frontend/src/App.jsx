import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ListingsPage from './pages/ListingsPage';
import IssuesPage from './pages/IssuesPage';
import ReportIssuePage from './pages/ReportIssuePage';
import IssueDetailPage from './pages/IssueDetailPage';

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
      <p style={{ color: 'var(--text-light)' }}>Loading Serve-Link...</p>
    </div>
  );

  return (
    <Router>
      <div className="font-sans text-gray-900 antialiased">
        <Routes>
          {/* Home / Landing */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" /> : (
              <div className="container text-center" style={{ marginTop: '10vh' }}>
                <h1 className="text-primary">Serve-Link</h1>
                <p style={{ color: 'var(--text-light)', maxWidth: '480px', margin: '12px auto 32px' }}>
                  A platform to connect NGOs and volunteers, empowering community-driven change mapped in real-time.
                </p>
                <div className="flex gap-4" style={{ justifyContent: 'center' }}>
                  <Link to="/login" className="btn">Sign In</Link>
                  <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}>Get Started</Link>
                </div>
                {/* Allow browsing without login */}
                <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/listings" style={{ color: 'var(--primary)', fontSize: '14px' }}>📋 Browse Job Listings</Link>
                  <Link to="/issues" style={{ color: 'var(--primary)', fontSize: '14px' }}>🗣️ Community Issues</Link>
                </div>
              </div>
            )
          } />

          {/* Auth */}
          <Route path="/login" element={<Login setAuth={setUser} />} />
          <Route path="/register" element={<Register setAuth={setUser} />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard user={user} setAuth={setUser} />} />

          {/* Feature Routes */}
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/report-issue" element={<ReportIssuePage />} />
          <Route path="/issues/:id" element={<IssueDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
