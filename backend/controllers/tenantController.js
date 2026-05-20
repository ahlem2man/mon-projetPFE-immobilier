const Tenant = require('../models/Tenant');
const calculateCompletion = require('../utils/calculateCompletion');
const mongoose = require('mongoose');
const { logUserActivity } = require('./activityLogController');

//  Récupérer tous les dossiers locatifs (pour l'agence)
exports.getAllTenantFiles = async (req, res) => {
  try {
    console.log('[GET /files/all] Récupération de tous les dossiers locatifs');
    
    const User = require('../models/User');
    
    // Récupérer tous les locataires qui ont un profil (avec au moins des documents)
    const tenants = await Tenant.find({
      $or: [
        { 'documents.identityCard': { $exists: true, $ne: null } },
        { completionPercentage: { $gt: 0 } }
      ]
    }).populate('userId', 'fullName email phone').sort('-updatedAt');

    console.log(`[GET /files/all] ${tenants.length} dossiers trouvés`);

    // Formatter les données
    const formattedTenants = tenants.map(tenant => ({
      _id: tenant._id,
      userId: tenant.userId?._id,
      fullName: tenant.userId?.fullName || 'N/A',
      email: tenant.userId?.email || 'N/A',
      phone: tenant.userId?.phone || 'N/A',
      documents: tenant.documents || {},
      completionPercentage: tenant.completionPercentage || 0,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: formattedTenants.length,
      data: formattedTenants
    });
  } catch (error) {
    console.error('[GET /files/all] Erreur:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

// 🆕 Mettre à jour le statut du dossier
exports.updateFileStatus = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { status, note } = req.body;

    console.log(`[PATCH /file/${tenantId}/status] Reçu: tenantId=${tenantId}, status=${status}, note=${note}`);

    // Valider l'ObjectId
    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      console.log(`[PATCH /file/${tenantId}/status] ERREUR: tenantId invalide`);
      return res.status(400).json({ message: "ID tenant invalide" });
    }

    // Valider le statut
    const validStatuses = ['pending', 'verified', 'rejected', 'info_required'];
    if (!validStatuses.includes(status)) {
      console.log(`[PATCH /file/${tenantId}/status] ERREUR: statut invalide=${status}`);
      return res.status(400).json({ message: "Statut invalide" });
    }

    // Récupérer le tenant avant la mise à jour
    const tenantBefore = await Tenant.findById(tenantId);
    console.log(`[PATCH /file/${tenantId}/status] Tenant avant: exists=${!!tenantBefore}, documents=${Object.keys(tenantBefore?.documents || {}).length}`);

    // Mettre à jour le statut et ajouter à l'historique
    const tenant = await Tenant.findByIdAndUpdate(
      tenantId,
      {
        $set: { fileStatus: status },
        $push: {
          fileHistory: {
            status: status,
            note: note || '',
            agencyId: req.user.id,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('userId', 'fullName email phone');

    if (!tenant) {
      console.log(`[PATCH /file/${tenantId}/status] ERREUR: Tenant NOT FOUND après update`);
      return res.status(404).json({ message: "Dossier locataire non trouvé" });
    }

    console.log(`[PATCH /file/${tenantId}/status] ✓ Tenant mis à jour: status=${tenant.fileStatus}, documents=${Object.keys(tenant.documents || {}).length}`);

    // 🆕 Créer une notification au locataire
    const Notification = require('../models/Notification');
    const statusMessages = {
      verified: ' Votre dossier a été approuvé!',
      rejected: ' Votre dossier a été refusé.',
      info_required: ' Des informations supplémentaires sont requises pour votre dossier.',
      pending: ' Votre dossier est en attente de traitement.'
    };

    const notification = await Notification.create({
      recipient: tenant.userId._id,
      message: statusMessages[status],
      type: 'status_change',
      link: '/dashboard/documents'
    });

    console.log(`[PATCH /file/${tenantId}/status] ✓ Notification créée pour ${tenant.userId._id}`);

    res.status(200).json({
      success: true,
      message: `Dossier ${status === 'verified' ? 'vérifié' : status === 'rejected' ? 'rejeté' : status === 'info_required' ? 'en attente d\'infos' : 'en attente'}`,
      data: {
        _id: tenant._id,
        userId: tenant.userId,
        fullName: tenant.userId?.fullName || 'N/A',
        email: tenant.userId?.email || 'N/A',
        phone: tenant.userId?.phone || 'N/A',
        documents: tenant.documents || {},
        completionPercentage: tenant.completionPercentage || 0,
        fileStatus: tenant.fileStatus,
        fileHistory: tenant.fileHistory,
        professionalStatus: tenant.professionalStatus || {},
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt
      }
    });
  } catch (error) {
    console.error(`[PATCH /file/:tenantId/status] Erreur:`, error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

// 🆕 Ajouter une note au dossier
exports.addFileNote = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ message: "La note ne peut pas être vide" });
    }

    console.log(`[POST /file/${tenantId}/note] Reçu: tenantId=${tenantId}, note=${note.substring(0, 50)}...`);

    // Valider l'ObjectId
    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      console.log(`[POST /file/${tenantId}/note] ERREUR: tenantId invalide`);
      return res.status(400).json({ message: "ID tenant invalide" });
    }

    // Ajouter une note à l'historique avec le statut actuel
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      console.log(`[POST /file/${tenantId}/note] ERREUR: Tenant NOT FOUND`);
      return res.status(404).json({ message: "Dossier locataire non trouvé" });
    }
    console.log(`[POST /file/${tenantId}/note] Tenant trouvé: fileStatus=${tenant.fileStatus}`);

    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenantId,
      {
        $push: {
          fileHistory: {
            status: tenant.fileStatus,
            note: note,
            agencyId: req.user.id,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('userId', 'fullName email phone');

    console.log(`[POST /file/${tenantId}/note] ✓ Note ajoutée: documents=${Object.keys(updatedTenant.documents || {}).length}`);

    // 🆕 Créer une notification au locataire que l'agence a ajouté une note
    const Notification = require('../models/Notification');
    const notification = await Notification.create({
      recipient: updatedTenant.userId._id,
      message: '📝 L\'agence a ajouté une note à votre dossier.',
      type: 'status_change',
      link: '/dashboard/documents'
    });

    console.log(`[POST /file/${tenantId}/note] ✓ Notification créée pour ${updatedTenant.userId._id}`);

    res.status(200).json({
      success: true,
      message: "Note enregistrée",
      data: {
        _id: updatedTenant._id,
        userId: updatedTenant.userId,
        fullName: updatedTenant.userId?.fullName || 'N/A',
        email: updatedTenant.userId?.email || 'N/A',
        phone: updatedTenant.userId?.phone || 'N/A',
        documents: updatedTenant.documents || {},
        completionPercentage: updatedTenant.completionPercentage || 0,
        fileStatus: updatedTenant.fileStatus,
        fileHistory: updatedTenant.fileHistory,
        professionalStatus: updatedTenant.professionalStatus || {},
        createdAt: updatedTenant.createdAt,
        updatedAt: updatedTenant.updatedAt
      }
    });
  } catch (error) {
    console.error(`[POST /file/:tenantId/note] Erreur:`, error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
};

// 1. Récupérer le profil du locataire connecté
exports.getTenantProfile = async (req, res) => {
  try {
    console.log('[GET /me] userId:', req.user.id);
    const User = require('../models/User');
    
    let tenant = await Tenant.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id).select('preferences');
    
    console.log('[GET /me] Tenant trouvé:', tenant);
    console.log('[GET /me] User preferences:', user?.preferences);
    
    // NETTOYAGE: Si le Tenant a un champ preferences legacy, le supprimer
    if (tenant && tenant.preferences) {
      console.log('[GET /me]   Tenant a un champ preferences legacy - NETTOYAGE...');
      tenant = await Tenant.findOneAndUpdate(
        { userId: req.user.id },
        { $unset: { preferences: 1 } },
        { new: true }
      );
      console.log('[GET /me]  Champ preferences legacy supprimé du Tenant');
    }
    
    // Construire le response SANS le champ preferences du Tenant
    // Cela garantit qu'on retourne SEULEMENT les données User.preferences
    const response = {
      _id: tenant?._id,
      userId: tenant?.userId,
      profession: tenant?.profession,
      employmentType: tenant?.employmentType,
      income: tenant?.income,
      employer: tenant?.employer,
      professionalStatus: tenant?.professionalStatus || {},
      documents: tenant?.documents || {},
      completionPercentage: tenant?.completionPercentage || 0,
      savedSearches: tenant?.savedSearches || [],
      favoriteProperties: tenant?.favoriteProperties || [],
      createdAt: tenant?.createdAt,
      updatedAt: tenant?.updatedAt,
      __v: tenant?.__v
    };
    
    // TOUJOURS ajouter les préférences du User model (pas du Tenant!)
    if (user?.preferences) {
      response.preferences = user.preferences;
      console.log('[GET /me]  Retourne les préférences du User model');
    } else {
      // Si pas de préférences User, retourner un objet vide
      response.preferences = {
        city: '',
        maxPrice: 0,
        propertyType: '',
        minSurface: 0,
        minRooms: 1,
        moveInDate: null,
        wantedAmenities: []
      };
      console.log('[GET /me]   Pas de préférences User - retourne objet vide');
    }
    
    res.json(response);
  } catch (error) {
    console.error('[GET /me] Erreur:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 1b. Récupérer le profil d'un locataire spécifique (pour l'agence)
exports.getTenantProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[GET /profile/:userId] userId reçu:', userId);
    
    //  Vérifier que c'est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('[GET /profile/:userId] userId INVALIDE:', userId);
      return res.status(400).json({ message: "ID utilisateur invalide" });
    }
    
    const objectId = new mongoose.Types.ObjectId(userId);
    console.log('[GET /profile/:userId] Recherche de tenant avec userId:', objectId);
    
    const tenant = await Tenant.findOne({ userId: objectId }).populate('fileHistory.agencyId', 'name email');
    
    if (!tenant) {
      console.log('[GET /profile/:userId] Tenant NOT FOUND pour userId:', objectId);
      return res.status(404).json({ message: "Profil locataire non trouvé" });
    }
    
    console.log('[GET /profile/:userId] Tenant trouvé:', tenant._id);
    res.json({ 
      success: true,
      data: {
        _id: tenant._id,
        userId: tenant.userId,
        profession: tenant.profession,
        employmentType: tenant.employmentType,
        income: tenant.income,
        employer: tenant.employer,
        professionalStatus: tenant.professionalStatus || {},
        documents: tenant.documents || {},
        completionPercentage: tenant.completionPercentage || 0,
        fileStatus: tenant.fileStatus || 'pending',
        fileHistory: tenant.fileHistory || [],
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt
      }
    });
  } catch (error) {
    console.error('[GET /profile/:userId] Erreur:', error.message);
    res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};

// 2. Mettre à jour le profil et infos professionnelles
exports.updateProfile = async (req, res) => {
  try {
    console.log('[PUT /profile] userId:', req.user.id);
    console.log('[PUT /profile] req.body:', req.body);
    
    const { 
      profession, 
      income, 
      employmentType, 
      employer, 
      professionalStatus, 
      hasGuarantee, 
      guaranteeDetails 
    } = req.body;

    let updateData = {
      userId: req.user.id  //  Utilise req.user.id (du JWT)
    };
    
    if (profession) updateData.profession = profession;
    if (income) updateData.income = income;
    if (employmentType) updateData.employmentType = employmentType;
    if (employer) updateData.employer = employer;
    
    // Situation professionnelle et garant
    if (professionalStatus || hasGuarantee !== undefined || guaranteeDetails) {
      updateData['professionalStatus.status'] = professionalStatus || undefined;
      if (hasGuarantee !== undefined) updateData['professionalStatus.hasGuarantee'] = hasGuarantee;
      if (guaranteeDetails) updateData['professionalStatus.guaranteeDetails'] = guaranteeDetails;
    }

    console.log('[PUT /profile] updateData:', updateData);

    //  Assurer que le Tenant existe avec tous les champs
    let tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      // Créer un nouveau Tenant avec tous les champs initialisés
      tenant = new Tenant({
        userId: req.user.id,
        documents: {},
        professionalStatus: {},
        ...updateData
      });
      await tenant.save();
    } else {
      // Mettre à jour le Tenant existant
      tenant = await Tenant.findOneAndUpdate(
        { userId: req.user.id },
        { $set: updateData },
        { new: true }
      );
    }
    
    // Récupérer les préférences du User pour calculer la complétude
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('preferences');
    const completion = calculateCompletion(tenant, user?.preferences);
    
    const updatedTenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { completionPercentage: completion } },
      { new: true }
    );
    
    // 📝 Log l'activité : Profil locataire mis à jour
    await logUserActivity(
      req.user.id,
      'client',
      'profile_updated',
      'Tenant',
      updatedTenant._id,
      {
        before: {
          profession: tenant?.profession,
          income: tenant?.income,
          employmentType: tenant?.employmentType
        },
        after: {
          profession: updateData.profession,
          income: updateData.income,
          employmentType: updateData.employmentType
        },
        reason: 'Mise à jour du profil locataire',
        notes: `Complétude: ${completion}%`
      },
      req.ip,
      req.get('user-agent')
    );

    console.log('[PUT /profile] Tenant après update:', updatedTenant);
    res.json(updatedTenant);
  } catch (error) {
    console.error('[PUT /profile] Erreur:', error);
    res.status(500).json({ message: error.message });
  }
};

// 2b. Fallback route /update pour compatibilité (Sprint 4)
exports.updateProfileFallback = async (req, res) => {
  try {
    const { 
      profession, 
      income, 
      employmentType, 
      employer, 
      professionalStatus, 
      hasGuarantee, 
      guaranteeDetails 
    } = req.body;

    let updateData = {
      userId: req.user.id  //  FORCE userId!
    };
    
    if (profession) updateData.profession = profession;
    if (income) updateData.income = income;
    if (employmentType) updateData.employmentType = employmentType;
    if (employer) updateData.employer = employer;
    
    // Récupérer le tenant pour calculer la complétude (Étape 8)
    // Assurer que le Tenant existe avec tous les champs initialisés
    let tenant = await Tenant.findOne({ userId: req.user.id });
    if (!tenant) {
      // Créer un nouveau Tenant avec tous les champs initialisés
      tenant = new Tenant({
        userId: req.user.id,
        documents: {},
        professionalStatus: {},
        ...updateData
      });
      await tenant.save();
    } else {
      // Mettre à jour le Tenant existant
      tenant = await Tenant.findOneAndUpdate(
        { userId: req.user.id },
        { $set: updateData },
        { new: true }
      );
    }
    
    // Récupérer les préférences du User pour calculer la complétude
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('preferences');
    const completion = calculateCompletion(tenant, user?.preferences);
    const updatedTenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { completionPercentage: completion } },
      { new: true }
    );
    res.json(updatedTenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Upload de documents complet pour le dossier locatif (Sprint 4 - Étape 7)
exports.uploadDocuments = async (req, res) => {
  try {
    console.log('[POST /upload-docs] userId:', req.user.id);
    console.log('[POST /upload-docs] Files reçus:', Object.keys(req.files || {}));
    
    const updateData = {
      userId: req.user.id  //  FORCE userId!
    };

    // Mapping des fichiers uploadés vers le schéma documents
    const fileMapping = {
      'identityCard': 'documents.identityCard',
      'taxNotice': 'documents.taxNotice',
      'lastThreePayslips': 'documents.lastThreePayslips',
      'employmentContract': 'documents.employmentContract',
      'employerAttestation': 'documents.employerAttestation',
      'rentalReceipts': 'documents.rentalReceipts',
      'propertyTax': 'documents.propertyTax',
      'accommodationAttestation': 'documents.accommodationAttestation',
      'utilityBill': 'documents.utilityBill'
    };

    // Traiter tous les fichiers uploadés
    Object.keys(fileMapping).forEach(fieldName => {
      if (req.files[fieldName] && req.files[fieldName].length > 0) {
        updateData[fileMapping[fieldName]] = req.files[fieldName][0].path;
        console.log(`[POST /upload-docs] ${fieldName} → ${req.files[fieldName][0].path}`);
      }
    });

    console.log('[POST /upload-docs] updateData:', updateData);

    // Vérifier si le Tenant existe
    let tenant = await Tenant.findOne({ userId: req.user.id });
    
    if (!tenant) {
      // Créer un nouveau Tenant avec tous les champs initialisés
      tenant = new Tenant({
        userId: req.user.id,
        documents: {},
        professionalStatus: {},
        ...updateData
      });
      await tenant.save();
      console.log('[POST /upload-docs] Nouveau Tenant créé:', tenant);
    } else {
      // Mettre à jour le Tenant existant
      tenant = await Tenant.findOneAndUpdate(
        { userId: req.user.id },
        { $set: updateData },
        { new: true }
      );
      console.log('[POST /upload-docs] Tenant mis à jour:', tenant);
    }

    if (!tenant) {
      return res.status(500).json({ message: "Erreur lors de la création/mise à jour du profil" });
    }

    // Recalculer la complétude après upload de documents (Étape 8)
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('preferences');
    const completion = calculateCompletion(tenant, user?.preferences);
    tenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { completionPercentage: completion } },
      { new: true }
    );

    res.json({ 
      message: "Dossier locatif complet mis à jour avec succès", 
      documents: tenant.documents,
      completionPercentage: tenant.completionPercentage
    });
  } catch (error) {
    console.error('[POST /upload-docs] Erreur:', error);
    res.status(400).json({ message: error.message });
  }
};

//  3b. Upload d'un seul document (permet updates individuels sans écraser les autres)
exports.uploadSingleDocument = async (req, res) => {
  try {
    const { docType } = req.params;
    const userId = req.user.id;

    console.log(`[POST /upload-doc/${docType}] userId:`, userId);
    console.log(`[POST /upload-doc/${docType}] file:`, req.file?.filename);

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier uploadé" });
    }

    // Valider que docType est valide
    const validDocTypes = [
      'identityCard', 'taxNotice', 'lastThreePayslips', 'employmentContract',
      'employerAttestation', 'rentalReceipts', 'propertyTax', 
      'accommodationAttestation', 'utilityBill'
    ];

    if (!validDocTypes.includes(docType)) {
      return res.status(400).json({ message: "Type de document invalide" });
    }

    // Mettre à jour UNIQUEMENT ce document
    const updateData = {
      [`documents.${docType}`]: req.file.path
    };

    console.log(`[POST /upload-doc/${docType}] updateData:`, updateData);

    // Vérifier si le Tenant existe
    let tenant = await Tenant.findOne({ userId });
    
    if (!tenant) {
      // Créer un nouveau Tenant avec tous les champs initialisés
      tenant = new Tenant({
        userId,
        documents: {
          [docType]: req.file.path
        },
        professionalStatus: {}
      });
      await tenant.save();
      console.log(`[POST /upload-doc/${docType}] Nouveau Tenant créé:`, tenant?.documents);
    } else {
      // Mettre à jour le Tenant existant
      tenant = await Tenant.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true }
      );
      console.log(`[POST /upload-doc/${docType}] Tenant mis à jour:`, tenant?.documents);
    }

    if (!tenant) {
      return res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }

    // Recalculer la complétude avec les préférences du User
    const User = require('../models/User');
    const user = await User.findById(userId).select('preferences');
    const completion = calculateCompletion(tenant, user?.preferences);
    const updatedTenant = await Tenant.findOneAndUpdate(
      { userId },
      { $set: { completionPercentage: completion } },
      { new: true }
    );

    res.json({
      message: `Document ${docType} uploadé avec succès`,
      document: { [docType]: updatedTenant.documents[docType] },
      completionPercentage: updatedTenant.completionPercentage
    });

  } catch (error) {
    console.error(`[POST /upload-doc/:docType] Erreur:`, error);
    res.status(400).json({ message: error.message });
  }
};

