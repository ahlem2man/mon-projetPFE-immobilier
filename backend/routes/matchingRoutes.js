const express = require('express');
const router = express.Router();
const { 
  generateUserMatches, 
  getUserMatches,
  submitMatchingFeedback,
  archiveMatching,
  getMatchingHistory,
  manuallyTriggerMatching,
  debugUserData,
  debugTestAlgo,
  saveUserPreferences,
  getUserPreferences
} = require('../controllers/matchingController');
const protect = require('../middleware/auth'); 

// PREFERENCES (Important: avant les autres routes)
router.post('/save-preferences', protect, saveUserPreferences);
router.get('/preferences', protect, getUserPreferences);

// Route pour générer les matchings
router.post('/generate', protect, generateUserMatches);

// Route pour récupérer les matchings actifs
router.get('/', protect, getUserMatches);

// Route pour obtenir l'historique complet
router.get('/history', protect, getMatchingHistory);

// Route pour soumettre un retour sur un matching
router.post('/:matchingId/feedback', protect, submitMatchingFeedback);

// Route pour archiver un matching
router.post('/:matchingId/archive', protect, archiveMatching);

// Route pour déclencher manuellement le matching (admin)
router.post('/admin/manual-trigger', protect, manuallyTriggerMatching);

// DEBUG ROUTES
router.get('/debug/user-data', protect, debugUserData);
router.post('/debug/test-algo', protect, debugTestAlgo);

module.exports = router;