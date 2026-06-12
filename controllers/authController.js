const { User } = require('../models');

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login', layout: 'layouts/auth' });
};

exports.postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username, isActive: true } });

    if (!user || !(await user.validatePassword(password))) {
      req.flash('error', 'Invalid username or password');
      return res.redirect('/login');
    }

    req.session.userId = user.id;
    req.session.user = { id: user.id, username: user.username, fullName: user.fullName, role: user.role };
    req.flash('success', `Welcome back, ${user.fullName || user.username}!`);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};
