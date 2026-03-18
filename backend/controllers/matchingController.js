const Matching = require('../models/Matching');
const Property = require('../models/Property');
const User = require('../models/User');
const { calculateMatchScore } = require('../utils/matchingAlgo'); // On va l'utiliser ici

// @desc    Sauvegarder les préférences de l'utilisateur (UPDATE pour le modèle User)
// @route   POST /api/matchings/save-preferences
exports.saveUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({ message: "Préférences manquantes" });
    }

    console.log('[POST /save-preferences] userId:', userId);
    console.log('[POST /save-preferences] preferences reçues:', preferences);

    // Sauvegarder directement dans le modèle User (pas Tenant)
    const user = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true, runValidators: true }
    );

    console.log('[POST /save-preferences] User après update:', {
      id: user._id,
      preferences: user.preferences
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({
      success: true,
      message: "Préférences sauvegardées avec succès",
      preferences: user.preferences,
      data: user
    });

  } catch (error) {
    console.error('[POST /save-preferences] Erreur:', error.message);
    res.status(500).json({ message: "Erreur lors de la sauvegarde", error: error.message });
  }
};

// @desc    Récupérer les préférences de l'utilisateur
// @route   GET /api/matchings/preferences
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('preferences');

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({
      success: true,
      preferences: user.preferences
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur de récupération", error: error.message });
  }
};

// @desc    Générer ou mettre à jour les matchings pour l'utilisateur connecté
// @route   POST /api/matchings/generate
exports.generateUserMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || !user.preferences) {
      return res.status(400).json({ message: "Veuillez compléter vos préférences de profil d'abord." });
    }

    // 1. Récupérer toutes les propriétés (sauf celles de l'utilisateur s'il est aussi agence)
    const properties = await Property.find({ owner: { $ne: userId } });

    const matchResults = [];
    let skippedCount = 0; // Compteur pour propriétés exclues

    // 2. Boucler sur chaque propriété pour calculer le score
    for (const property of properties) {
      const result = calculateMatchScore(user.preferences, property);
      
      // Si résultat est null = propriété non disponible → exclure
      if (result === null) {
        skippedCount++;
        continue;
      }

      const { score, details } = result;

      // 3. Enregistrer ou mettre à jour le matching dans la base de données
      // upsert: true permet de créer si ça n'existe pas, ou mettre à jour si ça existe
      const match = await Matching.findOneAndUpdate(
        { tenantId: userId, propertyId: property._id },
        { 
          score, 
          details,
          status: 'active' 
        },
        { upsert: true, new: true }
      );
      
      matchResults.push(match);
    }

    // Trier par score décroissant
    matchResults.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      message: `${matchResults.length} matchings calculés avec succès.`,
      totalProperties: properties.length,
      matchingsCount: matchResults.length,
      skippedCount: skippedCount, // Propriétés non disponibles exclues
      data: matchResults.slice(0, 50) // Afficher les 50 meilleurs
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la génération des matchings", error: error.message });
  }
};

// @desc    Récupérer les matchings de l'utilisateur avec les détails des biens
// @route   GET /api/matchings
exports.getUserMatches = async (req, res) => {
  try {
    // Récupérer le paramètre limit depuis la query (par défaut 50, max 100)
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    
    const matches = await Matching.find({ 
      tenantId: req.user.id, 
      status: 'active',
      score: { $gte: 10 } // Filtrer les matchings avec score >= 10 pour éviter du bruit
    })
    .populate({
      path: 'propertyId',
      select: 'title price location images type surface amenities' // Inclure les amenities
    })
    .sort({ score: -1 }) // Tri par score décroissant
    .limit(limit);

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur de récupération", error: error.message });
  }
};

