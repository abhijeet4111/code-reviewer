const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import configurations and middleware
const { sequelize, testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const scanRoutes = require('./routes/scanRoutes');
const ruleRoutes = require('./routes/ruleRoutes');

// Import models to ensure they are registered
require('./models');

// Import seeders
const { seedRules } = require('./src/seedRules');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/scans', scanRoutes);
app.use('/api/rules', ruleRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🔍 Security Scanner Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      scans: '/api/scans',
      rules: '/api/rules',
    },
    documentation: 'https://github.com/your-repo/security-scanner',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database initialization and server startup
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models (create tables if they don't exist)
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === 'development',
      force: false // Set to true only if you want to recreate tables
    });
    
    console.log('📦 Database models synchronized successfully');
    
    // Seed initial data
    if (process.env.NODE_ENV === 'development') {
      await seedRules();
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log('🚀 Server started successfully!');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log('='.repeat(50));
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
