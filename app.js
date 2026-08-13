const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// -------------------------------------------------------------
// 1. MIDDLEWARE CUSTOM (LOGGER)
// -------------------------------------------------------------
app.use((req, res, next) => {
  const waktu = new Date().toISOString();
  console.log(`[LOG ${waktu}] ${req.method} ${req.originalUrl}`);
  next();
});

// 2. KONFIGURASI EXPRESS SESSION
app.use(session({
  secret: process.env.SESSION_SECRET || 'rahasia-toko-ariesta-super-aman',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // Sesi berlaku 1 jam
}));

// Import Routes 
const apiRoutes = require('./routes/api');
const viewRoutes = require('./routes/views');

app.use('/api', apiRoutes);
app.use('/', viewRoutes);

app.listen(PORT, () => {
  console.log(`Server Toko Ariesta running at http://localhost:${PORT}`);
});