const mongoose = require('mongoose');

// Définition de la structure d'une annonce immobilière
const propertySchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Le titre est obligatoire"], 
    trim: true 
  },
  description: { 
    type: String, 
    required: [true, "La description est obligatoire"] 
  },
  price: { 
    type: Number, 
    required: [true, "Le prix est obligatoire"] 
  },
  location: { 
    type: String, 
    required: [true, "La ville est obligatoire"],
    index: true // Pour accélérer la recherche par ville
  },
  address: { 
    type: String, 
    required: [true, "L'adresse exacte est obligatoire"] 
  },
  type: { 
    type: String, 
    required: [true, "Le type de bien est obligatoire"],
    enum: ['Appartement', 'Villa', 'Maison', 'Studio', 'Bureau'], // Liste pour les filtres
    index: true 
  },
  surface: { 
    type: Number // Surface en m²
  },
  rooms: { 
    type: Number, 
    default: 0 
  },
  amenities: { 
    type: [String], 
    default: [] // Exemple: ['WiFi', 'Piscine', 'Parking']
  },
  images: { 
    type: [String], 
    required: [true, "Au moins une image est requise"] 
  },
  status: { 
    type: String, 
    enum: ['disponible', 'vendu', 'loué'], 
    default: 'disponible' 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Lien vers l'utilisateur qui a créé l'annonce
    required: true 
  },
  favorites: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { 
  timestamps: true // Crée automatiquement createdAt et updatedAt
});

module.exports = mongoose.model('Property', propertySchema);