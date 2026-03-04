const Request = require('../models/Request');
const Property = require('../models/Property');

// @desc    Soumettre une nouvelle candidature
// @route   POST /api/requests
// @access  Private (Tenant)
exports.submitRequest = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    const tenantId = req.user.id; // Récupéré via le middleware protect

    // 1. Vérification : Est-ce que la propriété existe ?
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Cette propriété n'existe plus." });
    }

    // 2. Vérification : Le locataire a-t-il déjà postulé ?
    const existingRequest = await Request.findOne({ tenantId, propertyId });
    if (existingRequest) {
      return res.status(400).json({ message: "Vous avez déjà envoyé une candidature pour ce bien." });
    }

    // 3. Création de la candidature
    const newRequest = new Request({
      tenantId,
      propertyId,
      ownerId: property.owner, // On lie automatiquement l'agence/propriétaire
      message,
      status: 'En attente'
    });

    const savedRequest = await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Votre candidature a été transmise avec succès !",
      data: savedRequest
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la soumission", error: error.message });
  }
};

// @desc    Obtenir les candidatures du locataire connecté
// @route   GET /api/requests/my-requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ tenantId: req.user.id })
      .populate('propertyId', 'title price location images') // On récupère les infos du bien pour l'affichage
      .sort('-createdAt');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};