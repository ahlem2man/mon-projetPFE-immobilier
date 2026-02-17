const mongoose = require('mongoose');
const tenantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profession: { type: String },
  income: { type: Number },
  preferences: {
    location: String,
    budgetMax: Number,
    propertyType: String,
    minRooms: Number
  }
}, { timestamps: true });
module.exports = mongoose.model('Tenant', tenantSchema);