const express = require('express');
const router = express.Router();
// On récupère les fonctions du controller
const { submitRequest, getMyRequests } = require('../controllers/requestController');

// CORRECTION ICI : On utilise le même chemin que dans index.js
// On remonte d'un dossier (..) puis on va dans middleware/auth
const protect = require('../middleware/auth'); 

// Appliquer le middleware à toutes les routes du fichier
router.use(protect);

// Les routes
router.post('/', submitRequest);
router.get('/my-requests', getMyRequests);

module.exports = router;