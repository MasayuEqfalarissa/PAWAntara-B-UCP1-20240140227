// Inisialisasi modul Express, Path, dan Data Produk
const express = require('express');
const path = require('path');
const products = require('./data/products');

const app = express();
const PORT = 3000;

// Pengaturan View Engine EJS dan Lokasi Folder Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Menyajikan File Statis (CSS, JS, Gambar) dari Folder Public
app.use(express.static(path.join(__dirname, 'public')));

// 1. Route Halaman Beranda
app.get('/', (req, res) => {
  const featuredProducts = products.slice(0, 3);
  res.render('index', { featuredProducts });
});

// 2. Route Halaman Daftar Produk dengan Filter Query Server-Side
app.get('/produk', (req, res) => {
  const { kategori, search } = req.query;
  let filteredProducts = [...products];

  if (kategori) {
    filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === kategori.toLowerCase());
  }

  if (search) {
    filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  res.render('produk', { 
    products: filteredProducts,
    currentKategori: kategori || '',
    currentSearch: search || ''
  });
});

// 3. Route Dinamis Halaman Detail Produk Berdasarkan ID
app.get('/produk/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  res.render('detail', { product });
});

// 4. Route Halaman Tanya AI
app.get('/tanya-ai', (req, res) => {
  res.render('tanya-ai');
});

// 5. REST API Read-Only Mengembalikan Data Produk Format JSON
app.get('/api/products', (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Berhasil mengambil data produk",
    data: products
  });
});

// Menjalankan Server di Port 3000
app.listen(PORT, () => {
  console.log(`Server Toko Ariesta running at http://localhost:${PORT}`);
});