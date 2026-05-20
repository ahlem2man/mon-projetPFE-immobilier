const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  // Qui a fait l'action (peut être admin, client ou agence)
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  agencyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Agency',
    default: null
  },

  // Type d'acteur (admin, client, ou agence)
  performedByType: {
    type: String,
    enum: ['admin', 'client', 'agency'],
    default: 'admin'
  },
  
  // Quoi : Type d'action
  action: {
    type: String,
    enum: [
      // Actions ADMIN
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
      'bulk_action',
      // Actions CLIENT
      'property_favorited',
      'property_unfavorited',
      'request_created',
      'request_cancelled',
      'profile_updated',
      'search_performed',
      // Actions AGENCE
      'property_created',
      'property_updated',
      'property_deleted',
      'request_accepted',
      'request_rejected',
      'agency_profile_updated'
    ],
    required: true
  },

  // Sur quoi : Références des objets affectés
  targetType: {
    type: String,
    enum: ['User', 'Property', 'Document', 'Payment', 'Report', 'Request', 'Agency'],
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
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ agencyId: 1, createdAt: -1 });
activityLogSchema.index({ targetId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ performedByType: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
