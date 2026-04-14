const express = require('express');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

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

// --- ROUTES POUR L'ADMIN ---
// Cette route doit être accessible par l'admin, donc on change la restriction
router.patch('/admin/verify', restrictTo('admin'), agencyController.adminVerifyAgency);

module.exports = router;