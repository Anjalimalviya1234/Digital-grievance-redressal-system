require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./utils/db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Seed Default Admin Account
const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@grievance.gov.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const existingAdmin = await db.users.findOne({ email: adminEmail.toLowerCase() });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await db.users.create({
        name: 'System Administrator',
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Seeded default admin account successfully!');
      console.log(`Admin Email: ${adminEmail}`);
      console.log(`Admin Password: ${adminPassword}`);
    } else {
      console.log('Admin account already seeded.');
    }
  } catch (error) {
    console.error('Error seeding admin account:', error);
  }
};

// --- ROUTES ---

// Mount modular route middleware
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: db.isFallbackMode() ? 'Fallback JSON File' : 'MongoDB Connected',
    timestamp: new Date()
  });
});

// Start Server after connecting to Database
const startServer = async () => {
  await db.connect();
  await seedAdmin();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
  });
};

startServer();
