const Payment = require('../models/Payment');

// Obtenir l'historique complet des paiements (Point 7)
exports.getAdminPayments = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};

    // Filtre par statut (complété, en attente, échoué, remboursé)
    if (status) {
      query.status = status;
    }

    // Filtre par plage de dates
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(query)
      .populate('userId', 'name email role') // On voit qui a payé
      .sort('-createdAt');

    // Calcul des statistiques
    const report = {
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      count: payments.length,
      completedCount: payments.filter(p => p.status === 'complété').length
    };

    res.status(200).json({
      success: true,
      data: payments,
      report: report
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Obtenir les paiements d'un locataire spécifique
exports.getTenantPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ userId })
      .populate('userId', 'name email role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Initier un paiement du locataire à l'agence
exports.initiatePayment = async (req, res) => {
  try {
    const { amount, type, agencyId, propertyId, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Montant invalide' });
    }
    if (!type) {
      return res.status(400).json({ success: false, message: 'Type de paiement requis' });
    }
    if (!agencyId) {
      return res.status(400).json({ success: false, message: 'Agence requise' });
    }

    // Créer le paiement
    const payment = new Payment({
      userId,
      agencyId,
      propertyId: propertyId || null,
      amount,
      type,
      paymentMethod: paymentMethod || 'Carte Bancaire',
      status: 'en attente',
      reference: 'REF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    });

    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Paiement initié avec succès',
      data: payment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Confirmer un paiement (après validation de la carte)
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(paymentId).populate('agencyId');
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Paiement non trouvé' });
    }

    if (payment.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Non autorisé' });
    }

    payment.status = 'complété';
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Paiement confirmé - L\'argent a été transféré à l\'agence',
      data: payment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Obtenir les paiements reçus par une agence
exports.getAgencyPayments = async (req, res) => {
  try {
    const agencyId = req.user.agencyId || req.user.id;
    const payments = await Payment.find({ agencyId })
      .populate('userId', 'name email')
      .populate('propertyId', 'title')
      .sort('-createdAt');

    const stats = {
      totalAmount: payments.reduce((sum, p) => sum + (p.status === 'complété' ? p.amount : 0), 0),
      completedCount: payments.filter(p => p.status === 'complété').length,
      pendingCount: payments.filter(p => p.status === 'en attente').length
    };

    res.status(200).json({
      success: true,
      data: payments,
      stats
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Obtenir le total des revenus en Euro (Pour les Analytics - Point 3)
exports.getRevenueStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      { $match: { status: 'complété' } },
      { $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          count: { $sum: 1 }
      }}
    ]);
    res.status(200).json({ success: true, data: stats[0] || { totalRevenue: 0, count: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};