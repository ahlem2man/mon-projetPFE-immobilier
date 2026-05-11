const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Infos pro enrichies
  profession: { type: String },
  employmentType: { 
    type: String, 
    enum: ['CDI', 'CDD', 'Indépendant', 'Étudiant', 'Recherche d emploi', 'Autre'],
    default: 'Autre'
  },
  income: { type: Number },
  employer: { type: String }, // Nom de l'entreprise

  // Situation professionnelle et garant
  professionalStatus: {
    status: { type: String, enum: ['Étudiant(e)', 'Salarié(e)', 'Indépendant(e)', 'Demandeur d\'emploi', 'Autre'] },
    hasGuarantee: { type: Boolean, default: false },
    guaranteeDetails: { type: String } // Infos sur le garant ou partenaire
  },

  // Gestion des documents (chemins des fichiers uploadés via Multer)
  documents: {
    // Pièce d'identité
    identityCard: { type: String },

    // Justificatifs de revenus
    taxNotice: { type: String },
    lastThreePayslips: { type: String },
    employmentContract: { type: String },
    employerAttestation: { type: String },

    // Situation actuelle de logement
    rentalReceipts: { type: String },
    propertyTax: { type: String },
    accommodationAttestation: { type: String },

    // Justificatif de domicile
    utilityBill: { type: String }
  },

  // Pour l'indicateur de complétude (0 à 100)
  completionPercentage: { type: Number, default: 0 },

  // Statut du dossier locatif pour l'agence
  fileStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected', 'info_required'],
    default: 'pending'
  },

  // Historique des actions et notes internes (par l'agence)
  fileHistory: [{
    status: { type: String, enum: ['pending', 'verified', 'rejected', 'info_required'] },
    note: { type: String },
    createdAt: { type: Date, default: Date.now },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  // Tableau des recherches mémorisées (Étape 9)
  savedSearches: [{
    label: { type: String }, // Ex: "T3 à Lyon"
    filters: {
      location: String,
      budgetMax: Number,
      propertyType: String,
      minRooms: Number,
      isFurnished: Boolean
    },
    createdAt: { type: Date, default: Date.now }
  }],

  // Liste des IDs des propriétés "likées" (Étape 10)
  favoriteProperties: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property' 
  }]

}, { timestamps: true, strict: true });

module.exports = mongoose.model('Tenant', tenantSchema);