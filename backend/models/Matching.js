const mongoose = require('mongoose');

const matchingSchema = new mongoose.Schema({
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  propertyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property', 
    required: true 
  },
  // Score global (ex: 85%)
  score: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  // Détail du score pour l'explication "Pourquoi ce matching"
  details: {
    priceScore: { type: Number, default: 0 },
    locationScore: { type: Number, default: 0 },
    typeScore: { type: Number, default: 0 },
    amenitiesScore: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'rejected'],
    default: 'active'
  },
  userFeedback: {
    type: String,
    enum: ['pending', 'useful', 'not_useful'],
    default: 'pending'
  }
}, { timestamps: true });

// On indexe pour des recherches rapides
matchingSchema.index({ tenantId: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model('Matching', matchingSchema);