const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth'); 
const User = require('./models/User'); 
const Property = require('./models/Property'); 
const propertyRoutes = require('./routes/propertyRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const requestRoutes = require('./routes/requestRoutes'); 
const matchingRoutes = require('./routes/matchingRoutes');
const initCronJobs = require('./utils/cronJobs');


dotenv.config();

const app = express();


app.use(helmet()); 


app.use(cors({
  origin: [
    "https://mon-projet-pfe-immobilier-7son.vercel.app",
    "https://mon-projet-pfe-immobilier.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ], 
  credentials: true
})); 

app.use(express.json()); 





console.log("Chargement des routes d'authentification...");
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/requests', requestRoutes); // Branchement
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/matchings', matchingRoutes);
initCronJobs(); // Lancement des tâches planifiées

app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur lors de la récupération du profil" });
  }
});

console.log(`[DB] Tentative de connexion à : ${process.env.MONGO_URI}`);

// Démarrer le serveur IMMÉDIATEMENT (sans attendre MongoDB)
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(` Serveur démarré sur le port ${PORT}`);
  });
}

// Connexion MongoDB en arrière-plan avec reconnexion
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 45000,
  maxPoolSize: 5,
  minPoolSize: 1,
  retryWrites: true,
})
  .then(async () => {
    console.log(" Connecté à MongoDB avec succès"); 
    
    try {
      const count = await Property.countDocuments();
      console.log(` Vérification : ${count} propriété(s) trouvée(s) dans la base.`);
    } catch (err) {
      console.error(" Erreur lors du test du modèle Property:", err.message);
    }
  })
  .catch(err => {
    console.warn("  Connexion MongoDB échouée (le serveur fonctionnera quand même):", err.message);
    console.warn(" MongoDB sera reconnecté automatiquement...");
  });



const seedTest = async () => {
  const testUser = await User.findOne(); 
  if (testUser) {
    await Property.create({
      title: "Belle Villa Moderne",
      description: "Magnifique villa avec piscine et jardin",
      price: 2500, 
      location: "Paris",
      address: "Avenue des Champs-Élysées, 75008 Paris",
      type: "Villa",
      surface: 250, 
      images: ["https://via.placeholder.com/400"],
      owner: testUser._id
    });
    console.log("Annonce de test créée !");
  } else {
    console.log("Aucun utilisateur trouvé pour créer une annonce.");
  }
};

// Export pour Vercel
if (process.env.VERCEL) {
  module.exports = app;
}