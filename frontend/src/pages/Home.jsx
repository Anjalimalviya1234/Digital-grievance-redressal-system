import React from 'react';
import { PlusCircle, Search, LogIn, Sparkles, ShieldCheck, BarChart3, Clock } from 'lucide-react';

const Home = ({ navigateTo, currentUser }) => {
  return (
    <div className="container">
      {/* Hero Header */}
      <section className="hero-section">
        <div className="sparkle-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)' }}>
          <ShieldCheck size={14} />
          <span>Official Grievance Redressal</span>
        </div>
        <h1 className="hero-title">Public Grievance Redressal Portal</h1>
        <p className="hero-subtitle">
          Submit, monitor, and resolve issues related to public amenities and services. 
          Empowering citizens with transparent tracking and quick resolution.
        </p>
        
        <div className="hero-actions">
          <button 
            id="home-btn-submit"
            onClick={() => navigateTo('submit-ticket')}
            className="btn btn-cyan"
            style={{ padding: '0.85rem 2rem', gap: '0.75rem' }}
          >
            <PlusCircle size={20} />
            <span>File a Grievance</span>
          </button>
          
          <button 
            id="home-btn-track"
            onClick={() => navigateTo('track-ticket')}
            className="btn btn-secondary"
            style={{ padding: '0.85rem 2rem', gap: '0.75rem' }}
          >
            <Search size={20} />
            <span>Track Grievance</span>
          </button>

          {!currentUser && (
            <button 
              id="home-btn-login"
              onClick={() => navigateTo('login')}
              className="btn btn-secondary"
              style={{ padding: '0.85rem 1.5rem', gap: '0.5rem', borderStyle: 'dashed' }}
            >
              <LogIn size={18} />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontFamily: "'Outfit', sans-serif" }}>
          Portal Core Features
        </h2>
        <div className="feature-grid">
          
          <div className="glass-card interactive feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.2)', color: '#06b6d4' }}>
              <PlusCircle size={20} />
            </div>
            <h3>Easy Grievance Submission</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Submit details of your public issue, specify its category, and select its urgency level 
              to receive immediate administrative review and routing.
            </p>
          </div>

          <div className="glass-card interactive feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={20} />
            </div>
            <h3>Anonymous Reporting</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Citizens can choose to submit reports completely anonymously. 
              You will receive a unique tracking token to monitor progress without sharing personal information.
            </p>
          </div>

          <div className="glass-card interactive feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
              <Clock size={20} />
            </div>
            <h3>Timeline Tracking</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Detailed audit history for every grievance. Watch status shifts in real-time, read admin remarks, 
              and verify resolution summaries as officers investigate.
            </p>
          </div>

        </div>
      </section>


    </div>
  );
};

export default Home;
