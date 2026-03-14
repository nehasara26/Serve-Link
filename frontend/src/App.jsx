import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

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
          setUser({ id: res.data._id, name: res.data.name, role: res.data.role });
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Router>
      <div className="font-sans text-gray-900 antialiased">
        <Routes>
          <Route path="/" element={
            user ? <Navigate to="/dashboard" /> : (
              <div className="container text-center" style={{ marginTop: '10vh' }}>
                <h1 className="text-primary">Data-Driven Volunteer Pipeline</h1>
                <p>A platform to connect organizations and volunteers, empowering community-driven change mapped in real-time.</p>
                <div className="flex gap-4" style={{justifyContent: 'center', marginTop: '2rem'}}>
                  <Link to="/login" className="btn">Sign In</Link>
                  <Link to="/register" className="btn" style={{background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)'}}>Get Started</Link>
                </div>
              </div>
            )
          } />
          <Route path="/login" element={<Login setAuth={setUser} />} />
          <Route path="/register" element={<Register setAuth={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} setAuth={setUser} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
