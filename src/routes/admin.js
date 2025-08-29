const express = require('express');
const router = express.Router();
const dbService = require('../database/service');
const { requireAuth, redirectIfAuth, rateLimitLogin, resetLoginAttempts } = require('../middleware/auth');

// ============= ROOT ADMIN ROUTE =============

// GET /admin/ - Redirect to appropriate page
router.get('/', (req, res) => {
  if (req.session.admin) {
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login');
  }
});

// ============= LOGIN ROUTES =============

// GET /admin/login - Show login form
router.get('/login', redirectIfAuth, (req, res) => {
  res.render('admin/login', {
    title: 'Admin Login - कला',
    error: req.query.error,
    layout: false
  });
});

// POST /admin/login - Process login
router.post('/login', redirectIfAuth, rateLimitLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.render('admin/login', {
        title: 'Admin Login - कला',
        error: 'Username and password are required',
        layout: false
      });
    }
    
    const admin = await dbService.verifyAdminPassword(username, password);
    
    if (!admin) {
      return res.render('admin/login', {
        title: 'Admin Login - कला',
        error: 'Invalid username or password',
        layout: false
      });
    }
    
    // Create session
    req.session.admin = {
      admin_id: admin.admin_id,
      username: admin.username,
      loginTime: new Date()
    };
    
    // Reset login attempts on success
    resetLoginAttempts(req);
    
    // Redirect to dashboard on successful login
    res.redirect('/admin/dashboard');
    
  } catch (error) {
    console.error('Login error:', error);
    res.render('admin/login', {
      title: 'Admin Login - कला',
      error: 'An error occurred during login',
      layout: false
    });
  }
});

// POST /admin/logout - Logout
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error during logout'
      });
    }
    
    res.json({
      success: true,
      message: 'Logout successful',
      redirect: '/admin/login'
    });
  });
});

// ============= DASHBOARD ROUTES =============

// GET /admin/dashboard - Main dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const stats = await dbService.getDashboardStats();
    
    res.render('admin/dashboard', {
      title: 'Dashboard - कला Admin',
      stats,
      recentApplications: stats.recentApplications || [],
      layout: false
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('admin/error', {
      title: 'Error - कला Admin',
      message: 'Failed to load dashboard data',
      layout: false
    });
  }
});

// ============= ARTIST MANAGEMENT ROUTES =============

// GET /admin/artists - List all artists
router.get('/artists', requireAuth, async (req, res) => {
  try {
    const artists = await dbService.getArtists();
    
    res.render('admin/artists/list', {
      title: 'Artists - कला Admin',
      artists,
      layout: false
    });
  } catch (error) {
    console.error('Artists list error:', error);
    res.status(500).render('admin/error', {
      title: 'Error - कला Admin',
      message: 'Failed to load artists',
      layout: false
    });
  }
});

// GET /admin/artists/applications - List artist applications
router.get('/artists/applications', requireAuth, async (req, res) => {
  try {
    const applications = await dbService.getArtistApplications();
    
    res.render('admin/artists/applications', {
      title: 'Artist Applications - कला Admin',
      applications,
      layout: false
    });
  } catch (error) {
    console.error('Applications list error:', error);
    res.status(500).render('admin/error', {
      title: 'Error - कला Admin',
      message: 'Failed to load applications',
      layout: false
    });
  }
});

// GET /admin/applications - Shortcut to artist applications (for sidebar link)
router.get('/applications', requireAuth, async (req, res) => {
  try {
    const applications = await dbService.getArtistApplications();
    
    res.render('admin/applications', {
      title: 'Artist Applications - कला Admin',
      applications,
      layout: false
    });
  } catch (error) {
    console.error('Applications list error:', error);
    res.status(500).render('admin/error', {
      title: 'Error - कला Admin',
      message: 'Failed to load applications',
      layout: false
    });
  }
});

// POST /admin/artists/applications/:id/approve - Approve application
router.post('/artists/applications/:id/approve', requireAuth, async (req, res) => {
  try {
    const applicationId = req.params.id;
    await dbService.updateApplicationStatus(applicationId, 'approved');
    
    res.json({
      success: true,
      message: 'Application approved successfully'
    });
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve application'
    });
  }
});

