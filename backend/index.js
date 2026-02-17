const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Imports des routes et middlewares
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth'); // Import du "vigile"
const User = require('./models/User'); // Import du modèle pour le test de profil
const Property = require('./models/Property'); 

// Initialisation de dotenv
dotenv.config();

const app = express();

// 1. MIDDLEWARES DE SÉCURITÉ ET CONFIGURATION
app.use(helmet()); 
app.use(cors()); 
app.use(express.json()); // Indispensable pour lire le JSON de Postman

// 2. LIMITATION DES REQUÊTES (Rate Limiter)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { message: "Trop de requêtes, réessayez plus tard." }
});
app.use(limiter);

// 3. ROUTES
console.log("Chargement des routes d'authentification...");
app.use('/api/auth', authRoutes);

/**
 * ROUTE DE TEST DU MIDDLEWARE (Sprint 2)
 * Cette route permet de vérifier si le token JWT est valide.
 * Elle utilise 'authMiddleware' pour protéger l'accès.
 */
app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    // Le middleware a injecté l'ID de l'utilisateur dans req.user
    // On récupère l'utilisateur en excluant le mot de passe pour la sécurité
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur lors de la récupération du profil" });
  }
});

// 4. CONNEXION MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connecté à MongoDB avec succès"); // Confirmation visuelle de la connexion
    
    try {
      const count = await Property.countDocuments();
      console.log(`Vérification : ${count} propriété(s) trouvée(s) dans la base.`);
    } catch (err) {
      console.error("Erreur lors du test du modèle Property:", err);
    }
  })
  .catch(err => console.error("Erreur de connexion MongoDB:", err));

// 5. LANCEMENT DU SERVEUR
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});