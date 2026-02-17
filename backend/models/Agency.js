const mongoose = require('mongoose');
const agencySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  agencyName: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  address: { type: String },
  logo: { type: String },
  isVerifiedByAdmin: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Agency', agencySchema);