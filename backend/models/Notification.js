const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  link: { 
    type: String 
  }, // Exemple: /dashboard/applications/ID_DE_LA_REQUETE
  isRead: { 
    type: Boolean, 
    default: false 
  },
  type: { 
    type: String, 
    enum: ['status_change', 'new_message', 'general'], 
    default: 'status_change' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);