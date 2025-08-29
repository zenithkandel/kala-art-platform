const dbService = require('../database/service');

// Middleware to check if user is authenticated as admin
function requireAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  
  // If it's an API request, return JSON error
  if (req.path.startsWith('/admin/api/')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Otherwise redirect to login
  res.redirect('/admin/login');
}

// Middleware to redirect authenticated users away from login page
function redirectIfAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  next();
}

// Middleware to add admin user to res.locals for templates
function addAdminToLocals(req, res, next) {
  res.locals.admin = req.session?.admin || null;
  res.locals.isAuthenticated = !!(req.session?.admin);
  next();
}

// Rate limiting for login attempts
const loginAttempts = new Map();

function rateLimitLogin(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 0, resetTime: now + windowMs });
  }
  
  const attempts = loginAttempts.get(ip);
  
  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + windowMs;
  }
  
  if (attempts.count >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.'
    });
  }
  
  // Increment attempt count
  attempts.count++;
  
  next();
}

// Reset login attempts on successful login
function resetLoginAttempts(req) {
  const ip = req.ip || req.connection.remoteAddress;
  loginAttempts.delete(ip);
}

module.exports = {
  requireAuth,
  redirectIfAuth,
  addAdminToLocals,
  rateLimitLogin,
  resetLoginAttempts
};
