const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  // Qui a fait l'action
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Quoi : Type d'action
  action: {
    type: String,
    enum: [
      'user_verified',
      'user_suspended',
      'user_unsuspended',
      'user_deleted',
      'property_moderated',
      'document_verified',
      'payment_processed',
      'payment_refunded',
      'report_resolved',
      'admin_login',
      'bulk_action'
    ],
    required: true
  },

  // Sur quoi : Références des objets affectés
  targetType: {
    type: String,
    enum: ['User', 'Property', 'Document', 'Payment', 'Report'],
    required: true
  },
  targetId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true 
  },

  // Détails de l'action
  details: {
    before: mongoose.Schema.Types.Mixed,  // État avant
    after: mongoose.Schema.Types.Mixed,   // État après
    reason: String,                        // Raison de l'action
    notes: String                          // Notes additionnelles
  },

  // IP et User Agent pour la sécurité
  ipAddress: String,
  userAgent: String,

  // Statut de l'action
  success: { type: Boolean, default: true },
  error: String,

  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Index pour les recherches rapides
activityLogSchema.index({ adminId: 1, createdAt: -1 });
activityLogSchema.index({ targetId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
