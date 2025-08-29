require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const cors = require('cors');
const ejsLayouts = require('express-ejs-layouts');

// Import database services and connection test
const { testConnection } = require('./src/database/connection');
const dbService = require('./src/database/service');

// Import routes and middleware
const clientRoutes = require('./src/routes/client');
const adminRoutes = require('./src/routes/admin');
const { addAdminToLocals } = require('./src/middleware/adminAuth');

const app = express();

// Test database connection on startup
testConnection();

// --- CORE MIDDLEWARE ---

// Basic security headers; relax CSP in dev to allow CDN assets
app.use(helmet({
  contentSecurityPolicy: false, 
}));
app.use(cors());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

// Session management for client cart and admin auth
app.use(session({
  secret: process.env.SESSION_SECRET || 'kala-art-platform-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true, // Necessary for admin login session tracking
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  },
}));

// --- STATIC ASSETS & VIEWS ---

// Static assets
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(ejsLayouts);

// --- DYNAMIC MIDDLEWARE & LOCALS ---

// Make admin session data available in all templates
app.use(addAdminToLocals);

// Expose other common local variables to all templates
app.use((req, res, next) => {
  res.locals.appName = 'कला';
  res.locals.year = new Date().getFullYear();
  next();
});

// Page view tracking middleware
app.use(async (req, res, next) => {
  // Only track page views for GET requests to non-asset, non-admin pages
  if (req.method === 'GET' && !req.path.startsWith('/public') && !req.path.startsWith('/admin')) {
    try {
      await dbService.recordPageView();
    } catch (error) {
      console.error('Page view tracking error:', error);
    }
  }
  next();
});

// --- ROUTING ---

// Middleware to dynamically set the layout based on the route
app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    app.set('layout', 'admin/layout');
  } else {
    app.set('layout', 'layouts/main');
  }
  next();
});

// Mount application routes
app.use('/admin', adminRoutes);
app.use('/', clientRoutes);

// --- ERROR HANDLING ---

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).render('misc/404', { title: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred.' 
    : err.message;
  res.status(500).render('misc/error', {
    title: '500 - Server Error',
    message
  });
});

// --- SERVER LIFECYCLE ---

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully.`);
  const { closePool } = require('./src/database/connection');
  await closePool();
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎨 कला platform is running.`);
  console.log(`   - Client: http://localhost:${PORT}`);
  console.log(`   - Admin:  http://localhost:${PORT}/admin`);
});