// @desc    Soumettre un retour sur un matching (utile/pas utile)
// @route   POST /api/matchings/:matchingId/feedback
exports.submitMatchingFeedback = async (req, res) => {
  try {
    const { matchingId } = req.params;
    const { feedback } = req.body; // 'useful' ou 'not_useful'

    if (!['useful', 'not_useful'].includes(feedback)) {
      return res.status(400).json({ message: "Feedback invalide. Utilisez 'useful' ou 'not_useful'" });
    }

    const matching = await Matching.findById(matchingId);

    if (!matching) {
      return res.status(404).json({ message: "Matching introuvable" });
    }

    // Vérifier que c'est le proprietaire du matching
    if (matching.tenantId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Mettre à jour le feedback
    matching.userFeedback = feedback;
    await matching.save();

    res.json({
      success: true,
      message: `Merci pour votre retour: ${feedback}`,
      data: matching
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la soumission du feedback", error: error.message });
  }
};

// @desc    Archiver un matching
// @route   POST /api/matchings/:matchingId/archive
exports.archiveMatching = async (req, res) => {
  try {
    const { matchingId } = req.params;

    const matching = await Matching.findById(matchingId);

    if (!matching) {
      return res.status(404).json({ message: "Matching introuvable" });
    }

    // Vérifier l'accès
    if (matching.tenantId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Archiver
    matching.status = 'archived';
    await matching.save();

    res.json({
      success: true,
      message: "Matching archivé",
      data: matching
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'archivage", error: error.message });
  }
};

// @desc    Obtenir l'historique des matchings (archivés et actifs)
// @route   GET /api/matchings/history
exports.getMatchingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query; // 'active', 'archived', ou vide pour tous
    
    let filter = { tenantId: userId };
    if (status && ['active', 'archived', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const matches = await Matching.find(filter)
      .populate({
        path: 'propertyId',
        select: 'title price location images type'
      })
      .sort({ createdAt: -1 })
      .limit(100);

    const stats = {
      active: await Matching.countDocuments({ tenantId: userId, status: 'active' }),
      archived: await Matching.countDocuments({ tenantId: userId, status: 'archived' }),
      useful: await Matching.countDocuments({ tenantId: userId, userFeedback: 'useful' }),
      not_useful: await Matching.countDocuments({ tenantId: userId, userFeedback: 'not_useful' })
    };

    res.json({
      success: true,
      stats,
      count: matches.length,
      data: matches
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur de récupération historique", error: error.message });
  }
};

// @desc    Déclencher manuellement le matching (admin ou test)
// @route   POST /api/matchings/manual-trigger
exports.manuallyTriggerMatching = async (req, res) => {
  try {
    // Vérifier que c'est un admin
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: "Accès réservé aux administrateurs" });
    }

    const { runMatchingManually } = require('../utils/cronJobs');
    
    const result = await runMatchingManually();

    res.json({
      success: true,
      message: "Matching déclenché manuellement",
      data: result
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur lors du déclenchement manuel", error: error.message });
  }
};

// @desc    DEBUG: Vérifier les données de l'utilisateur et de l'algorithme
// @route   GET /api/matchings/debug/user-data
exports.debugUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('preferences role email');
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Récupérer quelques propriétés
    const properties = await Property.find().limit(3).select('title location price type amenities');

    // Tester l'algorithme avec la première propriété
    let testResult = null;
    if (properties.length > 0) {
      const { calculateMatchScore } = require('../utils/matchingAlgo');
      testResult = calculateMatchScore(user.preferences, properties[0]);
    }

    res.json({
      success: true,
      userPreferences: user.preferences,
      userRole: user.role,
      testProperty: properties[0],
      algorithmTestResult: testResult,
      totalPropertiesInDB: await Property.countDocuments(),
      message: "Données de debug"
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur debug", error: error.message });
  }
};

// @desc    DEBUG: Tester l'algorithme avec des données spécifiques
// @route   POST /api/matchings/debug/test-algo
exports.debugTestAlgo = async (req, res) => {
  try {
    const { preferences, property } = req.body;

    if (!preferences || !property) {
      return res.status(400).json({ 
        message: "Envoyer preferences et property",
        example: {
          preferences: { city: "Paris", maxPrice: 1500, propertyType: "Appartement", wantedAmenities: ["Parking"] },
          property: { location: "Paris", price: 1200, type: "Appartement", amenities: ["Parking", "WiFi"] }
        }
      });
    }

    const { calculateMatchScore } = require('../utils/matchingAlgo');
    const result = calculateMatchScore(preferences, property);

    res.json({
      success: true,
      inputPreferences: preferences,
      inputProperty: property,
      output: result,
      message: "Test algorithme réussi"
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur test algo", error: error.message });
  }
};