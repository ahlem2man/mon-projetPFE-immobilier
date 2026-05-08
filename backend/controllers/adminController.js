const User = require('../models/User');
const Property = require('../models/Property');
const Agency = require('../models/Agency');

const Document = require('../models/Document');

const Payment = require('../models/Payment');
const Request = require('../models/Request'); // Pour les demandes


// @desc    Obtenir tous les utilisateurs avec filtres (Point 2 & 5)
exports.getUsers = async (req, res) => {
  try {
    const { role, isVerified } = req.query;
    let query = {};
    
    if (role) query.role = role;
    if (isVerified) query.isVerified = isVerified === 'true';

    let users = await User.find(query).select('-password').sort('-createdAt');
    
    // Enrich agency users with their agency verification status
    users = await Promise.all(
      users.map(async (user) => {
        if (user.role === 'agency') {
          const agency = await Agency.findOne({ userId: user._id }).select('isVerifiedByAdmin verificationStatus');
          return {
            ...user.toObject(),
            agencyVerificationStatus: agency?.verificationStatus || 'pending',
            agencyIsVerifiedByAdmin: agency?.isVerifiedByAdmin || false
          };
        }
        return user.toObject();
      })
    );
    
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
    
    // Sync verification status with Agency model if user is an agency
    if (user.role === 'agency' && typeof isVerified !== 'undefined') {
      await Agency.findOneAndUpdate(
        { userId: req.params.id },
        { 
          isVerifiedByAdmin: isVerified,
          verificationStatus: isVerified ? 'approved' : 'pending'
        }
      );
    }
    
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

// @desc    Obtenir les détails d'un utilisateur (Point 6)
exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Éditer un utilisateur (Point 6)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isVerified, isSuspended, suspensionReason } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isVerified !== 'undefined') updateData.isVerified = isVerified;
    if (typeof isSuspended !== 'undefined') updateData.isSuspended = isSuspended;
    if (suspensionReason) updateData.suspensionReason = suspensionReason;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    // Sync verification status with Agency model if user is an agency
    if (user.role === 'agency' && typeof isVerified !== 'undefined') {
      await Agency.findOneAndUpdate(
        { userId: req.params.id },
        { 
          isVerifiedByAdmin: isVerified,
          verificationStatus: isVerified ? 'approved' : 'pending'
        }
      );
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Supprimer un utilisateur (Point 2)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    // Supprimer aussi ses propriétés
    await Property.deleteMany({ owner: req.params.id });
    
    res.status(200).json({ success: true, message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Actions groupées sur utilisateurs (Point 10)
exports.bulkAction = async (req, res) => {
  try {
    const { ids, action, suspensionReason } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucun utilisateur sélectionné' });
    }

    let updateData = {};
    
    switch (action) {
      case 'verify':
        updateData = { isVerified: true };
        // Get users to check if any are agencies
        const usersToVerify = await User.find({ _id: { $in: ids } });
        const agencyIds = usersToVerify.filter(u => u.role === 'agency').map(u => u._id);
        
        // Sync verification status with Agency model for agencies
        if (agencyIds.length > 0) {
          await Agency.updateMany(
            { userId: { $in: agencyIds } },
            { 
              isVerifiedByAdmin: true,
              verificationStatus: 'approved'
            }
          );
        }
        break;
      case 'suspend':
        updateData = { isSuspended: true, suspensionReason: suspensionReason || 'Suspendu par admin' };
        break;
      case 'unsuspend':
        updateData = { isSuspended: false, suspensionReason: null };
        break;
      case 'delete':
        // Supprimer les utilisateurs et leurs propriétés
        await Property.deleteMany({ owner: { $in: ids } });
        await User.deleteMany({ _id: { $in: ids } });
        return res.status(200).json({ success: true, message: `${ids.length} utilisateurs supprimés` });
      default:
        return res.status(400).json({ success: false, message: 'Action invalide' });
    }

    const result = await User.updateMany(
      { _id: { $in: ids } },
      updateData
    );

    res.status(200).json({ 
      success: true, 
      message: `${result.modifiedCount} utilisateurs mis à jour` 
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Obtenir détails d'une annonce en modération (Point 7)
exports.getPropertyDetail = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email role');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Annonce non trouvée' });
    }
    res.status(200).json({ success: true, data: property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Lister tous les documents en attente de vérification
exports.getPendingDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ status: 'pending' })
      .populate('owner', 'name email role');
    res.status(200).json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approuver ou Rejeter un document
exports.verifyDocument = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes, verifiedAt: Date.now() },
      { new: true }
    );

    // Si le document est une licence d'agence et qu'il est validé, 
    // on peut automatiquement vérifier l'utilisateur
    if (doc.type === 'AGENCY_LICENSE' && status === 'verified') {
      await User.findByIdAndUpdate(doc.owner, { isVerified: true });
    }

    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
exports.getGlobalStats = async (req, res) => {
  try {
    // 1. Statistiques des Utilisateurs
    const totalUsers = await User.countDocuments();
    const tenantsCount = await User.countDocuments({ role: 'tenant' });
    const agenciesCount = await User.countDocuments({ role: 'agency' });

    // 2. Statistiques des Propriétés
    const totalProperties = await Property.countDocuments();
    const activeProperties = await Property.countDocuments({ moderationStatus: 'validé' });

    // 3. Statistiques Financières (Revenus en Euros)
    const revenueData = await Payment.aggregate([
      { $match: { status: 'complété' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // 4. Statistiques des Demandes (Applications)
    const totalApplications = await Request.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, tenants: tenantsCount, agencies: agenciesCount },
        properties: { total: totalProperties, active: activeProperties },
        revenue: { total: totalRevenue, currency: 'EUR' },
        applications: { total: totalApplications }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getGrowthStats = async (req, res) => {
  try {
    // Exemple : Évolution des inscriptions par mois
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({ success: true, data: userGrowth });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Obtenir la liste détaillée de tous les paiements
exports.getAllPayments = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};

    // Filtre par statut (complété, en attente, échoué)
    if (status) query.status = status;

    // Filtre par plage de dates
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(query)
      .populate('userId', 'name email role')
      .sort('-createdAt');

    // Calcul rapide des totaux pour le rapport
    const report = {
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      count: payments.length,
      completedCount: payments.filter(p => p.status === 'complété').length
    };

    res.status(200).json({ success: true, report, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};