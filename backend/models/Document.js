const mongoose = require('mongoose');
const documentSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  type: { type: String, required: true }, 
  status: { type: String, enum: ['en attente', 'validé', 'rejeté'], default: 'en attente' }
}, { timestamps: true });
module.exports = mongoose.model('Document', documentSchema);