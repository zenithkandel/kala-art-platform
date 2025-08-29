const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const databaseService = require('../services/databaseService');
const { requireAdminAuth, rateLimitLogin } = require('../middleware/adminAuth');

// Admin login page
router.get('/login', (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { 
    title: 'Admin Login',
    error: req.session.error || null 
  });
  delete req.session.error;
});

// Admin login handler
router.post('/login', rateLimitLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      req.session.error = 'Username and password are required';
      return res.redirect('/admin/login');
    }

    const admin = await databaseService.getAdminByUsername(username);
    
    if (!admin) {
      req.session.error = 'Invalid credentials';
      return res.redirect('/admin/login');
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      req.session.error = 'Invalid credentials';
      return res.redirect('/admin/login');
    }

    // Set admin session
    req.session.admin = {
      id: admin.id,
      username: admin.username
    };

    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Admin login error:', error);
    req.session.error = 'An error occurred during login';
    res.redirect('/admin/login');
  }
});

// Admin logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect('/admin/login');
  });
});

// Dashboard (protected)
router.get('/dashboard', requireAdminAuth, async (req, res) => {
  try {
    // Get dashboard statistics
    const stats = await databaseService.getDashboardStats();
    
    res.render('admin/dashboard', { 
      title: 'Admin Dashboard',
      admin: req.session.admin,
      stats: stats || {
        totalArts: 0,
        totalArtists: 0,
        totalOrders: 0,
        totalSales: 0,
        totalApplications: 0,
        totalMessages: 0
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('admin/error', { 
      title: 'Error',
      error: 'Failed to load dashboard data'
    });
  }
});

// Arts Management Routes
router.get('/arts', requireAdminAuth, async (req, res) => {
  try {
    const arts = await databaseService.getAllArts();
    res.render('admin/arts', { 
      title: 'Arts Management',
      admin: req.session.admin,
      arts: arts || []
    });
  } catch (error) {
    console.error('Arts management error:', error);
    res.render('admin/error', { 
      title: 'Error',
      error: 'Failed to load arts data'
    });
  }
});

// Artists Management Routes
router.get('/artists', requireAdminAuth, async (req, res) => {
  try {
    const artists = await databaseService.getAllArtists();
    res.render('admin/artists', { 
      title: 'Artists Management',
      admin: req.session.admin,
      artists: artists || []
    });
  } catch (error) {
    console.error('Artists management error:', error);
    res.render('admin/error', { 
      title: 'Error',
      error: 'Failed to load artists data'
    });
  }
});

// Orders Management Routes
router.get('/orders', requireAdminAuth, async (req, res) => {
  try {
    const orders = await databaseService.getAllOrders();
    res.render('admin/orders', { 
      title: 'Orders Management',
      admin: req.session.admin,
      orders: orders || []
    });
  } catch (error) {
    console.error('Orders management error:', error);
    res.render('admin/error', { 
      title: 'Error',
      error: 'Failed to load orders data'
    });
  }
});

// Sales Management Routes
router.get('/sales', requireAdminAuth, async (req, res) => {
  try {
    const sales = await databaseService.getAllSales();
    res.render('admin/sales', { 
      title: 'Sales Management',
      admin: req.session.admin,
      sales: sales || []
    });
  } catch (error) {
    console.error('Sales management error:', error);
    res.render('admin/error', { 
      title: 'Error',
      error: 'Failed to load sales data'
    });
  }
});

// Applications Management Routes
router.get('/applications', requireAdminAuth, async (req, res) => {
  try {
    const applications = await databaseService.getAllApplications();
    res.render('admin/applications', { 
      title: 'Applications Management',
      admin: req.session.admin,
      applications: applications || []
    });
  } catch (error) {
    console.error('Applications management error:', error);
    res.render('admin/error', { 
      title: 'Error',
      error: 'Failed to load applications data'
    });
  }
});

// Upload Management Routes
router.get('/uploads', requireAdminAuth, async (req, res) => {
  try {
    const uploads = await databaseService.getAllUploads();
    res.render('admin/uploads', { 
      title: 'Upload Management',
      admin: req.session.admin,
      uploads: uploads || []
    });
  } catch (error) {
    console.error('Upload management error:', error);
    res.render('admin/error', { 
      title: 'Error',
      error: 'Failed to load upload data'
    });
  }
});

// Messages Management Routes
router.get('/messages', requireAdminAuth, async (req, res) => {
  try {
    const messages = await databaseService.getAllMessages();
    res.render('admin/messages', { 
      title: 'Messages Management',
      admin: req.session.admin,
      messages: messages || []
    });
  } catch (error) {
    console.error('Messages management error:', error);
    res.render('admin/error', { 
      title: 'Error',
      error: 'Failed to load messages data'
    });
  }
});

// API Routes for AJAX operations
router.get('/api/stats', requireAdminAuth, async (req, res) => {
  try {
    const stats = await databaseService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Stats API error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Error handling for admin routes
router.use((err, req, res, next) => {
  console.error('Admin route error:', err);
  res.status(500).render('admin/error', {
    title: 'Error',
    error: 'An unexpected error occurred'
  });
});

module.exports = router;
