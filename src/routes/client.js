const express = require('express');
const router = express.Router();
const dbService = require('../database/service');

// In this initial client scaffold, we'll render EJS pages. Data will be wired later.

router.get('/', async (req, res) => {
  try {
    // Get homepage statistics (including daily views instead of total)
    const stats = await dbService.getHomepageStats();
    
    // Get featured artworks for homepage
    const featuredArts = await dbService.getArts({ status: 'listed', limit: 12 });
    
    res.render('client/home', { 
      title: 'Home',
      stats: stats,
      featuredArts: featuredArts || []
    });
  } catch (error) {
    console.error('Error loading homepage:', error);
    
    // Render with default stats if there's an error
    res.render('client/home', { 
      title: 'Home',
      stats: {
        daily_views: 0,
        total_arts: 0,
        total_sold: 0,
        total_artists: 0
      },
      featuredArts: []
    });
  }
});

router.get('/about', (req, res) => {
  res.render('client/about', { 
    title: 'About',
    success: req.query.success,
    error: req.query.error
  });
});

// POST /about - Handle contact form submission
router.post('/about', async (req, res) => {
  try {
    const { full_name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!full_name || !email || !message) {
      return res.redirect('/about?error=Please fill in all required fields');
    }
    
    // Save message to database
    await dbService.createContactMessage({
      full_name,
      email,
      phone: phone || null,
      subject: subject || 'Contact from website',
      message
    });
    
    console.log(`📧 New contact message from ${full_name} (${email})`);
    
    res.redirect('/about?success=Message sent successfully! We will get back to you soon.');
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.redirect('/about?error=Sorry, there was an error sending your message. Please try again.');
  }
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

// API endpoint to get artworks for AJAX loading
router.get('/api/artworks', async (req, res) => {
  try {
    const artworks = await dbService.getArts({ status: 'listed', limit: 50 });
    
    // Transform data for frontend
    const transformedArtworks = artworks.map(art => ({
      art_id: art.art_id,
      id: art.art_id, // For backward compatibility
      title: art.title,
      type: art.style, // Map style to type for frontend compatibility
      style: art.style,
      price: art.price,
      date: art.created_at,
      artist: art.artist_name,
      artist_name: art.artist_name,
      image_thumb: art.image_thumb || art.primary_image
    }));
    
    res.json(transformedArtworks);
  } catch (error) {
    console.error('Error fetching artworks API:', error);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// API endpoint to get artists for AJAX loading
router.get('/api/artists', async (req, res) => {
  try {
    const { sort = 'name' } = req.query;
    let artists = await dbService.getArtists();
    
    // Get artwork count for each artist
    const enrichedArtists = await Promise.all(
      artists.map(async (artist) => {
        try {
          const artworks = await dbService.getArts({ artist_id: artist.artist_id });
          const artworkCount = artworks.length;
          const soldCount = artworks.filter(art => art.status === 'sold').length;
          
          return {
            artist_id: artist.artist_id,
            id: artist.artist_id, // For backward compatibility
            name: artist.full_name,
            full_name: artist.full_name,
            specialty: artist.specialty,
            age: artist.age,
            bio: artist.bio,
            profile_picture: artist.profile_picture,
            instagram: artist.instagram,
            slug: artist.slug,
            artwork_count: artworkCount,
            sold_count: soldCount,
            created_at: artist.created_at
          };
        } catch (error) {
          console.error(`Error fetching artwork count for artist ${artist.artist_id}:`, error);
          return {
            ...artist,
            name: artist.full_name,
            artwork_count: 0,
            sold_count: 0
          };
        }
      })
    );
    
    // Sort artists based on query parameter
    if (sort === 'artworks') {
      enrichedArtists.sort((a, b) => b.artwork_count - a.artwork_count);
    } else if (sort === 'sales') {
      enrichedArtists.sort((a, b) => b.sold_count - a.sold_count);
    } else {
      enrichedArtists.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }
    
    res.json(enrichedArtists);
  } catch (error) {
    console.error('Error fetching artists API:', error);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

module.exports = router;
