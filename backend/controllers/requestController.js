const mongoose = require('mongoose');
const Request = require('../models/Request');
const Property = require('../models/Property');
const { createNotification } = require('./notificationController');
const { sendApplicationStatusEmail } = require('../utils/emailService');


exports.submitRequest = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    const tenantId = req.user.id;

    // 1. Vérifier la propriété existe
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Cette propriété n'existe plus." });
    }

    // 2. Vérifier candidature pas déjà soumise
    const existingRequest = await Request.findOne({ tenantId, propertyId });
    if (existingRequest) {
      return res.status(400).json({ message: "Vous avez déjà envoyé une candidature pour ce bien." });
    }

    // 3. Vérifier que le dossier du Tenant est COMPLET (100%) + récupérer ses infos
    let monthlyIncome = null;
    let employmentStatus = null;
    let documents = [];
    
    try {
      const Tenant = require('../models/Tenant');
      const tenant = await Tenant.findOne({ userId: tenantId });
      
      if (!tenant) {
        return res.status(400).json({ message: "Profil locataire non trouvé. Complétez votre profil d'abord." });
      }

      // ⚠️ VÉRIFICATION CRITIQUE: Le dossier doit être complet à 100%
      if (tenant.completionPercentage < 100) {
        return res.status(400).json({ 
          message: `Votre dossier n'est complété qu'à ${tenant.completionPercentage}%. Veuillez le compléter à 100% avant de postuler.`,
          completionPercentage: tenant.completionPercentage
        });
      }

      // Récupérer les infos du Tenant
      monthlyIncome = tenant.income || null;
      employmentStatus = tenant.professionalStatus?.status || null;

      // Construire l'array des documents du Tenant
      if (tenant.documents && Object.keys(tenant.documents).length > 0) {
        const docMapping = {
          identityCard: 'Pièce d\'identité',
          taxNotice: 'Avis d\'imposition',
          lastThreePayslips: 'Trois derniers bulletins de salaire',
          employmentContract: 'Contrat de travail',
          employerAttestation: 'Attestation employeur',
          rentalReceipts: 'Quittances de loyer',
          propertyTax: 'Taxe foncière',
          accommodationAttestation: 'Attestation d\'hébergement',
          utilityBill: 'Facture de domicile'
        };
        
        for (const [key, filePath] of Object.entries(tenant.documents)) {
          if (filePath && typeof filePath === 'string') {
            documents.push({
              name: docMapping[key] || key,
              url: filePath,
              type: 'PDF'
            });
          }
        }
      }

    } catch (err) {
      console.error("Erreur lors de la récupération du Tenant:", err.message);
      return res.status(500).json({ message: "Erreur lors de la vérification du profil" });
    }

    // 4. Créer la candidature avec insertOne() pour contourner la validation Mongoose
    const requestData = {
      tenantId: mongoose.Types.ObjectId.createFromHexString(tenantId),
      propertyId: mongoose.Types.ObjectId.createFromHexString(propertyId),
      ownerId: mongoose.Types.ObjectId.createFromHexString(property.owner.toString()),
      message: message || '',
      status: 'En attente',
      monthlyIncome: monthlyIncome,
      employmentStatus: employmentStatus,
      documents: documents,
      statusHistory: [
        {
          status: 'En attente',
          date: new Date(),
          comment: 'Candidature soumise'
        }
      ],
      internalNotes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insérer directement dans MongoDB pour éviter validation Mongoose
    const db = Request.db;
    const result = await db.collection('requests').insertOne(requestData);
    
    // Récupérer le document créé
    const newRequest = await Request.findById(result.insertedId);

    res.status(201).json({
      success: true,
      message: "Votre candidature a été transmise avec succès !",
      data: newRequest
    });
  } catch (error) {
    console.error("ERROR in submitRequest:", error);
    res.status(500).json({ 
      message: "Erreur serveur lors de la soumission", 
      error: error.message 
    });
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
    const request = await Request.findById(req.params.id)
      .populate('propertyId', 'title price location images owner')
      .populate('tenantId', 'email fullName phone');

    if (!request) {
      return res.status(404).json({ success: false, message: "Candidature introuvable." });
    }

    // Sécurité simple: juste vérifier si c'est le tenantId OU le ownerId
    const userIdStr = req.user.id?.toString?.() || req.user.id;
    const tenantIdStr = request.tenantId?._id?.toString?.() || '';
    const ownerIdStr = request.ownerId?.toString?.() || '';

    const isAuthorized = (userIdStr === tenantIdStr) || (userIdStr === ownerIdStr);
    
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Accès non autorisé." });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("getRequestById error:", error.message);
    res.status(500).json({ success: false, message: "Erreur lors de la récupération", error: error.message });
  }
};

