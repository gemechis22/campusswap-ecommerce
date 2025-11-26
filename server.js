// ============================================
// CAMPUSSWAP EXPRESS SERVER
// EECS 4413 Project - MVC Architecture
// Think of this as your web.xml configuration
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import route modules (like servlet mappings)
const productRoutes = require('./src/routes/productRoutes');
const authRoutes = require('./src/routes/authRoutes');

// Create Express application
const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Enable CORS for frontend communication
app.use(cors({
  origin: '*', // In production, specify your frontend URL
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTE MAPPINGS (Like servlet URL patterns)
// ============================================

// API Routes
app.use('/api/products', productRoutes);      // Products API
app.use('/api/auth', authRoutes);             // Authentication API

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CampusSwap Backend API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      auth: '/api/auth',
      health: '/api/health'
    }
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('🎓 ============================================');
  console.log('   CAMPUSSWAP BACKEND SERVER');
  console.log('   EECS 4413 - MVC Architecture');
  console.log('============================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log('============================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
