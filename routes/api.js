const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
let products = require('../data/products');
const users = require('../data/users');
const { requireAuthApi } = require('../middleware/auth');

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------

// POST /api/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: "error", message: "Username dan password wajib diisi!" });
  }

  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ status: "error", message: "Username atau password salah!" });
  }

  // Simpan sesi login
  req.session.user = { id: user.id, username: user.username };
  return res.json({ status: "success", message: "Login berhasil!", data: req.session.user });
});

// POST /api/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ status: "error", message: "Gagal logout!" });
    }
    res.clearCookie('connect.sid');
    return res.json({ status: "success", message: "Berhasil logout!" });
  });
});

// -------------------------------------------------------------
// CRUD PRODUK ENDPOINTS
// -------------------------------------------------------------

// GET /api/products (Publik)
router.get('/products', (req, res) => {
  const { search, kategori } = req.query;
  let filtered = [...products];

  if (kategori) {
    filtered = filtered.filter(p => p.category.toLowerCase().includes(kategori.toLowerCase()));
  }

  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }

  res.json({ status: "success", data: filtered });
});

// GET /api/products/:id (Publik)
router.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ status: "error", message: "Produk tidak ditemukan!" });
  }

  res.json({ status: "success", data: product });
});

// POST /api/products (Wajib Login)
router.post('/products', requireAuthApi, (req, res) => {
  const { name, category, price, stock, description, image } = req.body;

  if (!name || !category || !price || stock === undefined) {
    return res.status(400).json({ status: "error", message: "Semua field utama wajib diisi!" });
  }

  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name,
    category,
    price: Number(price),
    stock: Number(stock),
    description: description || "",
    image: image || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80"
  };

  products.push(newProduct);
  res.status(201).json({ status: "success", message: "Produk berhasil ditambahkan!", data: newProduct });
});

// PUT /api/products/:id (Wajib Login)
router.put('/products/:id', requireAuthApi, (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ status: "error", message: "Produk tidak ditemukan!" });
  }

  const { name, category, price, stock, description, image } = req.body;

  products[index] = {
    ...products[index],
    name: name || products[index].name,
    category: category || products[index].category,
    price: price !== undefined ? Number(price) : products[index].price,
    stock: stock !== undefined ? Number(stock) : products[index].stock,
    description: description !== undefined ? description : products[index].description,
    image: image || products[index].image
  };

  res.json({ status: "success", message: "Produk berhasil diupdate!", data: products[index] });
});

// DELETE /api/products/:id (Wajib Login)
router.delete('/products/:id', requireAuthApi, (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ status: "error", message: "Produk tidak ditemukan!" });
  }

  const deleted = products.splice(index, 1);
  res.json({ status: "success", message: "Produk berhasil dihapus!", data: deleted[0] });
});

// -------------------------------------------------------------
// CHAT AI ENDPOINT (Simulasi Dummy Backend)
// -------------------------------------------------------------

// POST /api/chat
router.post('/chat', (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ status: "error", message: "Pesan tidak boleh kosong!" });
  }

  const msgLower = message.toLowerCase();
  let reply = "Maaf, saya tidak mengerti pertanyaan Anda. Coba tanyakan tentang jam buka, ongkir, stok, atau cara pembayaran.";

  if (msgLower.includes("jam") || msgLower.includes("buka") || msgLower.includes("tutup")) {
    reply = "Toko Ariesta buka setiap hari Senin - Minggu dari jam 07.00 sampai 20.00 WIB.";
  } else if (msgLower.includes("ongkir") || msgLower.includes("kirim") || msgLower.includes("antar")) {
    reply = "Gratis ongkir untuk pengiriman area terdekat dengan minimal pembelian Rp 50.000!";
  } else if (msgLower.includes("bayar") || msgLower.includes("pembayaran")) {
    reply = "Kami menerima pembayaran Tunai (COD), Transfer Bank, dan QRIS.";
  } else if (msgLower.includes("stok") || msgLower.includes("ada")) {
    reply = "Stok produk selalu kami perbarui secara real-time. Silakan cek menu Daftar Produk ya!";
  }

  res.json({ status: "success", reply });
});

module.exports = router;