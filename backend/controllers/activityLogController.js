const ActivityLog = require('../models/ActivityLog');

// Log une activité d'un CLIENT ou AGENCE - Fonction générique
exports.logUserActivity = async (
  performerId,           // ID de la personne (client) ou agence
  performerType,         // 'client' ou 'agency'
  action,
  targetType,
  targetId,
  details = {},
  ipAddress = '',
  userAgent = ''
) => {
  try {
    const logData = {
      action,
      targetType,
      targetId,
      details,
      ipAddress,
      userAgent,
      success: true,
      performedByType: performerType
    };

    if (performerType === 'client') {
      logData.userId = performerId;
    } else if (performerType === 'agency') {
      logData.agencyId = performerId;
    }

    await ActivityLog.create(logData);
  } catch (err) {
    console.error('Erreur lors du logging d\'activité utilisateur:', err);
  }
};

// Log une activité ADMIN (format original pour compatibilité)
exports.logActivity = async (adminId, action, targetType, targetId, details = {}, ipAddress = '', userAgent = '') => {
  try {
    await ActivityLog.create({
      adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
      userAgent,
      success: true,
      performedByType: 'admin'
    });
  } catch (err) {
    console.error('Erreur lors du logging d\'activité:', err);
  }
};

// Récupérer les logs d'activité avec filtres
exports.getActivityLogs = async (req, res) => {
  try {
    const { action, targetId, startDate, endDate, limit = 50, page = 1 } = req.query;
    
    let query = {};
    
    // Admin voit TOUS les logs : admin + client + agence
    if (action) query.action = action;
    if (targetId) query.targetId = targetId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const total = await ActivityLog.countDocuments(query);
    
    const logs = await ActivityLog.find(query)
      .populate('adminId', 'name email')
      .populate('userId', 'fullName email')
      .populate('agencyId', 'agencyName email')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Rapport d'activité par admin
exports.getAdminActivityReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let match = {
      adminId: req.user.id  // SÉCURITÉ: Admin voit seulement ses stats
    };
    
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const report = await ActivityLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$adminId',
          totalActions: { $sum: 1 },
          successfulActions: { $sum: { $cond: ['$success', 1, 0] } },
          failedActions: { $sum: { $cond: ['$success', 0, 1] } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'adminInfo'
        }
      },
      { $unwind: '$adminInfo' }
    ]);

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Exporter les logs en CSV
exports.exportActivityLogsCSV = async (req, res) => {
  try {
    // SÉCURITÉ: Exporter seulement les logs de l'admin connecté
    const logs = await ActivityLog.find({ adminId: req.user.id })
      .populate('adminId', 'name email')
      .sort('-createdAt');

    let csv = 'Date,Admin,Action,Type,Statut,IP\n';
    logs.forEach(log => {
      csv += `"${new Date(log.createdAt).toLocaleString('fr-FR')}","${log.adminId?.name || 'N/A'}","${log.action}","${log.targetType}","${log.success ? 'OK' : 'ERREUR'}","${log.ipAddress || 'N/A'}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="audit_logs.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
