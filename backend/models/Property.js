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
    default: [] 
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
}, { 
  timestamps: true 
}
);

module.exports = mongoose.model('Property', propertySchema);