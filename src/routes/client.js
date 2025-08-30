const express = require('express');
const router = express.Router();
const dbService = require('../database/service');

// In this initial client scaffold, we'll render EJS pages. Data will be wired later.

router.get('/', async (req, res) => {
  try {
    // Get dashboard statistics for homepage
    const stats = await dbService.getDashboardStats();
    
    res.render('client/home', { 
      title: 'Home',
      stats: stats
    });
  } catch (error) {
    console.error('Error loading homepage stats:', error);
    
    // Render with default stats if there's an error
    res.render('client/home', { 
      title: 'Home',
      stats: {
        total_views: 0,
        total_arts: 0,
        total_sold: 0,
        total_artists: 0
      }
    });
  }
});

router.get('/about', (req, res) => {
  res.render('client/about', { title: 'About' });
});

router.get('/register', (req, res) => {
  res.render('client/register', { 
    title: 'Register as Artist',
    success: req.query.success,
    error: req.query.error
  });
});

// POST /register - Handle artist registration form
router.post('/register', async (req, res) => {
  try {
    const {
      full_name,
      age,
      started_art_since,
      school,
      location,
      contact_email,
      contact_phone,
      instagram,
      extra_message
    } = req.body;
    
    // Basic validation
    if (!full_name || !age) {
      return res.redirect('/register?error=' + encodeURIComponent('Name and age are required'));
    }
    
    // Create application
    const applicationId = await dbService.createArtistApplication({
      full_name,
      age: parseInt(age),
      started_art_since: started_art_since ? parseInt(started_art_since) : null,
      school,
      location,
      contact_email,
      contact_phone,
      instagram,
      extra_message
    });
    
    res.redirect('/register?success=' + encodeURIComponent('Application submitted successfully! We will contact you within 48 hours.'));
    
  } catch (error) {
    console.error('Artist registration error:', error);
    res.redirect('/register?error=' + encodeURIComponent('An error occurred while submitting your application. Please try again.'));
  }
});

router.get('/artists', (req, res) => {
  res.render('client/artists', { title: 'Artists' });
});

router.get('/artist/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  res.render('client/artist_profile', { title: 'Artist Profile', slugOrId });
});

router.get('/cart', (req, res) => {
  res.render('client/cart', { title: 'Your Cart' });
});

router.get('/art/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  res.render('client/art_detail', { title: 'Artwork Detail', slugOrId });
});

module.exports = router;
