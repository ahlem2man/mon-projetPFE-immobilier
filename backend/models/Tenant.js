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

  // Préférences complètes
  preferences: {
    location: String,
    budgetMax: Number,
    propertyType: { 
      type: String, 
      enum: ['Appartement', 'Maison', 'Studio', 'Colocation', 'Tous'],
      default: 'Tous'
    },
    minRooms: { type: Number, default: 1 },
    moveInDate: { type: Date }, // Ajouté pour le Sprint 4
    isFurnished: { type: Boolean, default: false } // Meublé ou non
  },

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
  completionPercentage: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);