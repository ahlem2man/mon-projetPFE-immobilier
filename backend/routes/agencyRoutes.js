const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getAgencyPayments } = require('../controllers/paymentController');
const Notification = require('../models/Notification');

// --- ROUTES POUR LES AGENCES ---
// On protège tout par défaut
router.use(protect);

// Ces routes ne sont accessibles QUE par les utilisateurs avec le rôle 'agency'
router.get('/me', restrictTo('agency'), agencyController.getAgencyProfile);
router.get('/analytics/global', restrictTo('agency'), agencyController.getGlobalAnalytics);
router.put('/me', restrictTo('agency'), agencyController.updateAgencyProfile);
router.post('/upload-logo', restrictTo('agency'), upload.single('logo'), agencyController.uploadLogo);
router.post('/upload-docs', restrictTo('agency'), upload.single('file'), agencyController.uploadVerificationDocs);
router.post('/submit-verification', restrictTo('agency'), agencyController.submitForVerification);

// --- ROUTES PAIEMENTS ---
router.get('/payments', restrictTo('agency'), getAgencyPayments);

// --- ROUTES NOTIFICATIONS ---
router.get('/notifications', restrictTo('agency'), async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort('-createdAt')
      .limit(50);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/notifications/:id/read', restrictTo('agency'), async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- ROUTES POUR L'ADMIN ---
// Cette route doit être accessible par l'admin, donc on change la restriction
router.patch('/admin/verify', restrictTo('admin'), agencyController.adminVerifyAgency);

module.exports = router;