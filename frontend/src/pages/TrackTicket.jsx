import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Clock, AlertTriangle, User, MessageSquare } from 'lucide-react';

const TrackTicket = ({ extraData }) => {
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  // Check if we passed a ticketId from another page (like the submit success redirect)
  useEffect(() => {
    if (extraData && extraData.searchId) {
      setTicketId(extraData.searchId);
      fetchTicketDetails(extraData.searchId);
    }
  }, [extraData]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    fetchTicketDetails(ticketId.trim());
  };

  const fetchTicketDetails = async (id) => {
    setLoading(true);
    setError('');
    setTicket(null);

    try {
      const response = await fetch(`http://localhost:5000/api/tickets/track/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setTicket(data);
      } else {
        setError(data.message || 'Grievance ticket not found. Check the ID and try again.');
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError('Could not connect to the database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="container" style={{ maxWidth: '750px' }}>
      <div className="glass-card mb-4">
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Track Grievance Status</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Enter your unique 9-character ticket ID (e.g. GRV-XXXXXX) below to see the latest updates.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            id="track-input-id"
            type="text" 
            value={ticketId} 
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="Enter Ticket ID (e.g. GRV-123456)" 
            className="form-input"
            style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
            required
          />
          <button 
            id="track-btn-search"
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ flexShrink: 0 }}
          >
            <Search size={18} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {loading && (
        <div className="glass-card text-center" style={{ padding: '2rem' }}>
          <div className="spinner" style={{
            border: '3px solid rgba(255,255,255,0.05)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Retrieving ticket records...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="flex-gap-2" style={{ color: '#ef4444' }}>
            <AlertTriangle size={18} />
            <strong>Error:</strong>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {error}
          </p>
        </div>
      )}

      {ticket && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main info card */}
          <div className="glass-card">
            <div className="flex-between" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GRIEVANCE DETAILS</span>
                <h3 style={{ fontSize: '1.3rem', color: '#c084fc', marginTop: '0.15rem' }}>{ticket.ticketId}</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
              </div>
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>{ticket.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
              {ticket.description}
            </p>

            <div className="grid-2" style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.85rem' }}>
              <div className="flex-gap-2">
                <Calendar size={14} color="#a5b4fc" />
                <span style={{ color: 'var(--text-muted)' }}>Filed on:</span>
                <span>{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex-gap-2">
                <Clock size={14} color="#a5b4fc" />
                <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                <span className="badge badge-progress" style={{ textTransform: 'none', padding: '0.1rem 0.5rem' }}>{ticket.category}</span>
              </div>
              <div className="flex-gap-2">
                <User size={14} color="#a5b4fc" />
                <span style={{ color: 'var(--text-muted)' }}>Reporter:</span>
                <span>{ticket.name === 'Anonymous' ? 'Anonymous Citizen' : ticket.name}</span>
              </div>
              {ticket.email && (
                <div className="flex-gap-2">
                  <MessageSquare size={14} color="#a5b4fc" />
                  <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                  <span>{ticket.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Tracking */}
          <div className="glass-card">
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Action & Resolution Timeline</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Chronological log of activities, investigation updates, and communications.
            </p>

            <div className="timeline">
              {ticket.history && ticket.history.map((hist, idx) => {
                const isLatest = idx === ticket.history.length - 1;
                const isResolved = hist.status.toLowerCase() === 'resolved';
                
                return (
                  <div key={idx} className="timeline-item">
                    <div className={`timeline-marker ${isLatest ? (isResolved ? 'resolved' : 'active') : ''}`}></div>
                    <div className="timeline-content">
                      <div className="flex-between">
                        <span className="timeline-title" style={{ color: isLatest ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          Status changed to: {getStatusBadge(hist.status)}
                        </span>
                        <span className="timeline-date">{formatDate(hist.updatedAt)}</span>
                      </div>
                      <p className="timeline-desc">
                        {hist.remarks || 'No remarks provided.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackTicket;
