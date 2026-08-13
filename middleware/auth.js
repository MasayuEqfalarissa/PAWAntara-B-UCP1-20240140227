// Protection untuk Halaman Web (Redirect)
const requireAuthView = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
};

// Protection untuk REST API
const requireAuthApi = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({
    status: "error",
    message: "Akses ditolak. Silakan login terlebih dahulu!"
  });
};

module.exports = { requireAuthView, requireAuthApi };