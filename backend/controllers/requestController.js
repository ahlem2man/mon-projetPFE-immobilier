const Request = require('../models/Request');
const Property = require('../models/Property');
const { createNotification } = require('./notificationController');
const { sendApplicationStatusEmail } = require('../utils/emailService');


// @desc    Soumettre une nouvelle candidature
// @route   POST /api/requests
// @access  Private (Tenant)
exports.submitRequest = async (req, res) => {
  try {
    console.log("=== SUBMIT REQUEST ===");
    console.log("Body reçu:", req.body);
    console.log("User ID:", req.user?.id);
    
    const { propertyId, message } = req.body;
    const tenantId = req.user.id; // Récupéré via le middleware protect

    console.log("Looking for property with ID:", propertyId);

    // 1. Vérification : Est-ce que la propriété existe ?
    const property = await Property.findById(propertyId);
    console.log("Property found:", property ? "YES" : "NO");
    
    if (!property) {
      return res.status(404).json({ message: "Cette propriété n'existe plus." });
    }

    console.log("Property owner:", property.owner);

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
      status: 'En attente',
      // Initialiser la statusHistory avec le premier événement
      statusHistory: [
        {
          status: 'En attente',
          comment: 'Candidature soumise'
        }
      ]
    });

    console.log("New request object created:", newRequest);

    const savedRequest = await newRequest.save();
    
    console.log("Request saved successfully:", savedRequest._id);

    res.status(201).json({
      success: true,
      message: "Votre candidature a été transmise avec succès !",
      data: savedRequest
    });
  } catch (error) {
    console.error("ERROR in submitRequest:", error);
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


exports.getRequestById = async (req, res) => {
  try {
    // On récupère la candidature et on "peuple" les infos du bien ET du locataire
    const request = await Request.findById(req.params.requestId)
      .populate('propertyId', 'title price location images owner')
      .populate('tenantId', 'email name'); // ✨ IMPORTANT: Populate pour avoir accès à email et name

    if (!request) {
      return res.status(404).json({ message: "Candidature introuvable." });
    }

    // Sécurité : Seul le locataire concerné ou le propriétaire peut voir les détails
    // ⚠️ IMPORTANT: Après populate(), tenantId et ownerId sont des objets, pas des strings!
    if (request.tenantId._id.toString() !== req.user.id && request.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès non autorisé." });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: error.message });
  }
};

// @desc    Changer le statut d'une candidature (Agence/Propriétaire)
// @route   PATCH /api/requests/:requestId
// @access  Private (Owner)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, comment } = req.body;

    // Vérification : La candidature existe-t-elle ?
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Candidature introuvable' });
    }

    // Sécurité : Seul le propriétaire du bien peut changer le statut
    if (request.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette candidature' });
    }

    // Ajouter le changement à statusHistory
    request.statusHistory.push({
      status: status,
      date: new Date(),
      comment: comment || ''
    });

    // Mettre à jour le statut actuel
    request.status = status;
    await request.save();

    // Recharger la request avec les données peuplées (pour avoir email, name, etc)
    await request.populate('tenantId', 'email name');
    await request.populate('propertyId', 'title');
    
    // Envoyer l'email au locataire
    try {
      await sendApplicationStatusEmail(
        request.tenantId.email, 
        request.tenantId.name, 
        request.propertyId.title, 
        status
      );
      console.log("📧 Email envoyé à " + request.tenantId.email);
    } catch (err) {
      console.error("❌ Erreur Email:", err.message);
      // Ne pas bloquer la requête si l'email échoue
    }

    // Créer une notification pour le locataire
    const property = await Property.findById(request.propertyId);
    const message = `Votre candidature pour "${property?.title || 'un bien'}" a été mise à jour: ${status}`;
    const link = `/dashboard/applications/${requestId}`;
    await createNotification(request.tenantId, message, link, 'status_change');

    console.log(`✅ Notification créée pour ${request.tenantId}: ${message}`);

    res.json({
      success: true,
      message: `Statut changé en ${status}`,
      request: request
    });
  } catch (error) {
    console.error('Erreur updateRequestStatus:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};