const mongoose = require('mongoose');

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
    enum: ['Appartement', 'Villa', 'Maison', 'Studio', 'Bureau'], 
    index: true 
  },
  surface: { 
    type: Number 
  },
  rooms: { 
    type: Number, 
    default: 0 
  },
  amenities: { 
    type: [String],
    enum: ['Ascenseur', 'Cave à vin', 'Climatisation', 'Garage', 'Jardin',
            'Lave-linge', 'Parking', 'Piscine', 'Spa', 'Terrasse',
            'Vue mer', 'WiFi', 'Balcon', 'Chauffage', 'Cuisine équipée',
            'Lave-vaisselle', 'Sèche-linge', 'Accès PMR', 'Smart TV'],
    default: [] 
  },
  images: { 
    type: [String], 
    required: [true, "Au moins une image est requise"] 
  },
  status: { 
    type: String, 
    enum: ['disponible', 'louée', 'en attente', 'inactive'], 
    default: 'disponible' 
  },
  views: {
    type: Number,
    default: 0
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  favorites: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],

  
  coordinates: {
    lat: { 
      type: Number, 
      required: [true, "La latitude est requise pour la carte"],
      default: 36.8065 
    },
    lng: { 
      type: Number, 
      required: [true, "La longitude est requise pour la carte"],
      default: 10.1815 
    }
  },
  // --- SPRINT 10 : Modération des annonces ---
  moderationStatus: {
    type: String,
    enum: ['en attente', 'validé', 'rejeté'],
    default: 'en attente'
  },
  adminNotes: { type: String, default: null },
  isReported: { type: Boolean, default: false },
  reportReasons: [String], // ['Contenu inapproprié', 'Faux prix', 'Photos trompeuses', etc.]
}, { 
  timestamps: true 
}
);

module.exports = mongoose.model('Property', propertySchema);