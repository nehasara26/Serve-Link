import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = ({ setAuth }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Volunteer' });
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      setAuth(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.msg || 'Registration failed. Please try again.';
      setErrorMsg(message);
      console.error(message);
    }
  };

  return (
    <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
      <div className="card" style={{width: '100%', maxWidth: '400px'}}>
        <h2 className="text-center text-primary">Register</h2>
        {errorMsg && <div style={{backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '4px', marginTop: '15px'}}>{errorMsg}</div>}
        <form onSubmit={onSubmit} style={{marginTop: '20px'}}>
          <div className="form-group">
             <input name="name" type="text" required placeholder="Full Name" onChange={onChange} />
          </div>
          <div className="form-group">
              <input name="email" type="email" required placeholder="Email address" onChange={onChange} />
          </div>
          <div className="form-group">
             <input name="password" type="password" required placeholder="Password" onChange={onChange} />
          </div>
          
          <div className="form-group">
            <select name="role" value={formData.role} onChange={onChange}>
                <option value="Volunteer">Volunteer</option>
                <option value="Organization">Organization</option>
            </select>
          </div>

          <button type="submit" className="btn" style={{width: '100%'}}>Sign Up</button>
        </form>
        <p style={{textAlign: 'center', marginTop: '16px', fontSize: '0.9rem'}}>
          Already have an account? <Link to="/login" style={{color: 'var(--primary)', fontWeight: '600'}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
