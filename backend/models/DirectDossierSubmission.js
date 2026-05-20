const mongoose = require('mongoose');

const directDossierSubmissionSchema = new mongoose.Schema({
  // Qui envoie son dossier
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // À quelle(s) agence(s) - Tableau pour supporter plusieurs agences
  agencyIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }],

  // Statut du dossier auprès de chaque agence
  submissions: [{
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['Envoyé', 'Consulté', 'Accepté', 'Refusé'],
      default: 'Envoyé'
    },
    consultedAt: Date,
    respondedAt: Date,
    agencyNote: String
  }],

  // Les documents inclus (snapshot au moment de l'envoi)
  documents: {
    identityCard: String,
    taxNotice: String,
    lastThreePayslips: String,
    employmentContract: String,
    employerAttestation: String,
    rentalReceipts: String,
    propertyTax: String,
    accommodationAttestation: String,
    utilityBill: String
  },

  // Infos du profil au moment de l'envoi
  profileSnapshot: {
    fullName: String,
    email: String,
    phone: String,
    profession: String,
    employmentStatus: String,
    income: Number
  },

  // Message optionnel du locataire
  message: { type: String, trim: true, maxlength: 500 },

  // Suivi
  sentAt: { type: Date, default: Date.now },
  viewedByAgencies: [{ agencyId: mongoose.Schema.Types.ObjectId, viewedAt: Date }]
}, { timestamps: true });

// Index pour recherches rapides
directDossierSubmissionSchema.index({ tenantId: 1, createdAt: -1 });
directDossierSubmissionSchema.index({ agencyIds: 1 });

module.exports = mongoose.model('DirectDossierSubmission', directDossierSubmissionSchema);
