const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/db');

// Load environment variables
dotenv.config();

// Import routes
const mealsRoutes = require('./routes/meals');
const openaiRoutes = require('./routes/openai');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize app locals
app.locals.dbInitialized = false;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable more detailed logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use('/api/meals', mealsRoutes);
app.use('/api/openai', openaiRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'AI Meal Planner API is running',
    version: '1.0.0',
    endpoints: {
      meals: '/api/meals/*',
      openai: '/api/openai/*'
    }
  });
});

// Database status endpoint
app.get('/api/status/database', async (req, res) => {
  try {
    const status = await db.getDatabaseStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get database status',
      error: error.message
    });
  }
});

// Environment check endpoint
app.get('/api/status/env', (req, res) => {
  res.json({
    node_env: process.env.NODE_ENV || 'development',
    supabase_url: !!process.env.SUPABASE_URL || !!process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabase_key: !!process.env.SUPABASE_ANON_KEY || !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    openai_key: !!process.env.OPENAI_API_KEY,
    port: PORT
  });
});

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Create database tables
app.post('/api/admin/initialize-database', async (req, res) => {
  try {
    console.log('Initializing database...');
    const success = await db.initializeDatabase();
    app.locals.dbInitialized = success;
    
    res.json({
      success: success,
      message: success ? 'Database initialized successfully' : 'Database initialization had issues'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error initializing database',
      error: error.message
    });
  }
});

// Create tables and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    // Initialize the database (automatically selects Supabase or SQLite)
    const success = await db.initializeDatabase();
    app.locals.dbInitialized = success;
    
    if (success) {
      console.log('Database initialized successfully');
    } else {
      console.warn('Database initialization had issues, but will attempt to continue...');
    }
    
    // Start the Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API base URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    // Don't exit - try to keep running even with errors
    console.log('Attempting to start server despite errors...');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} (with errors)`);
      console.log(`API base URL: http://localhost:${PORT}`);
    });
  }
}

// Start the server
startServer();

// Export the app for testing
module.exports = app;