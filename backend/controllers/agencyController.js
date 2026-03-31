const Agency = require('../models/Agency');

// 1. Récupérer le profil de l'agence connectée
exports.getAgencyProfile = async (req, res) => {
  try {
    const agency = await Agency.findOne({ userId: req.user.id });
    if (!agency) return res.status(404).json({ message: "Profil agence non trouvé" });
    res.status(200).json(agency);
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