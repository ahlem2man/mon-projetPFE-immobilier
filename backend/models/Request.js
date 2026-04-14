const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  status: { 
    type: String, 
    // On ajoute 'Infos requises' pour le point 7 du Sprint
    enum: ['En attente', 'En cours', 'Acceptée', 'Refusée', 'Infos requises'], 
    default: 'En attente' 
  },
  
  message: { type: String, trim: true, maxlength: 500 },

  // --- AJOUTS SPRINT 9 ---
  
  // Pour le visualiseur de documents (Point 6)
  documents: [{
    name: String, // ex: "Fiche de paie"
    url: String,  // Chemin vers le fichier
    type: String  // PDF, PNG, etc.
  }],

  // Pour les statistiques (Point 9)
  monthlyIncome: { type: Number }, 
  employmentStatus: { type: String },

  // Système de notes internes (Point 8)
  internalNotes: [
    {
      author: { type: String, default: "Agence" },
      content: { type: String },
      date: { type: Date, default: Date.now }
    }
  ],

  statusHistory: [
    {
      status: { type: String, required: true },
      date: { type: Date, default: Date.now },
      comment: { type: String }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);