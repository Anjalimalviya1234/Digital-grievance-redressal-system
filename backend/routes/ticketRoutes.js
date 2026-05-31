const express = require('express');
const router = express.Router();
const { evaluateTicketAI, submitTicket, getMyTickets, trackTicket } = require('../controllers/ticketController');
const { protect, optionalProtect } = require('../controllers/authController');
const { validateBody } = require('../middlewares/validate');

// ticket routes
router.post('/submit', optionalProtect, validateBody(['title', 'description']), submitTicket);
router.get('/my-tickets', protect, getMyTickets);
router.get('/track/:ticketId', trackTicket);
router.post('/evaluate-ai', validateBody(['description']), evaluateTicketAI);

module.exports = router;
