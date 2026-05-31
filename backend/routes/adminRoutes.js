const express = require('express');
const router = express.Router();
const { getAllTickets, updateTicketStatus, getDashboardStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../controllers/authController');

// admin routes
router.get('/tickets', protect, adminOnly, getAllTickets);
router.put('/tickets/:id', protect, adminOnly, updateTicketStatus);
router.get('/stats', protect, adminOnly, getDashboardStats);

module.exports = router;
