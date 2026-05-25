const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema(
  {
    // Email Settings
    emailSettings: {
      smtpHost: { type: String, default: 'smtp.gmail.com' },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: 'noreply@immo-ahlem.com' },
      smtpPass: { type: String, default: '****' },
      fromEmail: { type: String, default: 'noreply@immo-ahlem.com' },
      fromName: { type: String, default: 'Immo Ahlem' }
    },

    // Financial Settings
    financialSettings: {
      platformCommission: { type: Number, default: 10 },
      commissionType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
      minListingPrice: { type: Number, default: 100000 },
      maxListingPrice: { type: Number, default: 10000000 },
      feesIncludeTax: { type: Boolean, default: true }
    },

    // Security Settings
    securitySettings: {
      requireEmailVerification: { type: Boolean, default: true },
      twoFactorAuthEnabled: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 30 },
      maxLoginAttempts: { type: Number, default: 5 },
      passwordMinLength: { type: Number, default: 8 },
      requireSpecialChars: { type: Boolean, default: true }
    },

    // Platform Limits
    platformLimits: {
      maxUsersPerMonth: { type: Number, default: 1000 },
      maxPropertiesPerAgency: { type: Number, default: 500 },
      maxUploadFileSize: { type: Number, default: 10 },
      maxImagesPerProperty: { type: Number, default: 20 },
      requestTimeoutSeconds: { type: Number, default: 30 }
    },

    // Branding
    brandingSettings: {
      platformName: { type: String, default: 'Immo Ahlem' },
      primaryColor: { type: String, default: '#3F51B5' },
      secondaryColor: { type: String, default: '#FF9800' },
      logoUrl: { type: String, default: '/logo.png' },
      faviconUrl: { type: String, default: '/favicon.ico' }
    },

    // Maintenance
    maintenanceSettings: {
      maintenanceMode: { type: Boolean, default: false },
      maintenanceMessage: { type: String, default: 'La plateforme est en maintenance. Nous reviendraient très bientôt.' },
      allowAdminAccess: { type: Boolean, default: true },
      estimatedEndTime: { type: Date }
    },

    // Audit
    updatedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastUpdatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

// Hooks
platformSettingsSchema.pre('save', async function() {
  this.lastUpdatedAt = Date.now();
});

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
