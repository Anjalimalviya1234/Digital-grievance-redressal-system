const db = require('../utils/db');
const { analyzeGrievance } = require('../utils/aiClassifier');

// Generate unique ticket ID, e.g., GRV-482015
const generateTicketId = async () => {
  let isUnique = false;
  let ticketId = '';
  
  while (!isUnique) {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    ticketId = `GRV-${randomNum}`;
    const existing = await db.tickets.findOne({ ticketId });
    if (!existing) {
      isUnique = true;
    }
  }
  return ticketId;
};

// Evaluate text with AI
const evaluateTicketAI = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Description is required for AI evaluation' });
    }
    const analysis = analyzeGrievance(title || '', description);
    res.json(analysis);
  } catch (error) {
    console.error('AI evaluation error:', error);
    res.status(500).json({ message: 'Error running AI classifier' });
  }
};

// Submit Grievance
const submitTicket = async (req, res) => {
  try {
    const { title, description, category, priority, name, email, phone, isAnonymous } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Auto-predict category/priority if not provided
    const aiPrediction = analyzeGrievance(title, description);
    const finalCategory = category || aiPrediction.category;
    const finalPriority = priority || aiPrediction.priority;

    // Determine user association
    let userId = null;
    if (req.user) {
      userId = req.user.id;
    }

    const ticketId = await generateTicketId();

    const ticketData = {
      ticketId,
      userId,
      name: isAnonymous ? 'Anonymous' : (name || 'Anonymous Citizen'),
      email: isAnonymous ? '' : (email || ''),
      phone: isAnonymous ? '' : (phone || ''),
      title,
      description,
      category: finalCategory,
      priority: finalPriority,
      status: 'Pending',
      remarks: '',
      history: [{
        status: 'Pending',
        remarks: 'Grievance submitted successfully.',
        updatedAt: new Date().toISOString()
      }]
    };

    const newTicket = await db.tickets.create(ticketData);

    res.status(201).json({
      message: 'Grievance ticket created successfully',
      ticket: newTicket
    });
  } catch (error) {
    console.error('Ticket submission error:', error);
    res.status(500).json({ message: 'Server error during ticket submission' });
  }
};

// Get User's Personal Tickets
const getMyTickets = async (req, res) => {
  try {
    const tickets = await db.tickets.find({ userId: req.user.id });
    res.json(tickets);
  } catch (error) {
    console.error('Fetch my tickets error:', error);
    res.status(500).json({ message: 'Server error fetching tickets' });
  }
};

// Track Ticket by ID (Public Access)
const trackTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    if (!ticketId) {
      return res.status(400).json({ message: 'Ticket ID is required' });
    }

    const ticket = await db.tickets.findOne({ ticketId: ticketId.toUpperCase().trim() });
    if (!ticket) {
      return res.status(404).json({ message: 'No grievance found with this ticket ID' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Track ticket error:', error);
    res.status(500).json({ message: 'Server error tracking ticket' });
  }
};

module.exports = {
  evaluateTicketAI,
  submitTicket,
  getMyTickets,
  trackTicket
};
