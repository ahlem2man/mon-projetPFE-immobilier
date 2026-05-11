const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerType: { type: String, enum: ['agency', 'tenant'], required: true },
  fileUrl: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['AGENCY_LICENSE', 'IDENTITY_CARD', 'REVENUE_PROOF', 'WORK_CONTRACT', 'OTHER']
  }, 
  status: { 
    type: String, 
    enum: ['en attente', 'validé', 'rejeté'], 
    default: 'en attente' 
  },
  adminNotes: { type: String }, // Raison du rejet ou commentaires
  verifiedAt: { type: Date },   // Date de validation
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin qui a validé
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);