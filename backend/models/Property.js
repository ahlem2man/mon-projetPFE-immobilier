const mongoose = require('mongoose');
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['Appartement', 'Maison', 'Studio', 'Bureau'], required: true },
  rooms: { type: Number, required: true },
  surface: { type: Number }, 
  amenities: [{ type: String }], 
  images: [{ type: String }],
  status: { type: String, enum: ['disponible', 'louée', 'en attente'], default: 'disponible' },
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('Property', propertySchema);