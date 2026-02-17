const mongoose = require('mongoose');
const requestSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  status: { type: String, enum: ['en attente', 'acceptée', 'refusée'], default: 'en attente' },
  message: { type: String },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('Request', requestSchema);