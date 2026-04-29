const Payment = require('../models/Payment');

// Obtenir l'historique complet des paiements (Point 7)
exports.getAdminPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email role') // On voit qui a payé
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: payments
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