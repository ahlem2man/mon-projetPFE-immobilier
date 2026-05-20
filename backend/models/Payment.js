const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Celui qui paye (Locataire)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Celui qui reçoit (Agence)
  agencyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Agency',
    required: true 
  },
  
  // Le bien concerné
  propertyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property'
  },
  
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  
  // Type de paiement
  type: { 
    type: String, 
    enum: ['Loyer', 'Dépôt de Garantie', 'Frais de Dossier', 'Option Boost', 'Frais de vérification'],
    required: true 
  },
  
  paymentDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['en attente', 'complété', 'échoué', 'remboursé'], 
    default: 'en attente' 
  },
  
  // Pour le suivi
  reference: { type: String, unique: true },
  paymentMethod: { type: String },
  
  // Commission de la plateforme HOMA (optionnel)
  platformCommission: { type: Number, default: 0 },
  
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);