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
    <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
      <div className="card" style={{width: '100%', maxWidth: '400px'}}>
        <h2 className="text-center text-primary">Sign In</h2>
        {errorMsg && <div style={{backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginTop: '15px'}}>{errorMsg}</div>}
        <form onSubmit={onSubmit} style={{marginTop: '20px'}}>
          <div className="form-group">
            <input name="email" type="email" required placeholder="Email address" onChange={onChange} />
          </div>
          <div className="form-group">
            <input name="password" type="password" required placeholder="Password" onChange={onChange} />
          </div>
          <button type="submit" className="btn" style={{width: '100%'}}>Sign in</button>
        </form>
        <p style={{textAlign: 'center', marginTop: '16px', fontSize: '0.9rem'}}>
          Don't have an account? <Link to="/register" style={{color: 'var(--primary)', fontWeight: '600'}}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
