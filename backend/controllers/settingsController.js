const PlatformSettings = require('../models/PlatformSettings');

// GET: Récupérer tous les paramètres
exports.getSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    
    if (!settings) {
      // Créer les paramètres par défaut s'ils n'existent pas
      settings = new PlatformSettings();
      await settings.save();
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error('[ERROR] Erreur dans getSettings:', error.message);
    console.error('[ERROR] Stack:', error.stack);
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
    console.log('[DEBUG] updateSettings - Requête reçue');
    console.log('[DEBUG] Body:', JSON.stringify(req.body, null, 2));
    console.log('[DEBUG] User:', req.user?.id);

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
      console.log('[DEBUG] Création de nouveaux paramètres');
      settings = new PlatformSettings();
    }

    console.log('[DEBUG] Paramètres avant mise à jour:', JSON.stringify(settings.toObject(), null, 2));

    // Mettre à jour les paramètres
    if (emailSettings) {
      console.log('[DEBUG] Mise à jour emailSettings');
      settings.emailSettings = { ...settings.emailSettings.toObject(), ...emailSettings };
    }
    if (financialSettings) {
      console.log('[DEBUG] Mise à jour financialSettings');
      settings.financialSettings = { ...settings.financialSettings.toObject(), ...financialSettings };
    }
    if (securitySettings) {
      console.log('[DEBUG] Mise à jour securitySettings');
      settings.securitySettings = { ...settings.securitySettings.toObject(), ...securitySettings };
    }
    if (platformLimits) {
      console.log('[DEBUG] Mise à jour platformLimits');
      settings.platformLimits = { ...settings.platformLimits.toObject(), ...platformLimits };
    }
    if (brandingSettings) {
      console.log('[DEBUG] Mise à jour brandingSettings');
      settings.brandingSettings = { ...settings.brandingSettings.toObject(), ...brandingSettings };
    }
    if (maintenanceSettings) {
      console.log('[DEBUG] Mise à jour maintenanceSettings');
      settings.maintenanceSettings = { ...settings.maintenanceSettings.toObject(), ...maintenanceSettings };
    }

    settings.updatedByAdmin = req.user.id;
    settings.lastUpdatedAt = Date.now();

    console.log('[DEBUG] Paramètres après mise à jour:', JSON.stringify(settings.toObject(), null, 2));
    console.log('[DEBUG] Tentative de sauvegarde...');
    
    const savedSettings = await settings.save();
    
    console.log('[DEBUG] Sauvegarde réussie');
    console.log('[DEBUG] Paramètres sauvegardés:', JSON.stringify(savedSettings.toObject(), null, 2));

    res.status(200).json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      settings: savedSettings
    });
  } catch (error) {
    console.error('[ERROR] Erreur dans updateSettings:', error);
    console.error('[ERROR] Message:', error.message);
    console.error('[ERROR] Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
