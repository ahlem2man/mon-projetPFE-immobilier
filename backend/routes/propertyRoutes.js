const express = require('express');
const router = express.Router();


const { 
  getAllProperties, 
  createProperty, 
  getPropertyById, 
  toggleFavorite,
  getFavoriteProperties 
} = require('../controllers/propertyController');

const authMiddleware = require('../middleware/auth');

// 1. Voir toutes les propriétés
router.get('/', getAllProperties);

// 2. Créer une propriété
router.post('/', createProperty);

// 3. RÉCUPÉRER les favoris de l'utilisateur (Route GET)
// Changement ici : On utilise directement le nom de la fonction
router.get('/user/favorites', authMiddleware, getFavoriteProperties);

// 4. AJOUTER/RETIRER un favori (Route POST)
router.post('/:id/favorite', authMiddleware, toggleFavorite);

// 5. Voir une seule propriété
router.get('/:id', getPropertyById);

module.exports = router;