// @desc    Changer le statut OU ajouter une note d'une candidature (Agence/Propriétaire)
// @route   PATCH /api/requests/:id
// @access  Private (Owner)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, internalNote } = req.body;

    console.log('\n🔵🔵🔵 === updateRequestStatus DÉBUT === 🔵🔵🔵');
    console.log('📝 Request ID:', id);
    console.log('📋 Status:', status, '| Note:', internalNote ? 'OUI' : 'NON');

    // ✨ MODIFICATION: Status est maintenant OPTIONNEL (peut juste ajouter une note)
    if (!status && !internalNote) {
      return res.status(400).json({ success: false, message: 'Fournir un statut ou une note' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID invalide' });
    }

    // Trouver la candidature
    console.log('🔍 Recherche...');
    const request = await Request.findById(id);
    if (!request) {
      console.log('❌ Non trouvée');
      return res.status(404).json({ success: false, message: 'Candidature introuvable' });
    }

    // Vérifier ownership
    console.log('🔐 Vérif ownership...');
    const userIdStr = (req.user.id?.toString?.() || String(req.user.id)).trim();
    const ownerIdStr = (request.ownerId?.toString?.() || String(request.ownerId)).trim();
    
    if (userIdStr !== ownerIdStr) {
      console.log('❌ Propriétaire:', ownerIdStr, 'User:', userIdStr);
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    // Préparer les mises à jour
    console.log('📤 Préparation mises à jour...');
    const updates = {
      updatedAt: new Date(),
      $push: {}
    };

    // ✨ NOUVEAU: Si statut fourni, ajouter à l'historique
    if (status) {
      const statusHistoryEntry = {
        status: status,
        date: new Date(),
        comment: comment || ''
      };
      updates.status = status;
      updates.$push.statusHistory = statusHistoryEntry;
      console.log('✏️  Changement de statut vers:', status);
    }

    // ✨ Ajouter note si présente (INDÉPENDANT du statut)
    if (internalNote) {
      updates.$push.internalNotes = {
        content: internalNote,
        date: new Date()
      };
      console.log('📝 Ajout note:', internalNote.substring(0, 50) + '...');
    }

    // Utiliser findByIdAndUpdate qui est plus robuste
    console.log('💾 UPDATE EN COURS...');
    const updated = await Request.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: false }  // Désactiver les validateurs
    );

    console.log('✅✅✅ UPDATE OK ✅✅✅');
    
    res.status(200).json({
      success: true,
      message: status ? `Statut changé en ${status}` : '📝 Note enregistrée',
      data: { _id: updated._id, status: updated.status, notesCount: updated.internalNotes.length }
    });
    console.log('🟢 Réponse envoyée\n');

  } catch (error) {
    console.error('\n❌❌❌ ERREUR ❌❌❌');
    console.error('Message:', error.message);
    console.error('Type:', error.name);
    console.error('Stack:', error.stack.split('\n').slice(0, 3).join('\n'));
    console.error('❌❌❌\n');
    
    res.status(500).json({ 
      success: false,
      message: error.message || 'Erreur lors de la mise à jour',
      errorType: error.name
    });
  }
};

