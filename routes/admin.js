const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const adminController = require('../controllers/adminController');
const priestController = require('../controllers/priestController');
const dioceseController = require('../controllers/dioceseController');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Dioceses
router.get('/dioceses', dioceseController.index);
router.get('/dioceses/print', dioceseController.print);
router.get('/dioceses/create', dioceseController.getCreate);
router.post('/dioceses/create', dioceseController.postCreate);
router.get('/dioceses/:id/edit', dioceseController.getEdit);
router.post('/dioceses/:id/edit', dioceseController.postEdit);
router.post('/dioceses/:id/delete', dioceseController.delete);

// Priests - multi-step form
router.get('/priests', priestController.index);
router.get('/priests/step1', priestController.getStep1);
router.post('/priests/step1', upload.single('photo'), priestController.postStep1);
router.get('/priests/step2', priestController.getStep2);
router.post('/priests/step2', priestController.postStep2);
router.get('/priests/step3', priestController.getStep3);
router.post('/priests/step3', priestController.postStep3);
router.get('/priests/step4', priestController.getStep4);
router.post('/priests/step4', priestController.postStep4);
router.get('/priests/step5', priestController.getStep5);
router.post('/priests/step5', priestController.postStep5);

// Priests - CRUD
router.get('/priests/:id/view', priestController.view);
router.get('/priests/:id/print', priestController.print);
router.get('/priests/:id/edit', priestController.edit);
router.post('/priests/:id/delete', priestController.delete);
router.post('/priests/:id/status', priestController.updateStatus);

// API
router.get('/api/cities/:country', priestController.getCities);

module.exports = router;
