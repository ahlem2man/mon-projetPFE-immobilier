const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['tenant', 'agency', 'admin', 'superadmin'], 
    default: 'tenant' 
  },
  
  // --- AJOUT POUR LE MATCHING ---
  preferences: {
    city: { type: String, default: "" },
    maxPrice: { type: Number, default: 0 },
    propertyType: { type: String, enum: ['Appartement', 'Villa', 'Maison', 'Studio', 'Bureau', ''], default: '' },
    minSurface: { type: Number, default: 0 },
    minRooms: { type: Number, default: 1 },
    moveInDate: { type: Date, default: null },
    wantedAmenities: [String] // Exemple: ['Parking', 'Wifi', 'Ascenseur']
  },
  // ------------------------------

  isVerified: { type: Boolean, default: false }, 
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);