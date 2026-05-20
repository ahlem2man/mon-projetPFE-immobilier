const User = require('../models/User');
const Property = require('../models/Property');
const Agency = require('../models/Agency');

const Document = require('../models/Document');

const Payment = require('../models/Payment');
const Request = require('../models/Request'); // Pour les demandes
const Notification = require('../models/Notification');
const { logActivity } = require('./activityLogController');
const { notifyAdmins } = require('./notificationController');


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
    const { isSuspended, isVerified, suspensionReason } = req.body;
    
    // Récupérer l'état AVANT
    const userBefore = await User.findById(req.params.id).select('-password');
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isSuspended, isVerified, suspensionReason }, 
      { new: true }
    );
    
    // Sync verification status with Agency model if user is an agency
    if (user.role === 'agency' && typeof isVerified !== 'undefined') {
      const agency = await Agency.findOne({ userId: req.params.id });
      
      // Si on essaie de vérifier l'agence, vérifier qu'elle a au moins UN document valide
      if (isVerified && agency) {
        const hasValidDoc = agency.verificationDocs && agency.verificationDocs.length > 0;
        
        if (!hasValidDoc) {
          return res.status(400).json({ 
            success: false, 
            message: "L'agence doit avoir au moins un document de vérification (Kbis, Carte Pro ou Attestation Assurance) pour être vérifiée." 
          });
        }
      }
      
      await Agency.findOneAndUpdate(
        { userId: req.params.id },
        { 
          isVerifiedByAdmin: isVerified,
          verificationStatus: isVerified ? 'approved' : 'pending'
        }
      );

      // Create notification for agency
      const notificationMsg = isVerified 
        ? `Félicitations! Votre agence a été approuvée par l'administrateur.`
        : `Votre agence n'a pas pu être approuvée. Veuillez contacter l'administrateur.`;
      
      await Notification.create({
        recipient: req.params.id,
        message: notificationMsg,
        type: 'status_change',
        link: '/agency/profile'
      });
    }

    // Create notification for account suspension/unsuspension
    if (typeof isSuspended !== 'undefined' && user.role === 'agency') {
      const notificationMsg = isSuspended 
        ? `Votre compte a été suspendu. Raison: ${suspensionReason || 'Non spécifiée'}`
        : `Votre compte a été réactivé.`;
      
      await Notification.create({
        recipient: req.params.id,
        message: notificationMsg,
        type: 'status_change',
        link: '/agency/profile'
      });
    }

    // Notifier les autres admins de l'action
    if (typeof isVerified !== 'undefined' && user.role === 'agency') {
      const adminMsg = isVerified 
        ? `L'agence ${user.name} a été approuvée par un administrateur.`
        : `L'agence ${user.name} a été rejetée.`;
      
      await notifyAdmins(adminMsg, '/dashboard-admin/users', 'status_change');
    }

      const activityAction = typeof isSuspended !== 'undefined'
        ? (isSuspended ? 'user_suspended' : 'user_unsuspended')
        : (typeof isVerified !== 'undefined' && isVerified ? 'user_verified' : 'bulk_action');

      // Préparer les détails avec before/after
      const detailsBefore = {
        isVerified: userBefore.isVerified,
        isSuspended: userBefore.isSuspended,
        suspensionReason: userBefore.suspensionReason
      };

      const detailsAfter = {
        isVerified: user.isVerified,
        isSuspended: user.isSuspended,
        suspensionReason: user.suspensionReason
      };

      await logActivity(
        req.user.id,
        activityAction,
        'User',
        req.params.id,
        { 
          before: detailsBefore,
          after: detailsAfter,
          reason: suspensionReason || 'Modification du statut utilisateur'
        },
        req.ip,
        req.get('user-agent')
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
    
    // Récupérer l'état AVANT
    const propertyBefore = await Property.findById(req.params.id);
    
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { moderationStatus, adminNotes },
      { new: true }
    );

    // Détails avant/après
    const detailsBefore = {
      moderationStatus: propertyBefore.moderationStatus,
      adminNotes: propertyBefore.adminNotes
    };

    const detailsAfter = {
      moderationStatus: property.moderationStatus,
      adminNotes: property.adminNotes
    };

    await logActivity(
      req.user.id,
      'property_moderated',
      'Property',
      req.params.id,
      { 
        before: detailsBefore,
        after: detailsAfter,
        reason: `Modération d'annonce: ${property.title}`,
        notes: adminNotes
      },
      req.ip,
      req.get('user-agent')
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

    // Récupérer l'état AVANT
    const userBefore = await User.findById(req.params.id).select('-password');

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    // Sync verification status with Agency model if user is an agency
    if (user.role === 'agency' && typeof isVerified !== 'undefined') {
      const agency = await Agency.findOne({ userId: req.params.id });
      
      // Si on essaie de vérifier l'agence, vérifier qu'elle a au moins UN document valide
      if (isVerified && agency) {
        console.log('[DEBUG] Tentative vérification - Agency:', agency._id);
        console.log('[DEBUG] VerificationDocs:', JSON.stringify(agency.verificationDocs));
        
        const hasValidDoc = agency.verificationDocs && agency.verificationDocs.length > 0;
        
        if (!hasValidDoc) {
          console.log('[DEBUG] Pas de document trouvé');
          return res.status(400).json({ 
            success: false, 
            message: "L'agence doit avoir au moins un document de vérification (Kbis, Carte Pro ou Attestation Assurance) pour être vérifiée." 
          });
        }
        console.log('[DEBUG] Document trouvé, procédure de vérification');
      }
      
      await Agency.findOneAndUpdate(
        { userId: req.params.id },
        { 
          isVerifiedByAdmin: isVerified,
          verificationStatus: isVerified ? 'approved' : 'pending'
        }
      );

      // Create notification for agency verification status
      if (typeof isVerified !== 'undefined') {
        const notificationMsg = isVerified 
          ? `Félicitations! Votre agence a été approuvée par l'administrateur.`
          : `Votre demande de vérification a été rejetée. Veuillez contacter l'administrateur.`;
        
        await Notification.create({
          recipient: req.params.id,
          message: notificationMsg,
          type: 'status_change',
          link: '/agency/profile'
        });
      }
    }

    // Create notification for suspension/unsuspension
    if (typeof isSuspended !== 'undefined' && user.role === 'agency') {
      const notificationMsg = isSuspended 
        ? `Votre compte a été suspendu. Raison: ${suspensionReason || 'Non spécifiée'}`
        : `Votre compte a été réactivé.`;
      
      await Notification.create({
        recipient: req.params.id,
        message: notificationMsg,
        type: 'status_change',
        link: '/agency/profile'
      });
    }

    // Préparer les détails before/after pour l'audit
    const detailsBefore = {
      name: userBefore.name,
      email: userBefore.email,
      role: userBefore.role,
      isVerified: userBefore.isVerified,
      isSuspended: userBefore.isSuspended,
      suspensionReason: userBefore.suspensionReason
    };

    const detailsAfter = {
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isSuspended: user.isSuspended,
      suspensionReason: user.suspensionReason
    };

    await logActivity(
      req.user.id,
      'bulk_action',
      'User',
      req.params.id,
      { 
        before: detailsBefore,
        after: detailsAfter,
        reason: 'Édition du profil utilisateur',
        notes: Object.keys(updateData).join(', ')
      },
      req.ip,
      req.get('user-agent')
    );

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Supprimer un utilisateur (Point 2)
exports.deleteUser = async (req, res) => {
  try {
    // Récupérer l'état AVANT suppression
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    const userDeleted = await User.findByIdAndDelete(req.params.id);
    
    // Supprimer aussi ses propriétés
    await Property.deleteMany({ owner: req.params.id });

    // Enregistrer les détails de suppression
    const detailsBefore = {
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isSuspended: user.isSuspended,
      createdAt: user.createdAt
    };

    await logActivity(
      req.user.id,
      'user_deleted',
      'User',
      req.params.id,
      { 
        before: detailsBefore,
        after: null,
        reason: 'Suppression de compte utilisateur',
        notes: `Utilisateur supprimé: ${user.email}`
      },
      req.ip,
      req.get('user-agent')
    );
    
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

        await logActivity(
          req.user.id,
          'user_deleted',
          'User',
          ids[0],
          { operation: 'bulkDelete', count: ids.length, ids },
          req.ip,
          req.get('user-agent')
        );

        return res.status(200).json({ success: true, message: `${ids.length} utilisateurs supprimés` });
      default:
        return res.status(400).json({ success: false, message: 'Action invalide' });
    }

    const result = await User.updateMany(
      { _id: { $in: ids } },
      updateData
    );

    await logActivity(
      req.user.id,
      'bulk_action',
      'User',
      ids[0],
      { operation: action, count: ids.length, ids, updateData },
      req.ip,
      req.get('user-agent')
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
// @desc    Obtenir les documents en attente de vérification
exports.getPendingDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ status: 'en attente' })
      .populate('ownerId', 'fullName email role')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approuver ou Rejeter un document
exports.verifyDocument = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    console.log('Vérification de document:', req.params.id, 'Status:', status);
    
    // Récupérer l'état AVANT
    const docBefore = await Document.findById(req.params.id);
    
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        adminNotes, 
        verifiedAt: new Date(),
        verifiedBy: req.user.id
      },
      { new: true }
    ).populate('verifiedBy', 'fullName');

    console.log('Document mis à jour:', doc);

    // Si le document est validé et appartient à une agence,
    // on vérifie automatiquement l'agence
    const validDocTypes = ['AGENCY_LICENSE', 'IDENTITY_CARD', 'REVENUE_PROOF'];
    
    if (doc.ownerType === 'agency' && validDocTypes.includes(doc.type) && status === 'validé') {
      console.log(' Condition déclenchée: Document agence validé');
      console.log('ownerId:', doc.ownerId, 'docType:', doc.type);
      
      const userUpdate = await User.findByIdAndUpdate(doc.ownerId, { isVerified: true }, { new: true });
      console.log('User mis à jour:', userUpdate);
      
      const agencyUpdate = await Agency.findOneAndUpdate(
        { userId: doc.ownerId },
        { isVerifiedByAdmin: true, verificationStatus: 'approved' },
        { new: true }
      );
      console.log('Agency mise à jour:', agencyUpdate);

      // Create notification for agency when document is verified
      await Notification.create({
        recipient: doc.ownerId,
        message: `Votre document de vérification (${doc.type}) a été approuvé. Votre agence est maintenant vérifiée!`,
        type: 'status_change',
        link: '/agency/profile'
      });

      await logActivity(
        req.user.id,
        'user_verified',
        'User',
        doc.ownerId,
        { 
          before: { isVerified: userUpdate === null ? false : !userUpdate.isVerified },
          after: { isVerified: userUpdate.isVerified },
          reason: `Vérification automatique suite à document valide (${doc.type})`,
          notes: `Document: ${doc._id}`
        },
        req.ip,
        req.get('user-agent')
      );
    } else {
      console.log('❌ Condition non déclenchée:', { ownerType: doc.ownerType, type: doc.type, status, validDocs: validDocTypes });
    }

    // Si le document est rejeté et appartient à une agence,
    // on marque l'agence comme rejected et on demande explicitement
    // à l'agence de fournir un nouveau document (notification + audit)
    if (status === 'rejeté' && doc.ownerType === 'agency') {
      try {
        await Agency.findOneAndUpdate(
          { userId: doc.ownerId },
          { isVerifiedByAdmin: false, verificationStatus: 'rejected' },
          { new: true }
        );

        const reasonText = adminNotes ? `Raison: ${adminNotes}` : 'Raison non spécifiée.';

        await Notification.create({
          recipient: doc.ownerId,
          message: `Votre document (${doc.type}) a été rejeté par l'équipe d'administration. ${reasonText} Veuillez télécharger un nouveau document depuis votre tableau de bord.`,
          type: 'status_change',
          link: '/dashboard-agency/documents'
        });

      } catch (err) {
        console.error('Erreur lors du traitement du rejet de document (notification/agency update):', err);
      }
    }

    // Détails avant/après pour le document
    const detailsBefore = {
      status: docBefore.status,
      adminNotes: docBefore.adminNotes,
      verifiedBy: docBefore.verifiedBy
    };

    const detailsAfter = {
      status: doc.status,
      adminNotes: doc.adminNotes,
      verifiedBy: doc.verifiedBy?._id || req.user.id
    };

    await logActivity(
      req.user.id,
      'document_verified',
      'Document',
      req.params.id,
      { 
        before: detailsBefore,
        after: detailsAfter,
        reason: `Document ${status}`,
        notes: `Type: ${doc.type} | ${adminNotes}`
      },
      req.ip,
      req.get('user-agent')
    );

    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    console.error('Erreur verifyDocument:', err);
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

// @desc    Obtenir la croissance des annonces (propriétés) par mois
exports.getPropertiesGrowth = async (req, res) => {
  try {
    const propertiesGrowth = await Property.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({ success: true, data: propertiesGrowth });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Obtenir la croissance des revenus (paiements) par mois
exports.getRevenueGrowth = async (req, res) => {
  try {
    const revenueGrowth = await Payment.aggregate([
      { $match: { status: 'complété' } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({ success: true, data: revenueGrowth });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};