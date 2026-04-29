const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    // Optionnel: enum pour normaliser (ex: 'ID', 'Tax', 'Contract')
  }, 
  status: { 
    type: String, 
    enum: ['en attente', 'validé', 'rejeté'], 
    default: 'en attente' 
  },
  // --- AJOUTS SPRINT 11 ---
  adminNotes: { type: String }, // Pourquoi le doc est rejeté ?
  verifiedAt: { type: Date }    // Pour les rapports et analytics
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);