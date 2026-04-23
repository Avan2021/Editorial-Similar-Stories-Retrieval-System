import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Mail } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth`;

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2PasswordRequestForm expects 'username'
      formData.append('password', password);
      
      const res = await axios.post(`${API_URL}/login`, formData);
      localStorage.setItem('token', res.data.access_token);
      onLogin();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Welcome Back</h2>
        {error && <div style={{ color: '#ef4444', marginBottom: 16, fontSize: 14 }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Email address" 
              style={{ paddingLeft: 40, width: '100%' }} 
              required
            />
          </div>
          <div style={{ position: 'relative' }}>
            <KeyRound size={18} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Password" 
              style={{ paddingLeft: 40, width: '100%' }} 
              required
            />
          </div>
          <button type="submit" className="button" style={{ width: '100%', marginTop: 8 }}>
            Sign In
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary-color)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
