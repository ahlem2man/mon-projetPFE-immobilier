const express = require('express');
const router = express.Router();
const { getAllProperties, createProperty, getPropertyById } = require('../controllers/propertyController');

router.get('/', getAllProperties);      // Voir tout
router.post('/', createProperty);    // Créer
router.get('/:id', getPropertyById); // Voir une seule

module.exports = router;