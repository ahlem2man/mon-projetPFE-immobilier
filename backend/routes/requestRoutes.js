const express = require('express');
const router = express.Router();
// On récupère les fonctions du controller
const { submitRequest, getMyRequests, getRequestById, updateRequestStatus, getAgencyRequests, bulkUpdateRequests, getAgencyStatistics } = require('../controllers/requestController');
const { sendApplicationStatusEmail } = require('../utils/emailService');

// CORRECTION ICI : On utilise le même chemin que dans index.js
// On remonte d'un dossier (..) puis on va dans middleware/auth
const { protect } = require('../middleware/auth'); 

// Appliquer le middleware à toutes les routes du fichier
router.use(protect);

// Les routes
router.post('/', submitRequest);
router.get('/my-requests', getMyRequests);           // ✨ SPÉCIFIQUE pour locataires
router.get('/agency/stats', getAgencyStatistics);    // ✨ NOUVEAU: Statistiques avancées
router.get('/agency', getAgencyRequests);            // ✨ SPÉCIFIQUE pour agences
router.patch('/bulk/update-status', bulkUpdateRequests); // ✨ NOUVEAU: Actions groupées
router.get('/:id', getRequestById);                 // ✨ GÉNÉRIQUE après SPÉCIFIQUE
router.patch('/:id', updateRequestStatus);

// 🧪 Route de TEST SEULEMENT - Envoyer un email de test
router.post('/test/send-email', async (req, res) => {
  try {
    await sendApplicationStatusEmail(
      "ahlem.MANSOUR@polytechnicien.tn",
      "Ahlem Mansour", 
      "Bel appartement à Lyon", 
      "Acceptée"
    );
    res.json({ message: "✅ Email de test envoyé avec succès!" });
  } catch (error) {
    res.status(500).json({ error: "❌ Erreur: " + error.message });
  }
});

module.exports = router;