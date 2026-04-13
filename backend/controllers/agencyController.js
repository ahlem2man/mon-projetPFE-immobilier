const Agency = require('../models/Agency');
const Property = require('../models/Property');
const Request = require('../models/Request');
const Matching = require('../models/Matching');

// 1. Récupérer le profil de l'agence connectée AVEC statistiques
exports.getAgencyProfile = async (req, res) => {
  try {
    const agency = await Agency.findOne({ userId: req.user.id });
    if (!agency) return res.status(404).json({ message: "Profil agence non trouvé" });

    // Calculer les statistiques
    const properties = await Property.find({ owner: req.user.id });
    
    const activeAds = properties.filter(p => p.status === 'active').length;
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
    const agency = await Agency.findOneAndUpdate(
      { userId: req.user.id },
      { agencyName, licenseNumber, address, phoneNumber, description, website },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ message: "Profil mis à jour", data: agency });
  } catch (error) {
    res.status(400).json({ message: "Erreur mise à jour", error: error.message });
  }
};

// 3. Ajouter un document au dossier
exports.uploadVerificationDocs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    const { docType } = req.body;
    
    // Construction du chemin du fichier
    const fileUrl = `/uploads/${req.file.filename}`;

    const agency = await Agency.findOneAndUpdate(
      { userId: req.user.id },
      { 
        $push: { verificationDocs: { docType, fileUrl, uploadedAt: new Date() } },
        verificationStatus: 'pending' 
      },
      { new: true }
    );
    
    res.status(200).json({ 
      message: "Document téléchargé avec succès", 
      data: agency 
    });
  } catch (error) {
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
    res.status(200).json({ message: "Demande envoyée", status: agency.verificationStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Validation par l'Admin
exports.adminVerifyAgency = async (req, res) => {
  try {
    const { agencyId, status } = req.body; 
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