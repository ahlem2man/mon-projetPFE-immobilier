const mongoose = require('mongoose');
const matchingSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  score: { type: Number, required: true },
  matchedCriteria: [String]
}, { timestamps: true });
module.exports = mongoose.model('Matching', matchingSchema);