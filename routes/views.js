const express = require('express');
const router = express.Router();
const products = require('../data/products');
const { requireAuthView } = require('../middleware/auth');

// Beranda Publik
router.get('/', (req, res) => {
  const featuredProducts = products.slice(0, 4);
  res.render('index', { featuredProducts });
});

// Katalog Produk Publik
router.get('/produk', (req, res) => {
  const { search, kategori } = req.query;
  let filtered = [...products];

  if (kategori) {
    filtered = filtered.filter(p => p.category.toLowerCase().includes(kategori.toLowerCase()));
  }
  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  res.render('produk', { 
    products: filtered, 
    currentSearch: search || '', 
    currentKategori: kategori || '' 
  });
});

// Detail Produk Publik
router.get('/produk/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  res.render('detail', { product });
});

// Halaman Tanya AI
router.get('/tanya-ai', (req, res) => {
  res.render('tanya-ai');
});

// Halaman Login Admin
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/admin/dashboard');
  res.render('login');
});

// Halaman Dashboard Admin (Wajib Login)
router.get('/admin/dashboard', requireAuthView, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

module.exports = router;