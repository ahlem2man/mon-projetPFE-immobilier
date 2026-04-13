const express = require('express');
const router = express.Router();


const { 
  getAllProperties, 
  createProperty, 
  getPropertyById, 
  toggleFavorite,
  getFavoriteProperties,
  getMyProperties,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  duplicateProperty,
  bulkDeleteProperties,
  getPropertyAnalytics
} = require('../controllers/propertyController');

const { protect: authMiddleware, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ============================================
// Routes PUBLIQUES (Tous les utilisateurs)
// ============================================
router.get('/', getAllProperties);

// ============================================
// Routes PROTÉGÉES (Authentification requise)
// MISES EN PREMIER pour éviter les conflicts avec les routes paramétrisées
// ============================================
// Favoris (pour locataires) - Spécifique avant générique
router.get('/user/favorites', authMiddleware, getFavoriteProperties);

// Routes AGENCE - Spécifiques avant génériques
router.get('/mine/list', authMiddleware, restrictTo('agency'), getMyProperties);

// Supprimer plusieurs propriétés (Actions groupées)
router.post('/bulk-delete', authMiddleware, restrictTo('agency'), bulkDeleteProperties);

// Analytics pour une propriété (Vues, Favoris, Candidatures)
router.get('/analytics/:id', authMiddleware, restrictTo('agency'), getPropertyAnalytics);

// ============================================
// Routes AGENCE avec :id (Paramètres)
// Les routes PLUS SPÉCIFIQUES d'abord
// ============================================
// Modifier le statut - AVANT le PATCH /:id générique
router.patch('/:id/status', authMiddleware, restrictTo('agency'), updatePropertyStatus);

// Dupliquer une propriété
router.post('/:id/duplicate', authMiddleware, restrictTo('agency'), duplicateProperty);

// Ajouter/Retirer un favori
router.post('/:id/favorite', authMiddleware, toggleFavorite);

// ============================================
// Routes GÉNÉRIQUES avec :id (Paramètres)
// À la fin car elles matchent plus largement
// ============================================
// Créer une propriété avec upload images
router.post('/', authMiddleware, restrictTo('agency'), upload.array('images', 10), createProperty);

// Éditer une propriété
router.patch('/:id', authMiddleware, restrictTo('agency'), upload.array('images', 10), updateProperty);

// Supprimer une propriété
router.delete('/:id', authMiddleware, restrictTo('agency'), deleteProperty);

// Voir une seule propriété (PUBLIC - À la fin)
router.get('/:id', getPropertyById);

module.exports = router;