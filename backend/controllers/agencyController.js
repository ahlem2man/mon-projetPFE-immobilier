const Agency = require('../models/Agency');
const Property = require('../models/Property');
const Request = require('../models/Request');
const Matching = require('../models/Matching');
const { logUserActivity } = require('./activityLogController');
const { notifyAdmins } = require('./notificationController');

// 1. Récupérer le profil de l'agence connectée AVEC statistiques
exports.getAgencyProfile = async (req, res) => {
  try {
    const agency = await Agency.findOne({ userId: req.user.id });
    if (!agency) return res.status(404).json({ message: "Profil agence non trouvé" });

    // Calculer les statistiques
    const properties = await Property.find({ owner: req.user.id });
    
    const activeAds = properties.filter(p => p.status === 'disponible').length;
    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
    
    const pendingRequests = await Request.countDocuments({ 
      propertyId: { $in: properties.map(p => p._id) }
    });
    
    // Stats calculées
    const stats = {
      activeAds,
      totalViews,
      pendingRequests
    };
    
    // Retourner agence + stats + rating
    res.status(200).json({
      ...agency.toObject(),
      stats,
      rating: agency.rating || 0
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 2. Créer ou Mettre à jour le profil (UPSERT)
exports.updateAgencyProfile = async (req, res) => {
  try {
    const { agencyName, licenseNumber, address, phoneNumber, description, website } = req.body;
    
    // Récupérer l'état AVANT
    const agencyBefore = await Agency.findOne({ userId: req.user.id });
    const stateBefore = agencyBefore ? {
      agencyName: agencyBefore.agencyName,
      address: agencyBefore.address,
      phoneNumber: agencyBefore.phoneNumber,
      description: agencyBefore.description,
      website: agencyBefore.website
    } : {};

    const agency = await Agency.findOneAndUpdate(
      { userId: req.user.id },
      { agencyName, licenseNumber, address, phoneNumber, description, website },
      { new: true, upsert: true, runValidators: true }
    );

    // 📝 Log l'activité : Profil agence modifié
    await logUserActivity(
      req.user.id,
      'agency',
      'agency_profile_updated',
      'Agency',
      agency._id,
      {
        before: stateBefore,
        after: {
          agencyName: agency.agencyName,
          address: agency.address,
          phoneNumber: agency.phoneNumber,
          description: agency.description,
          website: agency.website
        },
        reason: 'Mise à jour du profil agence',
        notes: `Agence: ${agency.agencyName}`
      },
      req.ip,
      req.get('user-agent')
    );

    res.status(200).json({ message: "Profil mis à jour", data: agency });
  } catch (error) {
    res.status(400).json({ message: "Erreur mise à jour", error: error.message });
  }
};

// 2b. Upload du logo de l'agence
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const agency = await Agency.findOneAndUpdate(
      { userId: req.user.id },
      { logo: fileUrl },
      { new: true }
    );
    
    res.status(200).json({ 
      message: "Logo mis à jour avec succès",
      data: agency
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du téléchargement du logo", error: error.message });
  }
};

// 3. Ajouter un document au dossier
exports.uploadVerificationDocs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    const { docType } = req.body;
    console.log('Upload initié - docType:', docType, 'userId:', req.user.id);
    
    // Mapping des types de documents français vers les enums du modèle
    const docTypeMap = {
      'Kbis': 'AGENCY_LICENSE',
      'CartePro': 'IDENTITY_CARD',
      'Assurance': 'REVENUE_PROOF'
    };

    const mappedType = docTypeMap[docType] || 'OTHER';
    
    // Construction du chemin du fichier
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log('Fichier uploadé:', req.file.filename, '-> URL:', fileUrl);

    // Créer un enregistrement dans la collection Document
    const Document = require('../models/Document');
    const docRecord = await Document.create({
      ownerId: req.user.id,
      ownerType: 'agency',
      type: mappedType,
      fileUrl: fileUrl,
      status: 'en attente'
    });
    console.log('Document créé:', docRecord._id);

    const agency = await Agency.findOneAndUpdate(
      { userId: req.user.id },
      { 
        $push: { verificationDocs: { docType, fileUrl, uploadedAt: new Date(), documentId: docRecord._id } },
        verificationStatus: 'pending' 
      },
      { new: true }
    );
    // Notifier les admins qu'un document a été uploadé
    try {
      await notifyAdmins(
        `Nouvelle pièce soumise pour vérification par l'agence ${agency.agencyName || req.user.id}`,
        '/dashboard-admin/documents',
        'status_change'
      );
    } catch (e) {
      console.error('Erreur notification admins upload doc:', e);
    }
    
    res.status(200).json({ 
      message: "Document téléchargé avec succès", 
      data: agency,
      document: docRecord
    });
  } catch (error) {
    console.error('Erreur upload document:', error);
    res.status(500).json({ message: "Erreur lors du téléchargement", error: error.message });
  }
};

// 4. Envoyer officiellement le dossier en vérification
exports.submitForVerification = async (req, res) => {
  try {
    const agency = await Agency.findOneAndUpdate(
      { userId: req.user.id },
      { verificationStatus: 'pending' }, 
      { new: true }
    );
    // Notifier les admins qu'une agence a soumis son dossier pour vérification
    try {
      await notifyAdmins(
        `L'agence ${agency.agencyName || req.user.id} a soumis son dossier pour vérification.`,
        '/dashboard-admin/documents',
        'status_change'
      );
    } catch (e) {
      console.error('Erreur notification admins submit verification:', e);
    }
    res.status(200).json({ message: "Demande envoyée", status: agency.verificationStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Validation par l'Admin
exports.adminVerifyAgency = async (req, res) => {
  try {
    const { agencyId, status } = req.body;
    
    // Si on essaie d'approuver, vérifier qu'il y a au moins un document
    if (status === 'approved') {
      const agency = await Agency.findById(agencyId);
      const hasValidDoc = agency && agency.verificationDocs && agency.verificationDocs.length > 0;
      
      if (!hasValidDoc) {
        return res.status(400).json({ 
          message: "L'agence doit avoir au moins un document de vérification (Kbis, Carte Pro ou Attestation Assurance) pour être vérifiée." 
        });
      }
    }
    
    const agency = await Agency.findByIdAndUpdate(
      agencyId,
      { 
        verificationStatus: status,
        isVerifiedByAdmin: status === 'approved'
      },
      { new: true }
    );
    res.status(200).json({ message: `Agence mise à jour : ${status}`, data: agency });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Dashboard Global Analytics - Agrégation de toutes les propriétés
exports.getGlobalAnalytics = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id });
    
    if (!properties.length) {
      return res.status(200).json({
        totalProperties: 0,
        totalViews: 0,
        totalFavorites: 0,
        totalRequests: 0,
        activeAds: 0,
        propertiesByStatus: { active: 0, inactive: 0, sold: 0, rented: 0 },
        propertyList: []
      });
    }

    const propertyIds = properties.map(p => p._id);
    
    // Compter les favoris (propriétés ajoutées dans les favoris des utilisateurs)
    const totalFavorites = await Matching.countDocuments({
      propertyId: { $in: propertyIds }
    });
    
    // Compter les candidatures/demandes
    const totalRequests = await Request.countDocuments({
      propertyId: { $in: propertyIds }
    });
    
    // Statistiques par propriété
    const propertyStats = properties.map(prop => ({
      _id: prop._id,
      title: prop.title,
      status: prop.status,
      views: prop.views || 0,
      favorites: prop.favorites?.length || 0,
      price: prop.price,
      type: prop.type,
      createdAt: prop.createdAt
    }));
    
    // Agrégations
    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
    const activeAds = properties.filter(p => p.status === 'disponible').length;
    const propertiesByStatus = {
      disponible: properties.filter(p => p.status === 'disponible').length,
      louée: properties.filter(p => p.status === 'louée').length,
      en_attente: properties.filter(p => p.status === 'en attente').length,
      inactive: properties.filter(p => p.status === 'inactive').length
    };
    
    res.status(200).json({
      totalProperties: properties.length,
      totalViews,
      totalFavorites,
      totalRequests,
      activeAds,
      propertiesByStatus,
      propertyList: propertyStats
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des analytics globales", error: error.message });
  }
};