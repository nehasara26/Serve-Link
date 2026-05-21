import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/ServeLink logo.svg';
import ThemeToggle from './ThemeToggle';

/**
 * Shared Navbar — used on every authenticated page.
 * Props:
 *   user    – the current user object ({ name, role })
 *   setAuth – auth reset function (called on logout)
 */
const Navbar = ({ user, setAuth }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src={logo} alt="ServeLink logo" className="nav-logo" />
          <span className="nav-title">ServeLink</span>
        </Link>
      </div>
      <div className="flex gap-6 items-center">
        <Link to="/listings" className="nav-link">Listings</Link>
        <Link to="/issues" className="nav-link">Issues</Link>
        {user?.role === 'Volunteer' && <Link to="/report-issue" className="nav-link">Report</Link>}
        <div className="flex gap-4 items-center pl-6 border-l">
          <Link to="/profile" className="profile-link" title="My Profile" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
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
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm action-logout-btn"
            style={{ borderColor: 'var(--border)' }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