//  3c. Supprimer un document
exports.deleteDocument = async (req, res) => {
  try {
    const { docType } = req.params;
    const userId = req.user.id;

    console.log(`[DELETE /delete-doc/${docType}] userId:`, userId);

    // Valider que docType est valide
    const validDocTypes = [
      'identityCard', 'taxNotice', 'lastThreePayslips', 'employmentContract',
      'employerAttestation', 'rentalReceipts', 'propertyTax', 
      'accommodationAttestation', 'utilityBill'
    ];

    if (!validDocTypes.includes(docType)) {
      return res.status(400).json({ message: "Type de document invalide" });
    }

    // Supprimer le document (mettre à null)
    const tenant = await Tenant.findOneAndUpdate(
      { userId },
      { $unset: { [`documents.${docType}`]: "" } },
      { new: true }
    );

    console.log(`[DELETE /delete-doc/${docType}] Document supprimé`);

    if (!tenant) {
      return res.status(500).json({ message: "Erreur lors de la suppression" });
    }

    // Recalculer la complétude avec les préférences du User
    const User = require('../models/User');
    const user = await User.findById(userId).select('preferences');
    const completion = calculateCompletion(tenant, user?.preferences);
    const updatedTenant = await Tenant.findOneAndUpdate(
      { userId },
      { $set: { completionPercentage: completion } },
      { new: true }
    );

    res.json({
      message: `Document ${docType} supprimé avec succès`,
      completionPercentage: updatedTenant.completionPercentage
    });

  } catch (error) {
    console.error(`[DELETE /delete-doc/:docType] Erreur:`, error);
    res.status(400).json({ message: error.message });
  }
};

