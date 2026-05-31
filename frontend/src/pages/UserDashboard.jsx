import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Calendar, Folder, ClipboardList, RefreshCw, ChevronRight } from 'lucide-react';

const UserDashboard = ({ currentUser, navigateTo }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyTickets = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please sign in again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/tickets/my-tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(data);
      } else {
        setError(data.message || 'Failed to retrieve ticket history.');
      }
    } catch (err) {
      console.error('Fetch tickets error:', err);
      setError('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s === 'pending') return <span className="badge badge-pending">Pending</span>;
    if (s === 'in progress') return <span className="badge badge-progress">In Progress</span>;
    if (s === 'resolved') return <span className="badge badge-resolved">Resolved</span>;
    return <span className="badge badge-rejected">Rejected</span>;
  };

  const getPriorityBadge = (priority) => {
    if (priority.includes('High')) return <span className="badge badge-high">{priority}</span>;
    if (priority.includes('Medium')) return <span className="badge badge-medium">{priority}</span>;
    return <span className="badge badge-low">{priority}</span>;
  };

  return (
    <div className="container">
      {/* Dashboard Header */}
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: "'Outfit', sans-serif" }}>Citizen Workspace</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Welcome back, {currentUser?.name}. Manage and monitor your registered grievances.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            id="dashboard-btn-refresh"
            onClick={fetchMyTickets}
            className="btn btn-secondary"
            title="Refresh List"
            style={{ padding: '0.75rem' }}
          >
            <RefreshCw size={18} />
          </button>
          
          <button 
            id="dashboard-btn-new"
            onClick={() => navigateTo('submit-ticket')}
            className="btn btn-primary"
          >
            <PlusCircle size={18} />
            <span>File New Grievance</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card mb-4" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-card text-center" style={{ padding: '4rem 2rem' }}>
          <div className="spinner" style={{
            border: '3px solid rgba(255,255,255,0.05)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            margin: '0 auto 1.5rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your submitted grievances...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="glass-card empty-state">
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '1.25rem', borderRadius: '50%' }}>
            <ClipboardList size={40} />
          </div>
          <h3>No grievances found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.9rem' }}>
            You haven't registered any grievances on this account yet. Click the button below to submit your first issue.
          </p>
          <button 
            id="dashboard-empty-btn-new"
            onClick={() => navigateTo('submit-ticket')}
            className="btn btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            <PlusCircle size={16} />
            <span>File a Grievance</span>
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--glass-border)',
            background: 'rgba(0,0,0,0.15)',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-secondary)'
          }}>
            Your Registered Grievances ({tickets.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {tickets.map((t) => (
              <div 
                key={t._id}
                id={`ticket-item-${t.ticketId}`}
                onClick={() => navigateTo('track-ticket', { searchId: t.ticketId })}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)'
                }}
                className="ticket-hover-row"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxWidth: '75%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c084fc', letterSpacing: '0.05em' }}>
                      {t.ticketId}
                    </span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t.title}
                    </h4>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} /> {formatDate(t.createdAt)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Folder size={12} /> {t.category}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                    {getStatusBadge(t.status)}
                    {getPriorityBadge(t.priority)}
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>

          {/* Simple styles for row hover */}
          <style>{`
            .ticket-hover-row:hover {
              background: rgba(255, 255, 255, 0.02);
            }
            .ticket-hover-row:last-child {
              border-bottom: none;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
