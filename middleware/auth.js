exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  req.flash('error', 'Please login to access this page');
  res.redirect('/login');
};

exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') return next();
  req.flash('error', 'Access denied');
  res.redirect('/admin/dashboard');
};
