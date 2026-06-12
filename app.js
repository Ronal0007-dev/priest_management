require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const methodOverride = require('method-override');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Flash
app.use(flash());

// Locals middleware
app.use((req, res, next) => {
  res.locals.flash = {
    success: req.flash('success'),
    error: req.flash('error')
  };
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const { isAuthenticated } = require('./middleware/auth');

app.use('/', authRoutes);
app.use('/admin', isAuthenticated, adminRoutes);

// Root redirect
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/admin/dashboard');
  res.redirect('/login');
});

// 404
app.use((req, res) => {
  res.status(404).render('auth/login', {
    title: 'Page Not Found',
    layout: 'layouts/auth'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Priest Management System running on http://localhost:${PORT}`);
  console.log(`   Login with: admin / admin123\n`);
});

module.exports = app;
