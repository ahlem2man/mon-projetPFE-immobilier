const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const protect = require('../middleware/auth');
const tenantController = require('../controllers/tenantController');

// ========== PROFIL LOCATAIRE ==========
router.get('/me', protect, tenantController.getTenantProfile);
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

module.exports = router;

module.exports = router;