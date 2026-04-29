const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Celui qui paye (Locataire ou Agence)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EUR' }, // Fixé sur l'Euro
  
  // Type de paiement pour les statistiques (Point 3)
  type: { 
    type: String, 
    enum: ['Loyer', 'Abonnement', 'Option Boost', 'Frais de vérification'],
    required: true 
  },
  
  paymentDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['en attente', 'complété', 'échoué', 'remboursé'], 
    default: 'en attente' 
  },
  
  // Pour le suivi et l'audit (Point 10)
  reference: { type: String, unique: true }, // ID de transaction Stripe/PayPal
  paymentMethod: { type: String }, // ex: "Carte Bancaire", "PayPal"
  
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);