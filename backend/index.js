const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


const Property = require('./models/Property'); 

dotenv.config();
const app = express();


app.use(helmet()); 
app.use(cors()); 
app.use(express.json()); 

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: "Trop de requêtes, réessayez plus tard."
});
app.use(limiter);


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
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});