// ========== RECHERCHES SAUVEGARDÉES (Étape 9) ==========

// Sauvegarder une nouvelle recherche
exports.saveSearch = async (req, res) => {
  try {
    const { label, filters } = req.body;
    
    // Vérifier si le Tenant existe
    let tenant = await Tenant.findOne({ userId: req.user.id || req.user._id });
    
    if (!tenant) {
      // Créer un nouveau Tenant avec tous les champs initialisés
      tenant = new Tenant({
        userId: req.user.id || req.user._id,
        documents: {},
        professionalStatus: {},
        savedSearches: [{ label, filters }]
      });
      await tenant.save();
    } else {
      // Mettre à jour le Tenant existant
      tenant = await Tenant.findOneAndUpdate(
        { userId: req.user.id || req.user._id },
        { $push: { savedSearches: { label, filters } } },
        { new: true }
      );
    }

    res.json({ message: "Recherche sauvegardée !", savedSearches: tenant.savedSearches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une recherche sauvegardée
exports.deleteSearch = async (req, res) => {
  try {
    const { searchId } = req.params;

    // Vérifier si le Tenant existe
    let tenant = await Tenant.findOne({ userId: req.user.id || req.user._id });
    
    if (!tenant) {
      // Si le Tenant n'existe pas, il n'y a rien à supprimer
      return res.status(404).json({ message: "Tenant not found" });
    }

    tenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id || req.user._id },
      { $pull: { savedSearches: { _id: searchId } } },
      { new: true }
    );

    res.json({ message: "Recherche supprimée !", savedSearches: tenant.savedSearches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une recherche sauvegardée spécifique (pour relancer)
exports.getSearch = async (req, res) => {
  try {
    const { searchId } = req.params;

    const tenant = await Tenant.findOne(
      { userId: req.user.id || req.user._id },
      { savedSearches: { $elemMatch: { _id: searchId } } }
    );

    if (!tenant || tenant.savedSearches.length === 0) {
      return res.status(404).json({ message: "Recherche non trouvée" });
    }

    res.json(tenant.savedSearches[0]); // Retourne les filtres de la recherche
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✨ Mettre à jour une recherche sauvegardée (édition)
exports.updateSearch = async (req, res) => {
  try {
    const { searchId } = req.params;
    const { label, filters } = req.body;

    if (!label) {
      return res.status(400).json({ message: "Le nom de la recherche est requis" });
    }

    const tenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id || req.user._id, 'savedSearches._id': searchId },
      {
        $set: {
          'savedSearches.$.label': label,
          'savedSearches.$.filters': filters
        }
      },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ message: "Recherche non trouvée" });
    }

    res.json({ message: "Recherche modifiée !", savedSearches: tenant.savedSearches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== ROUTES FAVORIS (Étape 10) ==========

// Récupérer la liste des IDs de propriétés favorites
exports.getFavorites = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user.id || req.user._id });
    res.json(tenant?.favoriteProperties || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ajouter une propriété aux favoris
exports.addFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const Property = require('../models/Property');

    // Vérifier si la propriété existe
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Propriété non trouvée" });
    }

    // Vérifier si le Tenant existe
    let tenant = await Tenant.findOne({ userId: req.user.id || req.user._id });
    
    if (!tenant) {
      // Créer un nouveau Tenant avec tous les champs initialisés
      tenant = new Tenant({
        userId: req.user.id || req.user._id,
        documents: {},
        professionalStatus: {},
        favoriteProperties: [propertyId]
      });
      await tenant.save();
    } else {
      // Mettre à jour le Tenant existant
      tenant = await Tenant.findOneAndUpdate(
        { userId: req.user.id || req.user._id },
        { $addToSet: { favoriteProperties: propertyId } },
        { new: true }
      );
    }

    // Mettre à jour AUSSI la Property pour garder la sync
    await Property.findByIdAndUpdate(
      propertyId,
      { $addToSet: { favorites: req.user.id || req.user._id } },
      { new: true }
    );

    //  Log l'activité : Propriété ajoutée aux favoris
    await logUserActivity(
      req.user.id || req.user._id,
      'client',
      'property_favorited',
      'Property',
      propertyId,
      {
        before: null,
        after: {
          propertyId: propertyId,
          title: property.title,
          favorited: true
        },
        reason: 'Ajout aux favoris',
        notes: `Propriété: ${property.title}`
      },
      req.ip,
      req.get('user-agent')
    );

    res.json({ 
      message: "Propriété ajoutée aux favoris !", 
      favorites: tenant.favoriteProperties,
      success: true 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une propriété des favoris
exports.removeFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const Property = require('../models/Property');

    // Vérifier si le Tenant existe
    let tenant = await Tenant.findOne({ userId: req.user.id || req.user._id });
    
    if (!tenant) {
      // Si le Tenant n'existe pas, il n'y a rien à supprimer
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Récupérer les infos de la propriété pour le log
    const property = await Property.findById(propertyId);

    // Mettre à jour SIMULTANÉMENT le Tenant et la Property
    const [updatedTenant, updatedProperty] = await Promise.all([
      Tenant.findOneAndUpdate(
        { userId: req.user.id || req.user._id },
        { $pull: { favoriteProperties: propertyId } },
        { new: true }
      ),
      Property.findByIdAndUpdate(
        propertyId,
        { $pull: { favorites: req.user.id || req.user._id } },
        { new: true }
      )
    ]);

    // 📝 Log l'activité : Propriété retirée des favoris
    await logUserActivity(
      req.user.id || req.user._id,
      'client',
      'property_unfavorited',
      'Property',
      propertyId,
      {
        before: {
          propertyId: propertyId,
          favorited: true
        },
        after: null,
        reason: 'Suppression des favoris',
        notes: `Propriété: ${property?.title || 'Unknown'}`
      },
      req.ip,
      req.get('user-agent')
    );

    res.json({ 
      message: "Propriété supprimée des favoris !", 
      favorites: updatedTenant.favoriteProperties,
      success: true 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vérifier si une propriété est en favoris
exports.checkFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const tenant = await Tenant.findOne({ userId: req.user.id || req.user._id });
    const isFavorite = tenant?.favoriteProperties?.includes(propertyId) || false;

    res.json({ isFavorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
