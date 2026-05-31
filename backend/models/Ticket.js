const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, default: 'Anonymous' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Complaint' },
  priority: { type: String, default: 'Low' },
  status: { type: String, default: 'Pending' },
  remarks: { type: String, default: '' },
  history: [{
    status: String,
    remarks: String,
    updatedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', TicketSchema);
