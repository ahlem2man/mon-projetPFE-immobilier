const Notification = require('../models/Notification');

// @desc    Obtenir les notifications de l'utilisateur connecté
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort('-createdAt')
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Marquer une notification comme lue
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification && notification.recipient.toString() === req.user.id) {
      notification.isRead = true;
      await notification.save();
      res.json({ message: "Notification marquée comme lue" });
    } else {
      res.status(404).json({ message: "Notification non trouvée" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Créer une notification (utilisé en interne)
// @access  Private
exports.createNotification = async (recipientId, message, link, type = 'status_change') => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      message,
      link,
      type
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Erreur création notification:', error);
  }
};