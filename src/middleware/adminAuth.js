const bcrypt = require('bcrypt');
const dbService = require('../services/databaseService');

// Admin authentication middleware
const requireAdminAuth = (req, res, next) => {
  if (!req.session.admin) {
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        redirect: '/admin/login'
      });
    }
    return res.redirect('/admin/login');
  }
  next();
};

// Add admin to response locals
const addAdminToLocals = (req, res, next) => {
  res.locals.admin = req.session.admin || null;
  res.locals.isAdminLoggedIn = !!req.session.admin;
  next();
};

// Rate limiting for login attempts
const loginAttempts = new Map();

const rateLimitLogin = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
  
  // Reset attempts after 15 minutes
  if (Date.now() - attempts.lastAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
  }
  
  if (attempts.count >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again in 15 minutes.',
      retryAfter: 15 * 60 * 1000
    });
  }
  
  // Store IP for tracking
  req.clientIP = ip;
  next();
};

// Record failed login attempt
const recordFailedAttempt = (ip) => {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  loginAttempts.set(ip, attempts);
};

// Clear login attempts on success
const clearLoginAttempts = (ip) => {
  loginAttempts.delete(ip);
};

module.exports = {
  requireAdminAuth,
  addAdminToLocals,
  rateLimitLogin,
  recordFailedAttempt,
  clearLoginAttempts
};
