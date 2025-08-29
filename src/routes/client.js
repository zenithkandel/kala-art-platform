const express = require('express');
const router = express.Router();

// In this initial client scaffold, we'll render EJS pages. Data will be wired later.

router.get('/', (req, res) => {
  res.render('client/home', { title: 'Home' });
});

router.get('/about', (req, res) => {
  res.render('client/about', { title: 'About' });
});

router.get('/register', (req, res) => {
  res.render('client/register', { title: 'Register as Artist' });
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
