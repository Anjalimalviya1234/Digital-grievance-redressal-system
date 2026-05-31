import React, { useState } from 'react';
import { LogIn, ShieldAlert, Sparkles, Mail, Lock } from 'lucide-react';

const Login = ({ navigateTo, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.token, data.user);
      } else {
        setError(data.message || 'Login failed. Verify your details.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to fill admin login for the user
  const handleQuickDemoFill = (role) => {
    setError('');
    if (role === 'admin') {
      setEmail('admin@grievance.gov.in');
      setPassword('admin123');
    } else {
      // Prompt user to register if they want a personal account, or quick fill if we have a default citizen (none seeded initially, but they can register)
      setEmail('citizen@test.com');
      setPassword('citizen123');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px' }}>
      <div className="glass-card text-center" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'inline-flex', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '50%', marginBottom: '1rem' }}>
          <ShieldAlert size={28} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>Sign In</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Access your citizen workspace or administrative tools.
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'left' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Mail size={14} /> Email Address
            </label>
            <input 
              id="login-input-email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@grievance.gov.in"
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
              id="login-input-password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              required
            />
          </div>

          <button 
            id="login-btn-submit"
            type="submit" 
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Demo Fast Track Login */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--glass-border)',
          textAlign: 'left'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Demo Quick Access
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              id="login-demo-admin"
              type="button" 
              onClick={() => handleQuickDemoFill('admin')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', flex: 1 }}
            >
              <Sparkles size={12} color="#c084fc" />
              <span>Admin Profile</span>
            </button>
            <button 
              id="login-demo-citizen"
              type="button" 
              onClick={() => handleQuickDemoFill('citizen')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', flex: 1 }}
              title="Sign in with test citizen account after registering one"
            >
              <span>Test Citizen</span>
            </button>
          </div>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <span 
            id="login-link-register"
            onClick={() => navigateTo('register')} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500, textDecoration: 'underline' }}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
