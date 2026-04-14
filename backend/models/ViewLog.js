const mongoose = require('mongoose');

const viewLogSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  viewDate: {
    type: Date,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    },
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index composé : pour utilisateur authentifié
viewLogSchema.index({ propertyId: 1, userId: 1, viewDate: 1 }, { 
  unique: true, 
  partialFilterExpression: { userId: { $exists: true, $ne: null } } 
});

// Index composé : pour utilisateur anonyme (par IP)
viewLogSchema.index({ propertyId: 1, ipAddress: 1, viewDate: 1 }, { 
  unique: true, 
  partialFilterExpression: { ipAddress: { $exists: true, $ne: null } } 
});

module.exports = mongoose.model('ViewLog', viewLogSchema);
