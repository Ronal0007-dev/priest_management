const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passwordController = require('../controllers/passwordController');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

// Forgot password flow (public - no auth required)
router.get('/forgot-password', passwordController.getForgotStep1);
router.post('/forgot-password', passwordController.postForgotStep1);
router.get('/forgot-password/verify', passwordController.getForgotStep2);
router.post('/forgot-password/verify', passwordController.postForgotStep2);
router.get('/forgot-password/reset', passwordController.getForgotStep3);
router.post('/forgot-password/reset', passwordController.postForgotStep3);

module.exports = router;
