const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const upload = require('../middleware/upload');
const protect = require('../middleware/auth'); // Ton middleware d'auth du Sprint 2
const calculateCompletion = require('../utils/calculateCompletion'); // Importance: Calcul de complétude Sprint 4 Étape 8

// 1. Récupérer le profil du locataire connecté
router.get('/me', protect, async (req, res) => {
  try {
    console.log('[GET /me] userId:', req.user.id);
    const tenant = await Tenant.findOne({ userId: req.user.id });
    console.log('[GET /me] Tenant trouvé:', tenant);
    res.json(tenant);
  } catch (error) {
    console.error('[GET /me] Erreur:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 2. Mettre à jour le profil et infos professionnelles
router.put('/profile', protect, async (req, res) => {
  try {
    console.log('[PUT /profile] userId:', req.user.id);
    console.log('[PUT /profile] req.body:', req.body);
    
    const { profession, income, preferences, employmentType, employer, professionalStatus, hasGuarantee, guaranteeDetails } = req.body;

    let updateData = {
      userId: req.user.id  //  Utilise req.user.id (du JWT)
    };
    
    if (profession) updateData.profession = profession;
    if (income) updateData.income = income;
    if (preferences) updateData.preferences = preferences;
    if (employmentType) updateData.employmentType = employmentType;
    if (employer) updateData.employer = employer;
    
    // Situation professionnelle et garant
    if (professionalStatus || hasGuarantee !== undefined || guaranteeDetails) {
      updateData['professionalStatus.status'] = professionalStatus || undefined;
      if (hasGuarantee !== undefined) updateData['professionalStatus.hasGuarantee'] = hasGuarantee;
      if (guaranteeDetails) updateData['professionalStatus.guaranteeDetails'] = guaranteeDetails;
    }

    console.log('[PUT /profile] updateData:', updateData);

    const updatedTenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );
    
    // Calculer et mettre à jour la complétude (Étape 8)
    const completion = calculateCompletion(updatedTenant);
    updatedTenant.completionPercentage = completion;
    await updatedTenant.save();
    
    console.log('[PUT /profile] Tenant après update:', updatedTenant);
    res.json(updatedTenant);
  } catch (error) {
    console.error('[PUT /profile] Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// 2b. Route fallback /update pour compatibilité (Sprint 4)
router.put('/update', protect, async (req, res) => {
  try {
    const { profession, income, preferences, employmentType, employer, professionalStatus, hasGuarantee, guaranteeDetails } = req.body;

    let updateData = {
      userId: req.user.id  // 🔧 FORCE userId!
    };
    
    if (profession) updateData.profession = profession;
    if (income) updateData.income = income;
    if (preferences) updateData.preferences = preferences;
    if (employmentType) updateData.employmentType = employmentType;
    if (employer) updateData.employer = employer;
    
    // Récupérer le tenant pour calculer la complétude (Étape 8)
    let tenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );
    const completion = calculateCompletion(tenant);
    const updatedTenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { completionPercentage: completion } },
      { new: true }
    );
    res.json(updatedTenant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Upload de documents complet pour le dossier locatif (Sprint 4 - Étape 7 - DOCUMENTS SEULEMENT)
router.post('/upload-docs', protect, upload.fields([
  { name: 'identityCard', maxCount: 1 },
  { name: 'taxNotice', maxCount: 1 },
  { name: 'lastThreePayslips', maxCount: 1 },
  { name: 'employmentContract', maxCount: 1 },
  { name: 'employerAttestation', maxCount: 1 },
  { name: 'rentalReceipts', maxCount: 1 },
  { name: 'propertyTax', maxCount: 1 },
  { name: 'accommodationAttestation', maxCount: 1 },
  { name: 'utilityBill', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('[POST /upload-docs] userId:', req.user.id);
    console.log('[POST /upload-docs] Files reçus:', Object.keys(req.files || {}));
    
    const updateData = {
      userId: req.user.id  // 🔧 FORCE userId!
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

    // Mise à jour du locataire (avec upsert pour créer s'il n'existe pas)
    let tenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    console.log('[POST /upload-docs] Tenant après update:', tenant);

    if (!tenant) {
      return res.status(500).json({ message: "Erreur lors de la création/mise à jour du profil" });
    }

    // Recalculer la complétude après upload de documents (Étape 8)
    const completion = calculateCompletion(tenant);
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
});


// Sauvegarder une nouvelle recherche (Étape 9)
router.post('/save-search', protect, async (req, res) => {
  try {
    const { label, filters } = req.body;
    
    const tenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id || req.user._id },
      { $push: { savedSearches: { label, filters } } },
      { new: true }
    );

    res.json({ message: "Recherche sauvegardée !", savedSearches: tenant.savedSearches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer une recherche sauvegardée (Étape 9)
router.delete('/delete-search/:searchId', protect, async (req, res) => {
  try {
    const { searchId } = req.params;

    const tenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id || req.user._id },
      { $pull: { savedSearches: { _id: searchId } } },
      { new: true }
    );

    res.json({ message: "Recherche supprimée !", savedSearches: tenant.savedSearches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer une recherche sauvegardée spécifique (pour relancer)
router.get('/search/:searchId', protect, async (req, res) => {
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
});

// ========== ROUTES FAVORIS (Étape 10) ==========

// Récupérer la liste des IDs de propriétés favorites
router.get('/favorites', protect, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ userId: req.user.id || req.user._id });
    res.json(tenant?.favoriteProperties || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ajouter une propriété aux favoris
router.post('/favorites/:propertyId', protect, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const tenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id || req.user._id },
      { $addToSet: { favoriteProperties: propertyId } }, // $addToSet évite les doublons
      { new: true }
    );

    res.json({ message: "Propriété ajoutée aux favoris !", favorites: tenant.favoriteProperties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Supprimer une propriété des favoris
router.delete('/favorites/:propertyId', protect, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const tenant = await Tenant.findOneAndUpdate(
      { userId: req.user.id || req.user._id },
      { $pull: { favoriteProperties: propertyId } },
      { new: true }
    );

    res.json({ message: "Propriété supprimée des favoris !", favorites: tenant.favoriteProperties });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vérifier si une propriété est en favoris
router.get('/favorites/check/:propertyId', protect, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const tenant = await Tenant.findOne({ userId: req.user.id || req.user._id });
    const isFavorite = tenant?.favoriteProperties?.includes(propertyId) || false;

    res.json({ isFavorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;