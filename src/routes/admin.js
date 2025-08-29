const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../services/databaseService'); // Assuming you have a database service

// GET /admin/login - Render login page
router.get('/login', (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { title: 'Admin Login', error: null, layout: false });
});

// POST /admin/login - Handle login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [admins] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);

        if (admins.length === 0) {
            return res.render('admin/login', { title: 'Admin Login', error: 'Invalid credentials', layout: false });
        }

        const admin = admins[0];
        const match = await bcrypt.compare(password, admin.password);

        if (match) {
            req.session.admin = { id: admin.admin_id, username: admin.username };
            res.redirect('/admin/dashboard');
        } else {
            res.render('admin/login', { title: 'Admin Login', error: 'Invalid credentials', layout: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Middleware to protect admin routes
const requireAdmin = (req, res, next) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }
    next();
};

// GET /admin/dashboard - Show dashboard
router.get('/dashboard', requireAdmin, async (req, res) => {
    try {
        const [[{ total_views }]] = await db.query('SELECT SUM(views) as total_views FROM page_views_daily');
        const [[{ total_arts }]] = await db.query("SELECT COUNT(*) as total_arts FROM arts WHERE status = 'listed'");
        const [[{ sold_arts }]] = await db.query("SELECT COUNT(*) as sold_arts FROM arts WHERE status = 'sold'");
        const [[{ active_artists }]] = await db.query("SELECT COUNT(*) as active_artists FROM artists WHERE status = 'active'");
        const [[{ contact_messages }]] = await db.query("SELECT COUNT(*) as contact_messages FROM contact_messages WHERE status = 'unread'");
        const [[{ buying_requests }]] = await db.query("SELECT COUNT(*) as buying_requests FROM orders WHERE status NOT IN ('delivered', 'cancelled')");
        const [[{ artist_applications }]] = await db.query("SELECT COUNT(*) as artist_applications FROM artist_applications WHERE status = 'pending'");

        res.render('admin/dashboard', {
            title: 'Dashboard',
            layout: 'admin/layout',
            stats: {
                total_views,
                total_arts,
                sold_arts,
                active_artists,
                contact_messages,
                buying_requests,
                artist_applications
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Other admin routes (arts, artists, etc.) will go here

module.exports = router;
