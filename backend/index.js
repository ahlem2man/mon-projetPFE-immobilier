const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');


const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth'); 
const User = require('./models/User'); 
const Property = require('./models/Property'); 
const propertyRoutes = require('./routes/propertyRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const requestRoutes = require('./routes/requestRoutes'); 
const matchingRoutes = require('./routes/matchingRoutes');
const initCronJobs = require('./utils/cronJobs');
const agencyRoutes = require('./routes/agencyRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();

// Skip helmet for static files - it blocks CORP
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads')) {
    return next(); // Skip helmet middleware
  }
  helmet()(req, res, next);
});

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "https://mon-projet-pfe-immobilier-7son.vercel.app",
    "https://mon-projet-pfe-immobilier.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000"
  ], 
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
})); 

app.use(express.json()); 
// Configuration pour obtenir l'IP correcte en production/localhost
app.set('trust proxy', 1);
// Serve static files with explicit CORS
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { 
  maxAge: '1d', 
  etag: false,
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));



console.log("Chargement des routes d'authentification...");

// Root route and health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'API Immobilier - Backend Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/requests', requestRoutes); // Branchement
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/matchings', matchingRoutes);
app.use('/api/agency', agencyRoutes);
app.use('/api/admin', adminRoutes);
initCronJobs(); // Lancement des tâches planifiées

app.get('/api/auth/profile', authMiddleware.protect, async (req, res) => {
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

// 404 Handler - must be last
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Export pour Vercel
if (process.env.VERCEL) {
  module.exports = app;
}