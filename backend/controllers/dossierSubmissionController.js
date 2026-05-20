const mongoose = require('mongoose');
const DirectDossierSubmission = require('../models/DirectDossierSubmission');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

// Récupérer toutes les agences (pour le locataire)
exports.getAllAgencies = async (req, res) => {
  try {
    const agencies = await User.find({ role: 'agency' })
      .select('name email phone')
      .sort('name');

    res.status(200).json({
      success: true,
      data: agencies
    });
  } catch (err) {
    console.error('Erreur fetch agences:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Envoyer son dossier complet à une ou plusieurs agences
exports.submitDossierToAgencies = async (req, res) => {
  try {
    const { agencyIds, message } = req.body;
    const tenantId = req.user.id;

    // Validation
    if (!agencyIds || !Array.isArray(agencyIds) || agencyIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sélectionnez au moins une agence' 
      });
    }

    // Récupérer le profil du locataire avec tous ses documents
    const tenant = await Tenant.findOne({ userId: tenantId });
    if (!tenant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dossier locataire non trouvé' 
      });
    }

    const user = await User.findById(tenantId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier que les agences existent
    const agencies = await User.find({ 
      _id: { $in: agencyIds }, 
      role: 'agency' 
    });

    if (agencies.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucune agence valide trouvée' 
      });
    }

    //  VALIDATION: Empêcher les doublons - vérifier si dossier déjà envoyé à ces agences
    const agencyIdSet = new Set(agencies.map(a => a._id.toString()));
    const existingSubmission = await DirectDossierSubmission.findOne({
      tenantId,
      agencyIds: { $in: Array.from(agencyIdSet) }
    });

    if (existingSubmission) {
      // Vérifier si des agences ont déjà reçu ce dossier
      const alreadySubmittedAgencies = existingSubmission.agencyIds
        .filter(id => agencyIdSet.has(id.toString()))
        .map(id => id.toString());
      
      if (alreadySubmittedAgencies.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Vous avez déjà envoyé votre dossier à ${alreadySubmittedAgencies.length} de ces agence(s). Évitez les envois en doublon.`
        });
      }
    }

    // Créer l'enregistrement d'envoi du dossier
    const submission = await DirectDossierSubmission.create({
      tenantId,
      agencyIds: agencies.map(a => a._id),
      documents: tenant.documents || {},
      profileSnapshot: {
        fullName: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        profession: tenant.profession,
        employmentStatus: tenant.employmentType,
        income: tenant.income
      },
      message,
      submissions: agencies.map(agency => ({
        agencyId: agency._id,
        status: 'Envoyé'
      }))
    });

    console.log(`Dossier envoyé à ${agencies.length} agence(s) par le locataire ${tenantId}`);

    res.status(201).json({
      success: true,
      message: `Dossier envoyé à ${agencies.length} agence(s) avec succès`,
      data: submission
    });
  } catch (err) {
    console.error('Erreur envoi dossier:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Récupérer l'historique d'envois de dossier du locataire
exports.getMyDossierSubmissions = async (req, res) => {
  try {
    const tenantId = req.user.id;

    const submissions = await DirectDossierSubmission.find({ tenantId })
      .populate('agencyIds', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (err) {
    console.error('Erreur fetch submissions:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Pour l'agence: Récupérer tous les dossiers reçus
exports.getReceivedDossiers = async (req, res) => {
  try {
    const agencyId = req.user.id;
    const agencyObjectId = new mongoose.Types.ObjectId(agencyId);

    const dossiers = await DirectDossierSubmission.find({ 
      agencyIds: { $in: [agencyObjectId] }
    })
      .populate('tenantId', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: dossiers.length,
      data: dossiers
    });
  } catch (err) {
    console.error('Erreur fetch dossiers reçus:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Marquer un dossier comme consulté par l'agence
exports.markDossierAsViewed = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const agencyId = req.user.id;

    const submission = await DirectDossierSubmission.findByIdAndUpdate(
      submissionId,
      {
        $push: {
          viewedByAgencies: {
            agencyId,
            viewedAt: new Date()
          }
        },
        $set: {
          'submissions.$[elem].status': 'Consulté',
          'submissions.$[elem].consultedAt': new Date()
        }
      },
      {
        new: true,
        arrayFilters: [{ 'elem.agencyId': agencyId }]
      }
    ).populate('tenantId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Dossier marqué comme consulté',
      data: submission
    });
  } catch (err) {
    console.error('Erreur mark viewed:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Répondre à un dossier reçu (accepter/refuser)
exports.respondToDossier = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, note } = req.body;
    const agencyId = req.user.id;

    if (!['Accepté', 'Refusé'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Statut invalide' 
      });
    }

    const submission = await DirectDossierSubmission.findByIdAndUpdate(
      submissionId,
      {
        $set: {
          'submissions.$[elem].status': status,
          'submissions.$[elem].respondedAt': new Date(),
          'submissions.$[elem].agencyNote': note
        }
      },
      {
        new: true,
        arrayFilters: [{ 'elem.agencyId': agencyId }]
      }
    ).populate('tenantId', 'name email');

    res.status(200).json({
      success: true,
      message: `Dossier marqué comme ${status}`,
      data: submission
    });
  } catch (err) {
    console.error('Erreur respond dossier:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};
