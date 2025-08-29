require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const cors = require('cors');
const ejsLayouts = require('express-ejs-layouts');

const app = express();

// Basic security headers; relax CSP in dev to allow CDN assets
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

// Sessions (for cart and simple state) - MemoryStore ok for dev
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 hours
}));

// Static assets
app.use('/public', express.static(path.join(__dirname, 'public')));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('layout', 'layouts/main');

// Expose common locals
app.use((req, res, next) => {
  res.locals.appName = 'कला';
  res.locals.year = new Date().getFullYear();
  next();
});

// Routes (client only for now)
const clientRoutes = require('./src/routes/client');
app.use('/', clientRoutes);

// 404
app.use((req, res) => {
  res.status(404).render('misc/404', { title: 'Not Found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`कला client running on http://localhost:${PORT}`);
});
