const express = require('express');
const router = express.Router();
const { requireAuth, redirectIfAuthenticated, verifyPassword, checkRateLimit, resetRateLimit } = require('../middleware/auth');
const dbService = require('../database/service');

// Admin login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('admin/login', {
    title: 'Admin Login - कला',
    layout: 'layouts/admin',
    error: null,
    success: null
  });
});

// Admin login POST
router.post('/login', redirectIfAuthenticated, async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    // Input validation
    if (!username || !password) {
      return res.render('admin/login', {
        title: 'Admin Login - कला',
        layout: 'layouts/admin',
        error: 'Username and password are required',
        success: null
      });
    }

    // Rate limiting
    try {
      checkRateLimit(clientIP);
    } catch (rateLimitError) {
      return res.render('admin/login', {
        title: 'Admin Login - कला',
        layout: 'layouts/admin',
        error: rateLimitError.message,
        success: null
      });
    }

    // Get admin by username
    const admin = await dbService.getAdminByUsername(username);
    if (!admin) {
      return res.render('admin/login', {
        title: 'Admin Login - कला',
        layout: 'layouts/admin',
        error: 'Invalid username or password',
        success: null
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, admin.password);
    if (!isValidPassword) {
      return res.render('admin/login', {
        title: 'Admin Login - कला',
        layout: 'layouts/admin',
        error: 'Invalid username or password',
        success: null
      });
    }

    // Reset rate limit on successful login
    resetRateLimit(clientIP);

    // Update last login
    await dbService.updateAdminLastLogin(admin.admin_id);

    // Log admin activity
    await dbService.logAdminActivity(admin.admin_id, 'login', {
      ip_address: clientIP,
      user_agent: req.get('User-Agent')
    });

    // Create session
    req.session.admin = {
      admin_id: admin.admin_id,
      username: admin.username,
      full_name: admin.full_name,
      role: admin.role
    };

    res.redirect('/admin/dashboard');

  } catch (error) {
    console.error('Login error:', error);
    res.render('admin/login', {
      title: 'Admin Login - कला',
      layout: 'layouts/admin',
      error: 'Something went wrong. Please try again.',
      success: null
    });
  }
});

// Admin dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const stats = await dbService.getDashboardStats();
    
    res.render('admin/dashboard', {
      title: 'Dashboard - कला Admin',
      layout: 'layouts/admin',
      admin: req.admin,
      stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('admin/dashboard', {
      title: 'Dashboard - कला Admin',
      layout: 'layouts/admin',
      admin: req.admin,
      stats: {
        total_artists: 0,
        total_arts: 0,
        total_sold: 0,
        total_views: 0,
        unread_messages: 0,
        pending_applications: 0,
        active_orders: 0
      }
    });
  }
});

// Admin logout
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // Log admin activity
    await dbService.logAdminActivity(req.admin.admin_id, 'logout', {
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent')
    });

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.redirect('/admin/login');
    });
  } catch (error) {
    console.error('Logout error:', error);
    req.session.destroy((err) => {
      res.redirect('/admin/login');
    });
  }
});

// Redirect /admin to appropriate page
router.get('/', (req, res) => {
  if (req.session.admin && req.session.admin.admin_id) {
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login');
  }
});

module.exports = router;
