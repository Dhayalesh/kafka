require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const kafkaProducer = require('./kafka/producer');
const timescaleDB = require('./db/timescale');
// NOTE: Consumer removed - Go service handles consuming events and writing to TimescaleDB
// Express only publishes events and provides read API for logs

const app = express();

// Middleware - Accept from any origin
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todo_manager')
  .then(async () => {
    console.log('✅ MongoDB connected');
    // Seed default users
    const seedUsers = require('./db/seedUsers');
    await seedUsers();

    // Initialize TimescaleDB
    try {
      await timescaleDB.initializeDatabase();
      console.log('✅ TimescaleDB initialized');
    } catch (error) {
      console.error('⚠️ TimescaleDB initialization failed:', error.message);
      console.log('Logs will not be available until TimescaleDB is configured');
    }

    // Connect Kafka producer only (Go consumer handles writing logs)
    if (process.env.KAFKA_ENABLED !== 'false') {
      await kafkaProducer.connect();
      console.log('📝 Express: Publishing events to Kafka (Go consumer writes logs)');
    } else {
      console.log('⚠️ Kafka disabled - events will not be published');
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Check: 1) IP whitelist 2) Network 3) Credentials');
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/restore', require('./routes/restore'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Todo Manager API is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - Accepting requests from any origin`);
});