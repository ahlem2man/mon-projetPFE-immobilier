const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // Une agence par compte utilisateur
  },
  agencyName: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  address: { type: String },
  logo: { type: String, default: 'default-logo.png' },
  
  // --- AJOUTS POUR LE SPRINT 7 ---
  
  // 1. Workflow de vérification (Documents & Statut)
  isVerifiedByAdmin: { type: Boolean, default: false },
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  verificationDocs: [{
    docType: String, // ex: "Kbis", "Carte Pro"
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  // 2. Statistiques (Aperçu rapide pour le dashboard)
  stats: {
    totalAds: { type: Number, default: 0 },
    activeAds: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    pendingRequests: { type: Number, default: 0 }
  },

  // 3. Réputation (Notes et Avis)
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },

  // 4. Paramètres & Contact
  phoneNumber: { type: String },
  description: { type: String },
  website: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Agency', agencySchema);