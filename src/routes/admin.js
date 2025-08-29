const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../services/databaseService'); // Assuming you have a database service

// GET /admin - Redirect to dashboard
router.get('/', (req, res) => {
    res.send('Admin section');
});

// GET /admin/login - Render login page
router.get('/login', (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin');
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
            res.redirect('/admin');
        } else {
            res.render('admin/login', { title: 'Admin Login', error: 'Invalid credentials', layout: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST /admin/logout - Handle logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/admin');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

// Middleware to protect admin routes
const requireAdmin = (req, res, next) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }
    next();
};

// Other admin routes (arts, artists, etc.) will go here

module.exports = router;
