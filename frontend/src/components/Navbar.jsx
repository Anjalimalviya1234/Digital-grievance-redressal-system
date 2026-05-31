import React from 'react';
import { ShieldAlert, User, LogOut, Home, PlusCircle, Search, LayoutDashboard } from 'lucide-react';

const Navbar = ({ currentUser, currentPage, navigateTo, logout }) => {
  return (
    <nav style={{
      background: 'rgba(17, 24, 39, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      {/* Brand logo */}
      <div 
        id="nav-logo"
        onClick={() => navigateTo('home')} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.25rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        <ShieldAlert size={24} color="#6366f1" />
        <span>Grievance Portal</span>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          id="nav-btn-home"
          onClick={() => navigateTo('home')}
          className="btn btn-secondary" 
          style={{ 
            padding: '0.5rem 1rem', 
            fontSize: '0.9rem',
            background: currentPage === 'home' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: 'none'
          }}
        >
          <Home size={16} />
          <span style={{ display: 'none', md: 'inline' }}>Home</span>
        </button>

        <button 
          id="nav-btn-submit"
          onClick={() => navigateTo('submit-ticket')}
          className="btn btn-secondary" 
          style={{ 
            padding: '0.5rem 1rem', 
            fontSize: '0.9rem',
            background: currentPage === 'submit-ticket' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: 'none'
          }}
        >
          <PlusCircle size={16} />
          <span>File Grievance</span>
        </button>

        <button 
          id="nav-btn-track"
          onClick={() => navigateTo('track-ticket')}
          className="btn btn-secondary" 
          style={{ 
            padding: '0.5rem 1rem', 
            fontSize: '0.9rem',
            background: currentPage === 'track-ticket' ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: 'none'
          }}
        >
          <Search size={16} />
          <span>Track Status</span>
        </button>

        {currentUser ? (
          <>
            <button 
              id="nav-btn-dashboard"
              onClick={() => navigateTo(currentUser.role === 'admin' ? 'admin-dashboard' : 'dashboard')}
              className="btn btn-secondary" 
              style={{ 
                padding: '0.5rem 1rem', 
                fontSize: '0.9rem',
                background: ['dashboard', 'admin-dashboard'].includes(currentPage) ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderColor: ['dashboard', 'admin-dashboard'].includes(currentPage) ? 'rgba(99, 102, 241, 0.4)' : 'transparent',
                color: ['dashboard', 'admin-dashboard'].includes(currentPage) ? '#a5b4fc' : 'var(--text-primary)'
              }}
            >
              <LayoutDashboard size={16} />
              <span>{currentUser.role === 'admin' ? 'Admin Panel' : 'My Workspace'}</span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              paddingLeft: '1rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentUser.name}
                </span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  color: currentUser.role === 'admin' ? '#f87171' : '#60a5fa',
                  textTransform: 'uppercase',
                  fontWeight: 700
                }}>
                  {currentUser.role}
                </span>
              </div>
              
              <button 
                id="nav-btn-logout"
                onClick={logout}
                className="btn btn-secondary"
                title="Sign Out"
                style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
              >
                <LogOut size={16} color="#ef4444" />
              </button>
            </div>
          </>
        ) : (
          <button 
            id="nav-btn-login"
            onClick={() => navigateTo('login')}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
          >
            <User size={16} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
