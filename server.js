require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const cors = require('cors');
const ejsLayouts = require('express-ejs-layouts');

// Import database (client side only)
const { testConnection } = require('./src/database/connection');
const dbService = require('./src/database/service');

const app = express();

// Test database connection on startup
testConnection();

// Basic security headers; relax CSP in dev to allow CDN assets
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

// Sessions (for cart functionality)
app.use(session({
  secret: process.env.SESSION_SECRET || 'kala-art-platform-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  },
}));

// Static assets
app.use('/public', express.static(path.join(__dirname, 'public')));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('layout', 'layouts/main');

// Expose common locals
app.use((req, res, next) => {
  res.locals.appName = 'कला';
  res.locals.year = new Date().getFullYear();
  next();
});

// Page view tracking middleware
app.use(async (req, res, next) => {
  // Only track page views for GET requests to main pages
  if (req.method === 'GET' && !req.path.startsWith('/public')) {
    try {
      await dbService.recordPageView();
    } catch (error) {
      console.error('Page view tracking error:', error);
      // Don't block the request if tracking fails
    }
  }
  next();
});

// Routes
const clientRoutes = require('./src/routes/client');

// Use main layout for client routes
app.use('/', clientRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('misc/404', { title: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong!' 
    : err.message;
  res.status(500).render('misc/error', {
    title: '500 - Server Error',
    message
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  const { closePool } = require('./src/database/connection');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  const { closePool } = require('./src/database/connection');
  await closePool();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`कला client running on http://localhost:${PORT}`);
});