// @desc    Récupérer toutes les candidatures d'une agence
// @route   GET /api/requests/agency
// @access  Private (Agency)
exports.getAgencyRequests = async (req, res) => {
  try {
    // Récupérer toutes les propriétés de cette agence
    const properties = await Property.find({ owner: req.user.id });
    const propertyIds = properties.map(p => p._id);

    let query = { propertyId: { $in: propertyIds } }; // Chercher par propriétés plutôt que par ownerId

    // 🔍 FILTRAGE PAR STATUT (case-insensitive)
    if (req.query.status && req.query.status !== 'tous') {
      // Adapter les statuts selon ce qui est envoyé
      const statusMap = {
        'en attente': 'En attente',
        'en cours': 'En cours',
        'acceptée': 'Acceptée',
        'refusée': 'Refusée',
        'infos requises': 'Infos requises'
      };
      const mappedStatus = statusMap[req.query.status.toLowerCase()] || req.query.status;
      query.status = mappedStatus;
    }

    // 📅 FILTRAGE PAR DATE
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      
      if (req.query.startDate) {
        const startDate = new Date(req.query.startDate);
        startDate.setHours(0, 0, 0, 0);
        query.createdAt.$gte = startDate;
      }
      
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    if (req.query.propertyId) query.propertyId = req.query.propertyId;

    const requests = await Request.find(query)
      .populate('tenantId', 'fullName email phone') // Info locataire (Point 4)
      .populate('propertyId', 'title price images')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mise à jour groupée (Point 7)
// @route   PATCH /api/requests/bulk/update-status
// @access  Private (Owner)
exports.bulkUpdateRequests = async (req, res) => {
  try {
    const { requestIds, status, comment } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Aucune candidature sélectionnée' });
    }

    // Récupérer toutes les candidatures
    const requests = await Request.find({ _id: { $in: requestIds } });

    // Vérifier que l'utilisateur est propriétaire de tous les biens
    for (const request of requests) {
      if (request.ownerId.toString() !== userId) {
        return res.status(403).json({ success: false, message: 'Vous n\'êtes pas autorisé' });
      }
    }

    // Mettre à jour toutes les candidatures
    const result = await Request.updateMany(
      { _id: { $in: requestIds } },
      {
        $set: { status },
        $push: {
          statusHistory: { status, comment: comment || '', date: new Date() }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} candidature(s) mise(s) à jour`,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✨ NOUVEAU: Statistiques avancées pour le Sprint 9 (Point 9)
// @desc    Récupérer les statistiques avancées des demandes pour une agence
// @route   GET /api/requests/agency/stats
// @access  Private (Owner/Agency)
exports.getAgencyStatistics = async (req, res) => {
  try {
    // Récupérer les propriétés de l'agence
    const properties = await Property.find({ owner: req.user.id });
    const propertyIds = properties.map(p => p._id);

    // Récupérer toutes les candidatures
    const allRequests = await Request.find({ propertyId: { $in: propertyIds } });

    // Statistiques par statut
    const stats = {
      total: allRequests.length,
      byStatus: {
        'En attente': allRequests.filter(r => r.status === 'En attente').length,
        'En cours': allRequests.filter(r => r.status === 'En cours').length,
        'Acceptée': allRequests.filter(r => r.status === 'Acceptée').length,
        'Refusée': allRequests.filter(r => r.status === 'Refusée').length,
        'Infos requises': allRequests.filter(r => r.status === 'Infos requises').length
      },
      
      // Statistiques temporelles
      thisMonth: allRequests.filter(r => {
        const now = new Date();
        return r.createdAt.getMonth() === now.getMonth() && 
               r.createdAt.getFullYear() === now.getFullYear();
      }).length,
      
      thisWeek: allRequests.filter(r => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return r.createdAt >= weekAgo;
      }).length,

      // Revenus moyens
      averageIncome: allRequests.length > 0
        ? Math.round(
            allRequests
              .filter(r => r.monthlyIncome)
              .reduce((sum, r) => sum + r.monthlyIncome, 0) / 
            allRequests.filter(r => r.monthlyIncome).length
          )
        : 0,

      // Taux d'approbation
      approvalRate: allRequests.length > 0
        ? Math.round(
            (allRequests.filter(r => r.status === 'Acceptée').length / allRequests.length) * 100
          )
        : 0,

      // Documents moyens par candidature
      avgDocuments: allRequests.length > 0
        ? Math.round(
            allRequests.reduce((sum, r) => sum + (r.documents?.length || 0), 0) / allRequests.length
          )
        : 0,

      // Statut de complétion des dossiers
      completedDossiers: allRequests.filter(r => 
        r.status === 'Acceptée' || r.status === 'Refusée'
      ).length,

      // Dossiers en attente de réponse
      pendingDossiers: allRequests.filter(r => 
        r.status === 'En attente' || r.status === 'Infos requises'
      ).length,

      // Répartition par propriété
      byProperty: properties.map(prop => ({
        propertyId: prop._id,
        propertyName: prop.title,
        candidatures: allRequests.filter(r => r.propertyId.toString() === prop._id.toString()).length
      }))
    };

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};