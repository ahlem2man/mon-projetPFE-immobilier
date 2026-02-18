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

dotenv.config();

const app = express();


app.use(helmet()); 


app.use(cors({
  origin: ["https://mon-projet-pfe-immobilier.vercel.app", "http://localhost:5173"], 
  credentials: true
})); 

app.use(express.json()); 


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { message: "Trop de requêtes, réessayez plus tard." }
});
app.use(limiter);


console.log("Chargement des routes d'authentification...");
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);



app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Erreur lors de la récupération du profil" });
  }
});


mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connecté à MongoDB avec succès"); 
    
    try {
      const count = await Property.countDocuments();
      console.log(`Vérification : ${count} propriété(s) trouvée(s) dans la base.`);
    } catch (err) {
      console.error("Erreur lors du test du modèle Property:", err);
    }
  })
  .catch(err => console.error("Erreur de connexion MongoDB:", err));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});


// À ajouter temporairement dans index.js après mongoose.connect
const seedTest = async () => {
  const testUser = await User.findOne(); // Récupère un utilisateur existant pour l'ID owner
  if (testUser) {
    await Property.create({
      title: "Villa Luxe Test",
      description: "Magnifique villa avec piscine",
      price: 1500, // Nombre
      location: "Sfax",
      address: "Route de Tunis Km 5",
      type: "Villa",
      surface: 250, // Nombre
      rooms: 5,
      images: ["https://via.placeholder.com/400"],
      owner: testUser._id
    });
    console.log("Annonce de test créée !");
  } else {
    console.log("Aucun utilisateur trouvé pour créer une annonce.");
  }
};