const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { 
  getUsers, 
  updateUserStatus, 
  getUserDetail,
  updateUser,
  deleteUser,
  bulkAction,
  getPendingProperties, 
  moderateProperty,
  getPropertyDetail,
  getPendingDocuments,
  verifyDocument,
  getGlobalStats,
  getGrowthStats
} = require('../controllers/adminController');

// Import des contrôleurs paiements
const { getAdminPayments, getRevenueStats } = require('../controllers/paymentController');

// Import des contrôleurs logs d'activité
const { 
  getActivityLogs, 
  getAdminActivityReport, 
  exportActivityLogsCSV 
} = require('../controllers/activityLogController');
// Toutes les routes ici nécessitent d'être connecté ET d'être admin
router.use(protect);
router.use(restrictTo('admin', 'superadmin'));

// Routes utilisateurs
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/bulk-action', bulkAction);

// Routes annonces
router.get('/properties/pending', getPendingProperties);
router.get('/properties/:id', getPropertyDetail);
router.patch('/properties/:id/moderate', moderateProperty);



// --- ROUTES PAIEMENTS (Sprint 11 - Étape 1) ---
router.get('/payments', getAdminPayments); // Pour voir la liste
router.get('/payments/stats', getRevenueStats); // Pour les graphiques analytics


// --- ROUTES Documents (Sprint 11 - Étape 2) ---
router.get('/documents/pending', getPendingDocuments);
router.patch('/documents/:id/verify', verifyDocument);

// --- ANALYTICS (Sprint 11 - Étape 3) ---
router.get('/stats/global', getGlobalStats);
router.get('/stats/growth', getGrowthStats);

// --- AUDIT & ACTIVITY LOGS (Sprint 11 - Étape 4) ---
router.get('/logs/activity', getActivityLogs);
router.get('/logs/report', getAdminActivityReport);
router.get('/logs/export-csv', exportActivityLogsCSV);

module.exports = router;