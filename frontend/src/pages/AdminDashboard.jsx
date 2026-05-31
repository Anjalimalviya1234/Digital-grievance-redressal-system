import React, { useState, useEffect } from 'react';
import { Shield, ListFilter, Search, AlertCircle, RefreshCw, X, Check, Eye, MessageSquare, AlertOctagon, Sparkles, Clock, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & search states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected ticket for details / resolution
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [adminStatus, setAdminStatus] = useState('');
  const [adminCategory, setAdminCategory] = useState('');
  const [adminPriority, setAdminPriority] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  // AI states for Admin Dashboard
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated. Please sign in.');
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch Stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      // 2. Fetch Tickets with current filters
      let queryParams = [];
      if (filterStatus) queryParams.push(`status=${filterStatus}`);
      if (filterCategory) queryParams.push(`category=${filterCategory}`);
      if (filterPriority) queryParams.push(`priority=${filterPriority}`);
      
      const ticketsUrl = `http://localhost:5000/api/admin/tickets?${queryParams.join('&')}`;
      const ticketsRes = await fetch(ticketsUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ticketsData = await ticketsRes.json();

      if (statsRes.ok && ticketsRes.ok) {
        setStats(statsData);
        setTickets(ticketsData);
      } else {
        setError('Error retrieving admin records.');
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
      setError('Could not connect to the API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterStatus, filterCategory, filterPriority]);

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setUpdating(true);
    setUpdateMessage('');
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/tickets/${selectedTicket._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: adminStatus,
          remarks: adminRemarks,
          category: adminCategory,
          priority: adminPriority
        })
      });

      const data = await response.json();
      if (response.ok) {
        setUpdateMessage('Grievance details updated successfully.');
        setSelectedTicket(data.ticket);
        setAdminRemarks('');
        // Refresh dashboard lists and counts
        fetchDashboardData();
      } else {
        setUpdateMessage(data.message || 'Error updating grievance.');
      }
    } catch (err) {
      console.error('Update ticket error:', err);
      setUpdateMessage('Failed to update ticket.');
    } finally {
      setUpdating(false);
    }
  };

  // Filter list by search query (Client side helper to combine with server side state filters)
  const filteredTickets = tickets.filter(t => 
    t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
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

  // Inspect Ticket Details
  const handleInspectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setAdminStatus(ticket.status);
    setAdminCategory(ticket.category);
    setAdminPriority(ticket.priority);
    setAdminRemarks('');
    setUpdateMessage('');
    setAiResult(null);
    setAiLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/tickets/evaluate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: ticket.title, description: ticket.description })
      });
      const data = await response.json();
      if (response.ok) {
        setAiResult(data);
      }
    } catch (err) {
      console.error('Admin AI classification error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Title Header */}
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.0rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
            <Shield color="#8b5cf6" size={28} />
            <span>Admin Control Room</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            System-wide analytics, investigation dashboard, and grievance resolution mechanisms.
          </p>
        </div>
        <button 
          id="admin-btn-refresh"
          onClick={fetchDashboardData} 
          className="btn btn-secondary"
          style={{ padding: '0.75rem' }}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {error && (
        <div className="glass-card mb-4" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          {error}
        </div>
      )}

      {/* Aggregate Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL TICKETS</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--status-pending)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PENDING DEPOSITS</span>
            <span className="stat-value" style={{ color: 'var(--status-pending)' }}>{stats.pending}</span>
          </div>
          <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--status-progress)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>UNDER INVESTIGATION</span>
            <span className="stat-value" style={{ color: 'var(--status-progress)' }}>{stats.inProgress}</span>
          </div>
          <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--status-resolved)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RESOLVED RESOLUTIONS</span>
            <span className="stat-value" style={{ color: 'var(--status-resolved)' }}>{stats.resolved}</span>
          </div>
        </div>
      )}

      {/* Graphical Charts Section */}
      {stats && stats.total > 0 && (
        <div className="charts-container">
          {/* Category Chart */}
          <div className="glass-card chart-card">
            <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>Grievances by Category</h3>
            <div className="chart-bar-list">
              {Object.entries(stats.categories).map(([cat, count]) => {
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={cat} className="chart-bar-row">
                    <div className="chart-bar-label">
                      <span>{cat}</span>
                      <strong>{count} ({Math.round(percentage)}%)</strong>
                    </div>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar-fill" style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Chart */}
          <div className="glass-card chart-card">
            <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>Predicted Priority Levels</h3>
            <div className="chart-bar-list">
              {Object.entries(stats.priorities).map(([prio, count]) => {
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                let color = 'var(--status-progress)';
                if (prio.includes('High')) color = 'var(--status-rejected)';
                if (prio.includes('Medium')) color = 'var(--status-pending)';
                
                return (
                  <div key={prio} className="chart-bar-row">
                    <div className="chart-bar-label">
                      <span>{prio}</span>
                      <strong>{count} ({Math.round(percentage)}%)</strong>
                    </div>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar-fill" style={{ width: `${percentage}%`, background: color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main filterable list */}
      <div className="glass-card" style={{ padding: '1.5rem 0' }}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Grievance Records</h3>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '350px' }}>
                <input 
                  id="admin-input-search"
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ID, title, citizen..." 
                  className="form-input"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* Filter row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }} className="flex-gap-2">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ListFilter size={14} /> Filter:
              </span>
              
              <select 
                id="admin-select-status"
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.8rem' }}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select 
                id="admin-select-category"
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.8rem' }}
              >
                <option value="">All Categories</option>
                <option value="Complaint">Complaint</option>
                <option value="Query">Query</option>
                <option value="Support">Support</option>
                <option value="Suggestion">Suggestion</option>
              </select>

              <select 
                id="admin-select-priority"
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.8rem' }}
              >
                <option value="">All Priorities</option>
                <option value="Low (Level 1)">Low (Level 1)</option>
                <option value="Medium (Level 2)">Medium (Level 2)</option>
                <option value="High (Level 3)">High (Level 3)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table / List */}
        {loading ? (
          <div className="text-center" style={{ padding: '3rem 1.5rem' }}>
            <div className="spinner" style={{
              border: '2px solid rgba(255,255,255,0.05)',
              borderTop: '2px solid var(--primary)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Refreshing data...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center" style={{ padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
            No records matched your search filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ticket ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Citizen</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Grievance Subject</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Priority</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date Filed</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr 
                    key={t._id} 
                    id={`admin-row-${t.ticketId}`}
                    style={{ borderBottom: '1px solid var(--glass-border)' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: '#c084fc' }}>{t.ticketId}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {t.name === 'Anonymous' ? (
                        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Anonymous</span>
                      ) : t.name}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>{t.category}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{getPriorityBadge(t.priority)}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{getStatusBadge(t.status)}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{formatDate(t.createdAt)}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <button 
                        id={`inspect-btn-${t.ticketId}`}
                        onClick={() => handleInspectTicket(t)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', display: 'inline-flex' }}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out Action Modal for Selected Ticket */}
      {selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', width: '95%' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MANAGE TICKET</span>
                <h3 style={{ fontSize: '1.25rem', color: '#c084fc', marginTop: '0.15rem' }}>{selectedTicket.ticketId}</h3>
              </div>
              <button 
                id="modal-btn-close"
                onClick={() => setSelectedTicket(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{selectedTicket.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)', whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.description}
                </p>
              </div>

              {/* Informative Grid */}
              <div className="grid-2" style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Reporter:</span> {selectedTicket.name}
                </div>
                {selectedTicket.email && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Email:</span> {selectedTicket.email}
                  </div>
                )}
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date Filed:</span> {formatDate(selectedTicket.createdAt)}
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Current Status:</span> &nbsp;
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* AI Recommendation / Prediction Panel */}
              <div style={{ marginBottom: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  <Sparkles size={14} /> AI Classifier Prediction
                </span>
                {aiLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '1.5px' }}></div>
                    <span>Analyzing grievance text with Local AI...</span>
                  </div>
                ) : aiResult ? (
                  <div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Predicted Category</span>
                        <span className="badge badge-progress" style={{ marginTop: '0.25rem' }}>{aiResult.category}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Predicted Priority</span>
                        <span className={`badge ${aiResult.priority.includes('High') ? 'badge-high' : aiResult.priority.includes('Medium') ? 'badge-medium' : 'badge-low'}`} style={{ marginTop: '0.25rem' }}>
                          {aiResult.priority}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Confidence</span>
                        <strong style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{aiResult.confidence}%</strong>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {aiResult.explanation}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminCategory(aiResult.category);
                        setAdminPriority(aiResult.priority);
                      }}
                      className="btn btn-cyan"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', gap: '0.25rem' }}
                    >
                      <Sparkles size={12} />
                      <span>Apply AI Suggestions</span>
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI suggestion unavailable.</span>
                )}
              </div>

              {/* Action & Resolution Timeline (Tracking System) */}
              <div style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
                  <Clock size={16} color="#a5b4fc" />
                  <span>Action & Resolution Timeline</span>
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  Chronological tracking history of this grievance.
                </p>

                <div className="timeline">
                  {selectedTicket.history && selectedTicket.history.map((hist, idx) => {
                    const isLatest = idx === selectedTicket.history.length - 1;
                    const isResolved = hist.status.toLowerCase() === 'resolved';
                    
                    return (
                      <div key={idx} className="timeline-item" style={{ paddingLeft: '1.5rem', paddingBottom: '1.25rem' }}>
                        <div className={`timeline-marker ${isLatest ? (isResolved ? 'resolved' : 'active') : ''}`} style={{ width: '10px', height: '10px', left: '-5px' }}></div>
                        <div className="timeline-content">
                          <div className="flex-between">
                            <span className="timeline-title" style={{ color: isLatest ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                              Status: {getStatusBadge(hist.status)}
                            </span>
                            <span className="timeline-date" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDateTime(hist.updatedAt)}</span>
                          </div>
                          <p className="timeline-desc" style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                            {hist.remarks || 'No remarks provided.'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Update form */}
              <form onSubmit={handleUpdateTicket} className="glass-card" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <h4 style={{ fontSize: '1rem', color: '#a5b4fc', marginBottom: '1rem' }}>Investigation Controls</h4>

                {updateMessage && (
                  <div style={{ 
                    padding: '0.75rem', 
                    borderRadius: 'var(--radius-sm)', 
                    marginBottom: '1rem', 
                    fontSize: '0.85rem',
                    background: updateMessage.includes('successfully') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: updateMessage.includes('successfully') ? '#10b981' : '#ef4444',
                    border: '1px solid ' + (updateMessage.includes('successfully') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)')
                  }}>
                    {updateMessage}
                  </div>
                )}

                <div className="grid-2" style={{ margin: 0 }}>
                  {/* Category Select */}
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      id="modal-select-category"
                      value={adminCategory} 
                      onChange={(e) => setAdminCategory(e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="Complaint">Complaint</option>
                      <option value="Query">Query</option>
                      <option value="Support">Support</option>
                      <option value="Suggestion">Suggestion</option>
                    </select>
                  </div>

                  {/* Priority Select */}
                  <div className="form-group">
                    <label className="form-label">Priority Level</label>
                    <select 
                      id="modal-select-priority"
                      value={adminPriority} 
                      onChange={(e) => setAdminPriority(e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="Low (Level 1)">Low (Level 1)</option>
                      <option value="Medium (Level 2)">Medium (Level 2)</option>
                      <option value="High (Level 3)">High (Level 3)</option>
                    </select>
                  </div>
                </div>

                {/* Status Select */}
                <div className="form-group">
                  <label className="form-label">Update Ticket Status</label>
                  <select 
                    id="modal-select-status"
                    value={adminStatus} 
                    onChange={(e) => setAdminStatus(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="Pending">Pending (Received)</option>
                    <option value="In Progress">In Progress (Under Investigation)</option>
                    <option value="Resolved">Resolved (Complete)</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Remarks Textarea */}
                <div className="form-group">
                  <label className="form-label">Investigation Logs / Official Remarks</label>
                  <textarea 
                    id="modal-textarea-remarks"
                    value={adminRemarks} 
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    placeholder="Provide resolution details, action taken, or explanation for rejection..."
                    className="form-textarea"
                    style={{ minHeight: '80px' }}
                    required
                  />
                </div>

                <button 
                  id="modal-btn-submit"
                  type="submit" 
                  disabled={updating}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Check size={16} />
                  <span>{updating ? 'Updating Records...' : 'Save Grievance Changes'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Local table styles */}
      <style>{`
        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .spinner {
          border: 3px solid rgba(255, 255, 255, 0.05);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
