import React, { useState, useEffect } from 'react';
import { Sparkles, Send, CheckCircle2, Copy, ArrowRight, UserCheck } from 'lucide-react';

const SubmitTicket = ({ currentUser, navigateTo }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '', // Manual override
    priority: '', // Manual override
    name: '',
    email: '',
    phone: '',
    isAnonymous: false
  });


  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // If user is logged in, autofill their details and disable anonymous reporting by default (though they can still check it)
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name,
        email: currentUser.email,
        isAnonymous: false
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };



  // Submit Ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setErrorMessage('Title and description are required.');
      return;
    }
    setErrorMessage('');
    setSubmitting(true);

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add token if logged in
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:5000/api/tickets/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setSubmittedTicket(data.ticket);
      } else {
        setErrorMessage(data.message || 'Failed to submit grievance.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrorMessage('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyTicketId = () => {
    if (!submittedTicket) return;
    navigator.clipboard.writeText(submittedTicket.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success view
  if (submittedTicket) {
    return (
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="glass-card text-center" style={{ padding: '3rem 2rem', marginTop: '2rem' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Grievance Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Your grievance has been successfully logged. Please keep your unique Ticket ID safe to track resolution progress.
          </p>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Ticket ID
              </span>
              <h3 style={{ fontSize: '1.5rem', letterSpacing: '0.05em', color: '#c084fc', marginTop: '0.25rem' }}>
                {submittedTicket.ticketId}
              </h3>
            </div>
            <button 
              id="success-btn-copy"
              onClick={copyTicketId}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              <Copy size={16} />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              id="success-btn-track"
              onClick={() => navigateTo('track-ticket', { searchId: submittedTicket.ticketId })}
              className="btn btn-primary"
            >
              <span>Track Status Now</span>
              <ArrowRight size={16} />
            </button>
            <button 
              id="success-btn-home"
              onClick={() => navigateTo('home')}
              className="btn btn-secondary"
            >
              <span>Return Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="glass-card">
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          File a Public Grievance
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.0rem', fontSize: '0.95rem' }}>
          Provide the details of the problem. Please fill out all required fields to help our team address your issue effectively.
        </p>

        {errorMessage && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Subject / Title</label>
            <input 
              id="ticket-input-title"
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange}
              placeholder="e.g. Broken Water Pipe near Central Park Road"
              className="form-input"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea 
              id="ticket-input-description"
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              placeholder="Provide a detailed description. Include exact location, how long the issue has persisted, and any safety hazards..."
              className="form-textarea"
              required
            />
          </div>


          <div className="grid-2">
            {/* Category Select */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                id="ticket-select-category"
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Category</option>
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
                id="ticket-select-priority"
                name="priority" 
                value={formData.priority} 
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Priority</option>
                <option value="Low (Level 1)">Low (Level 1)</option>
                <option value="Medium (Level 2)">Medium (Level 2)</option>
                <option value="High (Level 3)">High (Level 3)</option>
              </select>
            </div>
          </div>

          {/* Anonymous checkbox */}
          <div style={{ margin: '1.5rem 0' }}>
            <label className="checkbox-label">
              <input 
                id="ticket-checkbox-anonymous"
                type="checkbox" 
                name="isAnonymous" 
                checked={formData.isAnonymous} 
                onChange={handleChange}
                className="checkbox-input"
              />
              <span>Submit this grievance anonymously</span>
            </label>
          </div>

          {/* Contact Details (conditional) */}
          {!formData.isAnonymous && (
            <div className="glass-card" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#a5b4fc', marginBottom: '1rem' }}>Contact Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-2" style={{ margin: 0 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Full Name</label>
                    <input 
                      id="ticket-input-name"
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="form-input"
                      required={!formData.isAnonymous}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Address</label>
                    <input 
                      id="ticket-input-email"
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="form-input"
                      required={!formData.isAnonymous}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone Number (Optional)</label>
                  <input 
                    id="ticket-input-phone"
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            id="ticket-btn-submit"
            type="submit" 
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
          >
            <Send size={18} />
            <span>{submitting ? 'Submitting Grievance...' : 'Submit Grievance Ticket'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitTicket;
