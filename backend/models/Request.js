const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  // Le locataire qui postule
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Le bien immobilier concerné
  propertyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property', 
    required: true 
  },
  // L'agence ou le propriétaire (récupéré depuis Property.owner)
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Statut de la demande (Flux de candidature)
  status: { 
    type: String, 
    enum: ['En attente', 'En cours', 'Acceptée', 'Refusée'], 
    default: 'En attente' 
  },
  // Message personnalisé du locataire
  message: { 
    type: String, 
    trim: true,
    maxlength: [500, "Le message ne peut pas dépasser 500 caractères"]
  },
  // Historique/Logs pour le suivi (Optionnel mais recommandé pour le Sprint 5)
  statusHistory: [
    {
      status: { type: String, required: true },
      date: { type: Date, default: Date.now },
      comment: { type: String }
    }
  ]
}, { timestamps: true });

// Index pour accélérer la recherche des candidatures d'un locataire
requestSchema.index({ tenantId: 1, propertyId: 1 });

module.exports = mongoose.model('Request', requestSchema);