const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');


const FALLBACK_DB_PATH = path.join(__dirname, '..', 'db_fallback.json');

let isFallback = false;

// Connect to MongoDB
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  try {
    
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('Successfully connected to MongoDB!');
    isFallback = false;
  } catch (error) {
    console.warn('MongoDB connection failed. Falling back to local JSON database.');
    console.warn(`Error: ${error.message}`);
    isFallback = true;
    initFallbackDB();
  }
};

// Initialize fallback JSON file with basic collections
const initFallbackDB = () => {
  if (!fs.existsSync(FALLBACK_DB_PATH)) {
    const initialData = {
      users: [],
      tickets: []
    };
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
    console.log(`Initialized fallback JSON database at: ${FALLBACK_DB_PATH}`);
  } else {
    console.log(`Using existing fallback JSON database at: ${FALLBACK_DB_PATH}`);
  }
};

// Helper functions for fallback database operations
const readFallbackData = () => {
  try {
    const data = fs.readFileSync(FALLBACK_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading fallback DB:', error);
    return { users: [], tickets: [] };
  }
};

const writeFallbackData = (data) => {
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing fallback DB:', error);
  }
};

// Import Mongoose Models (used if MongoDB is active)
const MongoUser = require('../models/User');
const MongoTicket = require('../models/Ticket');

// Repository Interface to abstract MongoDB vs JSON file operations
const db = {
  isFallbackMode: () => isFallback,
  connect: connectDB,

  // User Actions
  users: {
    find: async (query = {}) => {
      if (!isFallback) {
        return await MongoUser.find(query);
      }
      const data = readFallbackData();
      return data.users.filter(u => {
        for (let key in query) {
          if (u[key] !== query[key]) return false;
        }
        return true;
      });
    },

    findOne: async (query) => {
      if (!isFallback) {
        return await MongoUser.findOne(query);
      }
      const data = readFallbackData();
      return data.users.find(u => {
        for (let key in query) {
          if (u[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },

    findById: async (id) => {
      if (!isFallback) {
        return await MongoUser.findById(id);
      }
      const data = readFallbackData();
      return data.users.find(u => u._id === id.toString()) || null;
    },

    create: async (userData) => {
      if (!isFallback) {
        const newUser = new MongoUser(userData);
        return await newUser.save();
      }
      const data = readFallbackData();
      const newUser = {
        _id: 'usr_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        role: 'citizen',
        ...userData
      };
      data.users.push(newUser);
      writeFallbackData(data);
      return newUser;
    }
  },

  // Ticket Actions
  tickets: {
    find: async (query = {}) => {
      if (!isFallback) {
        return await MongoTicket.find(query).sort({ createdAt: -1 });
      }
      const data = readFallbackData();
      let results = data.tickets;
      if (query.userId) {
        results = results.filter(t => t.userId === query.userId.toString());
      }
      if (query.status) {
        results = results.filter(t => t.status === query.status);
      }
      // Sort by creation date descending
      return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    findOne: async (query) => {
      if (!isFallback) {
        return await MongoTicket.findOne(query);
      }
      const data = readFallbackData();
      return data.tickets.find(t => {
        for (let key in query) {
          if (t[key] !== query[key]) return false;
        }
        return true;
      }) || null;
    },

    findById: async (id) => {
      if (!isFallback) {
        return await MongoTicket.findById(id);
      }
      const data = readFallbackData();
      return data.tickets.find(t => t._id === id.toString()) || null;
    },

    create: async (ticketData) => {
      if (!isFallback) {
        const newTicket = new MongoTicket(ticketData);
        return await newTicket.save();
      }
      const data = readFallbackData();
      const newTicket = {
        _id: 'tkt_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Pending',
        remarks: '',
        history: [{
          status: 'Pending',
          remarks: 'Grievance submitted successfully.',
          updatedAt: new Date().toISOString()
        }],
        ...ticketData
      };
      data.tickets.push(newTicket);
      writeFallbackData(data);
      return newTicket;
    },

    findByIdAndUpdate: async (id, updateData) => {
      if (!isFallback) {
        return await MongoTicket.findByIdAndUpdate(id, updateData, { new: true });
      }
      const data = readFallbackData();
      const ticketIndex = data.tickets.findIndex(t => t._id === id.toString());
      if (ticketIndex === -1) return null;

      const oldTicket = data.tickets[ticketIndex];
      const updatedTicket = {
        ...oldTicket,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      // Handle history list update
      if (updateData.history) {
        updatedTicket.history = updateData.history;
      } else if (updateData.status && updateData.status !== oldTicket.status) {
        updatedTicket.history = [
          ...oldTicket.history,
          {
            status: updateData.status,
            remarks: updateData.remarks || 'Status updated by Administrator.',
            updatedAt: new Date().toISOString()
          }
        ];
      }

      data.tickets[ticketIndex] = updatedTicket;
      writeFallbackData(data);
      return updatedTicket;
    }
  }
};

module.exports = db;
