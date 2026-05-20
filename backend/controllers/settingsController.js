const PlatformSettings = require('../models/PlatformSettings');

// GET: Récupérer tous les paramètres
exports.getSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne().populate('updatedByAdmin', 'fullName email');
    
    if (!settings) {
      // Créer les paramètres par défaut s'ils n'existent pas
      settings = new PlatformSettings();
      await settings.save();
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des paramètres',
      error: error.message 
    });
  }
};

// PUT: Mettre à jour les paramètres
exports.updateSettings = async (req, res) => {
  try {
    const {
      emailSettings,
      financialSettings,
      securitySettings,
      platformLimits,
      brandingSettings,
      maintenanceSettings
    } = req.body;

    let settings = await PlatformSettings.findOne();

    if (!settings) {
      settings = new PlatformSettings();
    }

    // Mettre à jour les paramètres
    if (emailSettings) settings.emailSettings = { ...settings.emailSettings, ...emailSettings };
    if (financialSettings) settings.financialSettings = { ...settings.financialSettings, ...financialSettings };
    if (securitySettings) settings.securitySettings = { ...settings.securitySettings, ...securitySettings };
    if (platformLimits) settings.platformLimits = { ...settings.platformLimits, ...platformLimits };
    if (brandingSettings) settings.brandingSettings = { ...settings.brandingSettings, ...brandingSettings };
    if (maintenanceSettings) settings.maintenanceSettings = { ...settings.maintenanceSettings, ...maintenanceSettings };

    settings.updatedByAdmin = req.user.id;
    settings.lastUpdatedAt = Date.now();

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      settings
    });
  } catch (error) {
    console.error('Erreur dans updateSettings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres',
      error: error.message
    });
  }
};

// GET: Récupérer les paramètres de sécurité (public - pour le frontend)
exports.getSecuritySettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne().select('securitySettings');
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Paramètres non trouvés'
      });
    }

    res.status(200).json(settings.securitySettings);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres de sécurité',
      error: error.message
    });
  }
};

// GET: Vérifier le mode maintenance
exports.getMaintenanceStatus = async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne().select('maintenanceSettings');
    
    if (!settings) {
      return res.status(200).json({
        maintenanceMode: false
      });
    }

    res.status(200).json({
      maintenanceMode: settings.maintenanceSettings.maintenanceMode,
      maintenanceMessage: settings.maintenanceSettings.maintenanceMessage,
      estimatedEndTime: settings.maintenanceSettings.estimatedEndTime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut de maintenance',
      error: error.message
    });
  }
};

// PUT: Activer/Désactiver le mode maintenance (accès rapide)
exports.toggleMaintenanceMode = async (req, res) => {
  try {
    const { maintenanceMode, maintenanceMessage, estimatedEndTime } = req.body;

    let settings = await PlatformSettings.findOne();

    if (!settings) {
      settings = new PlatformSettings();
    }

    settings.maintenanceSettings.maintenanceMode = maintenanceMode;
    if (maintenanceMessage) settings.maintenanceSettings.maintenanceMessage = maintenanceMessage;
    if (estimatedEndTime) settings.maintenanceSettings.estimatedEndTime = estimatedEndTime;

    await settings.save();

    res.status(200).json({
      success: true,
      message: `Mode maintenance ${maintenanceMode ? 'activé' : 'désactivé'}`,
      maintenance: settings.maintenanceSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du mode maintenance',
      error: error.message
    });
  }
};
