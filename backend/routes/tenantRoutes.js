const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, restrictTo } = require('../middleware/auth');
const tenantController = require('../controllers/tenantController');
const { getAllAgencies, submitDossierToAgencies, getMyDossierSubmissions, getReceivedDossiers, markDossierAsViewed, respondToDossier } = require('../controllers/dossierSubmissionController');
const { getTenantPayments, initiatePayment, confirmPayment } = require('../controllers/paymentController');

// ========== ROUTES AGENCE ==========
router.get('/files/all', protect, restrictTo('agency'), tenantController.getAllTenantFiles);
router.patch('/file/:tenantId/status', protect, restrictTo('agency'), tenantController.updateFileStatus);
router.post('/file/:tenantId/note', protect, restrictTo('agency'), tenantController.addFileNote);

// ========== PROFIL LOCATAIRE ==========
router.get('/me', protect, tenantController.getTenantProfile);
router.get('/profile/:userId', protect, tenantController.getTenantProfileByUserId);
router.put('/profile', protect, tenantController.updateProfile);
router.put('/update', protect, tenantController.updateProfileFallback);

// ========== DOCUMENTS ==========
router.post('/upload-docs', protect, upload.fields([
  { name: 'identityCard', maxCount: 1 },
  { name: 'taxNotice', maxCount: 1 },
  { name: 'lastThreePayslips', maxCount: 1 },
  { name: 'employmentContract', maxCount: 1 },
  { name: 'employerAttestation', maxCount: 1 },
  { name: 'rentalReceipts', maxCount: 1 },
  { name: 'propertyTax', maxCount: 1 },
  { name: 'accommodationAttestation', maxCount: 1 },
  { name: 'utilityBill', maxCount: 1 }
]), tenantController.uploadDocuments);

//  Upload d'un seul document
router.post('/upload-doc/:docType', protect, upload.single('file'), tenantController.uploadSingleDocument);

// Supprimer un document
router.delete('/delete-doc/:docType', protect, tenantController.deleteDocument);

// ========== RECHERCHES SAUVEGARDÉES ==========
router.post('/save-search', protect, tenantController.saveSearch);
router.get('/search/:searchId', protect, tenantController.getSearch);
router.put('/update-search/:searchId', protect, tenantController.updateSearch);
router.delete('/delete-search/:searchId', protect, tenantController.deleteSearch);

// ========== FAVORIS ==========
router.get('/favorites', protect, tenantController.getFavorites);
router.post('/favorites/:propertyId', protect, tenantController.addFavorite);
router.delete('/favorites/:propertyId', protect, tenantController.removeFavorite);
router.get('/favorites/check/:propertyId', protect, tenantController.checkFavorite);

// ========== PAIEMENTS ==========
router.get('/payments', protect, getTenantPayments);
router.post('/payments/initiate', protect, initiatePayment);
router.patch('/payments/:paymentId/confirm', protect, confirmPayment);

// ========== ENVOI DOSSIER AUX AGENCES ==========
router.get('/agencies', protect, getAllAgencies);
router.post('/submit-dossier', protect, restrictTo('tenant'), submitDossierToAgencies);
router.get('/dossier-submissions', protect, restrictTo('tenant'), getMyDossierSubmissions);
router.get('/received-dossiers', protect, restrictTo('agency'), getReceivedDossiers);
router.patch('/dossier-submission/:submissionId/viewed', protect, restrictTo('agency'), markDossierAsViewed);
router.patch('/dossier-submission/:submissionId/respond', protect, restrictTo('agency'), respondToDossier);

module.exports = router;