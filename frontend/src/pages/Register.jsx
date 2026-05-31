import React, { useState } from 'react';
import { UserPlus, ShieldAlert, Mail, Lock, User } from 'lucide-react';

const Register = ({ navigateTo, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px' }}>
      <div className="glass-card text-center" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'inline-flex', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '50%', marginBottom: '1rem' }}>
          <ShieldAlert size={28} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>Create Account</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Register to log and track your complaints in your personal workspace.
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'left' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <User size={14} /> Full Name
            </label>
            <input 
              id="register-input-name"
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Deepika Sharma"
              className="form-input"
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Mail size={14} /> Email Address
            </label>
            <input 
              id="register-input-email"
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. deepika@example.com"
              className="form-input"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Lock size={14} /> Password
            </label>
            <input 
              id="register-input-password"
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="form-input"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Lock size={14} /> Confirm Password
            </label>
            <input 
              id="register-input-confirm"
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Retype password"
              className="form-input"
              required
            />
          </div>

          <button 
            id="register-btn-submit"
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Registering...' : 'Register'}</span>
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <span 
            id="register-link-login"
            onClick={() => navigateTo('login')} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
