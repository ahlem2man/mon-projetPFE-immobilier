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