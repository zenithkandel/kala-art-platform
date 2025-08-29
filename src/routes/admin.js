const express = require('express');
const router = express.Router();
const dbService = require('../database/service');
const { requireAdminAuth, rateLimitLogin } = require('../middleware/adminAuth');

// GET /admin - Dashboard placeholder
router.get('/', requireAdminAuth, async (req, res) => {
    // Placeholder dashboard data; wire real stats later using dbService methods
    res.render('admin/dashboard', { title: 'Dashboard' });
});

// GET /admin/login - Render login page
router.get('/login', (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin');
    }
    res.render('admin/login', { title: 'Admin Login', error: null, layout: false });
});

// POST /admin/login - Handle login
router.post('/login', rateLimitLogin, async (req, res) => {
    try {
        const { username, password } = req.body;
        const verified = await dbService.verifyAdminPassword(username, password);
        if (!verified) {
            return res.render('admin/login', { title: 'Admin Login', error: 'Invalid credentials', layout: false });
        }

        req.session.admin = { id: verified.admin_id, username: verified.username };
        return res.redirect('/admin');
    } catch (err) {
        console.error('Admin login error:', err);
        return res.status(500).render('admin/login', { title: 'Admin Login', error: 'Server error. Please try again.', layout: false });
    }
});

// POST /admin/logout - Handle logout
router.post('/logout', requireAdminAuth, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/admin');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

module.exports = router;
