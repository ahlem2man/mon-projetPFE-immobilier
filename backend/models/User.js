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
  isVerified: { type: Boolean, default: false }, 
  verificationToken: String, // Jeton pour l'email de confirmation
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);