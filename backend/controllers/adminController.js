const db = require('../utils/db');

// Get All Tickets (with filters)
const getAllTickets = async (req, res) => {
  try {
    const { category, priority, status } = req.query;
    const query = {};

    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (status) query.status = status;

    const tickets = await db.tickets.find(query);
    res.json(tickets);
  } catch (error) {
    console.error('Admin fetch tickets error:', error);
    res.status(500).json({ message: 'Server error fetching tickets' });
  }
};

// Update Ticket Status/Details by Admin
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, category, priority } = req.body;

    const ticket = await db.tickets.findById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (category) updates.category = category;
    if (priority) updates.priority = priority;
    
    // Manage history tracking
    const history = [...ticket.history];
    let hasStatusChanged = status && status !== ticket.status;
    let remarksText = remarks || '';

    if (hasStatusChanged || remarksText) {
      history.push({
        status: status || ticket.status,
        remarks: remarksText || `Details updated by administrator.`,
        updatedAt: new Date().toISOString()
      });
      updates.history = history;
    }

    if (remarksText) {
      updates.remarks = remarksText;
    }

    const updatedTicket = await db.tickets.findByIdAndUpdate(id, updates);
    res.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Admin ticket update error:', error);
    res.status(500).json({ message: 'Server error updating ticket' });
  }
};

// Get Dashboard Analytics/Stats
const getDashboardStats = async (req, res) => {
  try {
    const tickets = await db.tickets.find({});
    
    const stats = {
      total: tickets.length,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
      categories: {
        Complaint: 0,
        Query: 0,
        Support: 0,
        Suggestion: 0
      },
      priorities: {
        'Low (Level 1)': 0,
        'Medium (Level 2)': 0,
        'High (Level 3)': 0
      },
      recentTickets: []
    };

    tickets.forEach(ticket => {
      // Status breakdown
      const statusKey = ticket.status.toLowerCase();
      if (statusKey === 'pending') stats.pending++;
      else if (statusKey === 'in progress') stats.inProgress++;
      else if (statusKey === 'resolved') stats.resolved++;
      else if (statusKey === 'rejected') stats.rejected++;

      // Category breakdown
      const cat = ticket.category;
      if (stats.categories.hasOwnProperty(cat)) {
        stats.categories[cat]++;
      } else {
        stats.categories[cat] = 1;
      }

      // Priority breakdown
      const prio = ticket.priority;
      if (stats.priorities.hasOwnProperty(prio)) {
        stats.priorities[prio]++;
      } else {
        stats.priorities[prio] = 1;
      }
    });

    // Get 5 most recent tickets
    stats.recentTickets = tickets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(t => ({
        id: t._id,
        ticketId: t.ticketId,
        title: t.title,
        category: t.category,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt
      }));

    res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error generating statistics' });
  }
};

module.exports = {
  getAllTickets,
  updateTicketStatus,
  getDashboardStats
};
