import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SubmitTicket from './pages/SubmitTicket';
import TrackTicket from './pages/TrackTicket';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [extraData, setExtraData] = useState(null);
  const [appReady, setAppReady] = useState(false);

  // Check for existing token and authenticate on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAppReady(true);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const user = await response.json();
          setCurrentUser(user);
          
          // Auto route to dashboard on refresh if they were on login/register/home
          if (user.role === 'admin') {
            setCurrentPage('admin-dashboard');
          } else {
            setCurrentPage('dashboard');
          }
        } else {
          // Token invalid, clear it
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('App init authentication error:', error);
      } finally {
        setAppReady(true);
      }
    };

    checkAuth();
  }, []);

  // Safe Navigation Manager
  const navigateTo = (page, data = null) => {
    setExtraData(data);
    
    // Auth guards
    const token = localStorage.getItem('token');
    
    if (page === 'dashboard' && !token) {
      setCurrentPage('login');
      return;
    }
    
    if (page === 'admin-dashboard') {
      if (!token) {
        setCurrentPage('login');
        return;
      }
      if (currentUser && currentUser.role !== 'admin') {
        setCurrentPage('dashboard');
        return;
      }
    }

    if ((page === 'login' || page === 'register') && token && currentUser) {
      setCurrentPage(currentUser.role === 'admin' ? 'admin-dashboard' : 'dashboard');
      return;
    }

    setCurrentPage(page);
  };

  const loginUser = (token, user) => {
    localStorage.setItem('token', token);
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCurrentPage('home');
  };

  if (!appReady) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0b0f19',
        color: '#f3f4f6'
      }}>
        <div style={{
          border: '3px solid rgba(255, 255, 255, 0.05)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', color: '#9ca3af' }}>
          Loading Grievance Redressal System...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render correct page view
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home navigateTo={navigateTo} currentUser={currentUser} />;
      case 'submit-ticket':
        return <SubmitTicket currentUser={currentUser} navigateTo={navigateTo} />;
      case 'track-ticket':
        return <TrackTicket extraData={extraData} />;
      case 'login':
        return <Login navigateTo={navigateTo} onLoginSuccess={loginUser} />;
      case 'register':
        return <Register navigateTo={navigateTo} onLoginSuccess={loginUser} />;
      case 'dashboard':
        return <UserDashboard currentUser={currentUser} navigateTo={navigateTo} />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      default:
        return <Home navigateTo={navigateTo} currentUser={currentUser} />;
    }
  };

  return (
    <div className="app-container">
      {/* Background Decorative Neon Glow Circles */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      <Navbar 
        currentUser={currentUser} 
        currentPage={currentPage} 
        navigateTo={navigateTo} 
        logout={logoutUser} 
      />

      <main className="main-content">
        {renderPage()}
      </main>

      <footer style={{
        background: 'rgba(11, 15, 25, 0.9)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span>© 2026 Public Grievance Redressal System. All Rights Reserved.</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Help Desk Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
