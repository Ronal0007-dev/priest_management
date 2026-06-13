const { User } = require('../models');
const bcrypt = require('bcryptjs');

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your primary school?",
  "What is the name of your childhood best friend?",
  "What was your childhood nickname?",
  "What is the middle name of your oldest sibling?",
  "What street did you grow up on?",
  "What was the make of your first car?",
  "What is the name of the hospital where you were born?"
];

// ── CHANGE PASSWORD (logged-in admin) ──────────────────────────

exports.getChangePassword = (req, res) => {
  res.render('admin/change-password', {
    title: 'Change Password',
    layout: 'layouts/main'
  });
};

exports.postChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findByPk(req.session.userId);

    if (!user) {
      req.flash('error', 'Session expired. Please login again.');
      return res.redirect('/login');
    }

    if (!(await user.validatePassword(currentPassword))) {
      req.flash('error', 'Current password is incorrect.');
      return res.redirect('/admin/change-password');
    }

    if (newPassword.length < 6) {
      req.flash('error', 'New password must be at least 6 characters.');
      return res.redirect('/admin/change-password');
    }

    if (newPassword !== confirmPassword) {
      req.flash('error', 'New passwords do not match.');
      return res.redirect('/admin/change-password');
    }

    if (await user.validatePassword(newPassword)) {
      req.flash('error', 'New password must be different from your current password.');
      return res.redirect('/admin/change-password');
    }

    await user.update({ password: newPassword });
    req.flash('success', 'Password changed successfully.');
    res.redirect('/admin/change-password');
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/admin/change-password');
  }
};

// ── SECURITY QUESTION SETUP (logged-in admin) ──────────────────

exports.getSecuritySetup = (req, res) => {
  res.render('admin/security-setup', {
    title: 'Security Question Setup',
    layout: 'layouts/main',
    questions: SECURITY_QUESTIONS
  });
};

exports.postSecuritySetup = async (req, res) => {
  try {
    const { securityQuestion, securityAnswer, confirmAnswer } = req.body;
    const user = await User.findByPk(req.session.userId);

    if (!securityQuestion || !securityAnswer) {
      req.flash('error', 'Please select a question and provide an answer.');
      return res.redirect('/admin/security-setup');
    }

    if (securityAnswer.trim().toLowerCase() !== confirmAnswer.trim().toLowerCase()) {
      req.flash('error', 'Security answers do not match.');
      return res.redirect('/admin/security-setup');
    }

    if (securityAnswer.trim().length < 2) {
      req.flash('error', 'Security answer is too short.');
      return res.redirect('/admin/security-setup');
    }

    await user.update({ securityQuestion, securityAnswer });
    req.flash('success', 'Security question saved successfully.');
    res.redirect('/admin/security-setup');
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/admin/security-setup');
  }
};

// ── FORGOT PASSWORD FLOW (not logged in) ───────────────────────

// Step 1: Enter username
exports.getForgotStep1 = (req, res) => {
  res.render('auth/forgot-step1', {
    title: 'Forgot Password',
    layout: 'layouts/auth'
  });
};

exports.postForgotStep1 = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ where: { username, isActive: true } });

    if (!user || !user.securityQuestion) {
      req.flash('error', !user
        ? 'No account found with that username.'
        : 'No security question set for this account. Contact your system administrator.');
      return res.redirect('/forgot-password');
    }

    // Store username in session temporarily
    req.session.resetUsername = username;
    res.redirect('/forgot-password/verify');
  } catch (err) {
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/forgot-password');
  }
};

// Step 2: Answer security question
exports.getForgotStep2 = async (req, res) => {
  if (!req.session.resetUsername) return res.redirect('/forgot-password');

  const user = await User.findOne({ where: { username: req.session.resetUsername } });
  if (!user) return res.redirect('/forgot-password');

  res.render('auth/forgot-step2', {
    title: 'Verify Identity',
    layout: 'layouts/auth',
    question: user.securityQuestion,
    username: user.username
  });
};

exports.postForgotStep2 = async (req, res) => {
  try {
    if (!req.session.resetUsername) return res.redirect('/forgot-password');

    const { answer } = req.body;
    const user = await User.findOne({ where: { username: req.session.resetUsername } });

    if (!user || !(await user.validateSecurityAnswer(answer))) {
      req.flash('error', 'Incorrect answer. Please try again.');
      return res.redirect('/forgot-password/verify');
    }

    // Mark as verified — allow reset
    req.session.resetVerified = true;
    res.redirect('/forgot-password/reset');
  } catch (err) {
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/forgot-password/verify');
  }
};

// Step 3: Set new password
exports.getForgotStep3 = (req, res) => {
  if (!req.session.resetVerified || !req.session.resetUsername) {
    return res.redirect('/forgot-password');
  }
  res.render('auth/forgot-step3', {
    title: 'Reset Password',
    layout: 'layouts/auth'
  });
};

exports.postForgotStep3 = async (req, res) => {
  try {
    if (!req.session.resetVerified || !req.session.resetUsername) {
      return res.redirect('/forgot-password');
    }

    const { newPassword, confirmPassword } = req.body;

    if (newPassword.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/forgot-password/reset');
    }

    if (newPassword !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/forgot-password/reset');
    }

    const user = await User.findOne({ where: { username: req.session.resetUsername } });
    await user.update({ password: newPassword });

    // Clear reset session data
    delete req.session.resetUsername;
    delete req.session.resetVerified;

    req.flash('success', 'Password reset successfully. Please login with your new password.');
    res.redirect('/login');
  } catch (err) {
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/forgot-password/reset');
  }
};
