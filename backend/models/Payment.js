const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['en attente', 'complété', 'échoué'], default: 'en attente' },
  reference: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('Payment', paymentSchema);