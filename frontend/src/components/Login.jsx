import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setAuth }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      setAuth(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.msg || 'Login failed. Please check your credentials.';
      setErrorMsg(message);
      console.error(message);
    }
  };

  return (
    <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', background: 'var(--bg-warm)'}}>
      <div className="card" style={{width: '100%', maxWidth: '420px', padding: '48px 40px', border: '1px solid var(--border)'}}>
        <h1 className="text-center" style={{fontSize: '2rem', marginBottom: '8px'}}>Sign In</h1>
        <p className="text-center" style={{color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px'}}>Welcome back to Serve-Link</p>
        
        {errorMsg && <div className="error-banner" style={{marginBottom: '24px'}}>{errorMsg}</div>}
        
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" required placeholder="name@company.com" onChange={onChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" required placeholder="••••••••" onChange={onChange} />
          </div>
          <button type="submit" className="btn" style={{width: '100%', marginTop: '12px'}}>Sign in</button>
        </form>
        <p style={{textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)'}}>
          Don't have an account? <Link to="/register" style={{color: 'var(--primary)', fontWeight: '700', textDecoration: 'none'}}>Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
