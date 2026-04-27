const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { getUsers, updateUserStatus, getPendingProperties, moderateProperty } = require('../controllers/adminController');

// Toutes les routes ici nécessitent d'être connecté ET d'être admin
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/properties/pending', getPendingProperties);
router.patch('/properties/:id/moderate', moderateProperty);

module.exports = router;