// POST /admin/artists/applications/:id/reject - Reject application
router.post('/artists/applications/:id/reject', requireAuth, async (req, res) => {
  try {
    const applicationId = req.params.id;
    await dbService.updateApplicationStatus(applicationId, 'rejected');
    
    res.json({
      success: true,
      message: 'Application rejected'
    });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject application'
    });
  }
});

// ============= ARTWORK MANAGEMENT ROUTES =============

// GET /admin/artworks - List all artworks
router.get('/artworks', requireAuth, async (req, res) => {
  try {
    const artworks = await dbService.getArts();
    
    res.render('admin/artworks/list', {
      title: 'Artworks - कला Admin',
      artworks,
      layout: false
    });
  } catch (error) {
    console.error('Artworks list error:', error);
    res.status(500).render('admin/error', {
      title: 'Error - कला Admin',
      message: 'Failed to load artworks',
      layout: false
    });
  }
});

// ============= ORDER MANAGEMENT ROUTES =============

// GET /admin/orders - List all orders
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const orders = await dbService.getOrders();
    
    res.render('admin/orders/list', {
      title: 'Orders - कला Admin',
      orders,
      layout: false
    });
  } catch (error) {
    console.error('Orders list error:', error);
    res.status(500).render('admin/error', {
      title: 'Error - कला Admin',
      message: 'Failed to load orders',
      layout: false
    });
  }
});

// GET /admin/orders/:id - View order details
router.get('/orders/:id', requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await dbService.getOrderById(orderId);
    const orderItems = await dbService.getOrderItems(orderId);
    
    if (!order) {
      return res.status(404).render('admin/error', {
        title: 'Order Not Found - कला Admin',
        message: 'Order not found',
        layout: false
      });
    }
    
    res.render('admin/orders/detail', {
      title: `Order ${order.order_code} - कला Admin`,
      order,
      orderItems,
      layout: false
    });
  } catch (error) {
    console.error('Order detail error:', error);
    res.status(500).render('admin/error', {
      title: 'Error - कला Admin',
      message: 'Failed to load order details',
      layout: false
    });
  }
});

// POST /admin/orders/:id/status - Update order status
router.post('/orders/:id/status', requireAuth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    const validStatuses = ['received', 'viewed', 'contacted', 'delivering', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    await dbService.updateOrderStatus(orderId, status);
    
    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// ============= CONTACT MESSAGE ROUTES =============

// GET /admin/messages - List contact messages
router.get('/messages', requireAuth, async (req, res) => {
  try {
    const messages = await dbService.getContactMessages();
    
    res.render('admin/messages/list', {
      title: 'Contact Messages - कला Admin',
      messages,
      layout: false
    });
  } catch (error) {
    console.error('Messages list error:', error);
    res.status(500).render('admin/error', {
      title: 'Error - कला Admin',
      message: 'Failed to load messages',
      layout: false
    });
  }
});

// POST /admin/messages/:id/read - Mark message as read
router.post('/messages/:id/read', requireAuth, async (req, res) => {
  try {
    const messageId = req.params.id;
    await dbService.markMessageAsRead(messageId);
    
    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

// ============= API ROUTES =============

// GET /admin/api/stats - Dashboard stats API
router.get('/api/stats', requireAuth, async (req, res) => {
  try {
    const stats = await dbService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Stats API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
});

// Admin Orders Page
router.get('/orders', requireAuth, async (req, res) => {
    try {
        const orders = await dbService.getAllOrders();
        res.render('admin/orders', { orders });
    } catch (error) {
        console.error('Error loading orders:', error);
        res.render('admin/orders', { orders: [] });
    }
});

// Admin Analytics Page
router.get('/analytics', requireAuth, async (req, res) => {
    try {
        const analytics = await dbService.getAnalyticsData();
        res.render('admin/analytics', { analytics });
    } catch (error) {
        console.error('Error loading analytics:', error);
        res.render('admin/analytics', { 
            analytics: {
                totalViews: 0,
                totalArtists: 0,
                totalArtworks: 0,
                totalOrders: 0,
                topArtists: [],
                recentActivity: []
            }
        });
    }
});

module.exports = router;
