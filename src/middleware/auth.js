const bcrypt = require('bcrypt');
const dbService = require('../database/service');

/**
 * Admin authentication middleware
 * Checks if user is logged in as admin
 */
const requireAuth = async (req, res, next) => {
  try {
    if (!req.session.admin || !req.session.admin.admin_id) {
      return res.redirect('/admin/login');
    }

    // Verify admin still exists and is active
    const admin = await dbService.getAdminById(req.session.admin.admin_id);
    if (!admin || !admin.is_active) {
      req.session.destroy();
      return res.redirect('/admin/login');
    }

    // Add admin info to request
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.session.destroy();
    res.redirect('/admin/login');
  }
};

/**
 * Redirect if already logged in
 */
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.admin && req.session.admin.admin_id) {
    return res.redirect('/admin/dashboard');
  }
  next();
};

/**
 * Hash password
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

/**
 * Verify password
 */
const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Rate limiting for login attempts
 */
const loginRateLimit = {};

const checkRateLimit = (ip) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!loginRateLimit[ip]) {
    loginRateLimit[ip] = { attempts: 0, resetTime: now + windowMs };
  }

  const record = loginRateLimit[ip];
  
  if (now > record.resetTime) {
    record.attempts = 0;
    record.resetTime = now + windowMs;
  }

  if (record.attempts >= maxAttempts) {
    const remainingTime = Math.ceil((record.resetTime - now) / 1000 / 60);
    throw new Error(`Too many login attempts. Try again in ${remainingTime} minutes.`);
  }

  record.attempts++;
  return true;
};

const resetRateLimit = (ip) => {
  delete loginRateLimit[ip];
};

module.exports = {
  requireAuth,
  redirectIfAuthenticated,
  hashPassword,
  verifyPassword,
  checkRateLimit,
  resetRateLimit
};
