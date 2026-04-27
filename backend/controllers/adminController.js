const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Obtenir tous les utilisateurs avec filtres (Point 2 & 5)
exports.getUsers = async (req, res) => {
  try {
    const { role, isVerified } = req.query;
    let query = {};
    
    if (role) query.role = role;
    if (isVerified) query.isVerified = isVerified === 'true';

    const users = await User.find(query).select('-password').sort('-createdAt');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Suspendre ou Activer un compte (Point 2)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isSuspended, isVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isSuspended, isVerified }, 
      { new: true }
    );
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Voir les annonces en attente ou signalées (Point 7)
exports.getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ 
      $or: [{ moderationStatus: 'en attente' }, { isReported: true }] 
    }).populate('owner', 'fullName email');
    
    res.status(200).json({ success: true, data: properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approuver ou Rejeter une annonce (Point 8)
exports.moderateProperty = async (req, res) => {
  try {
    const { moderationStatus, adminNotes } = req.body;
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { moderationStatus, adminNotes },
      { new: true }
    );
    res.status(200).json({ success: true, data: property });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};