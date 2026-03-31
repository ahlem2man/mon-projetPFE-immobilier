const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto'); 
const { protect: authMiddleware } = require('../middleware/auth');



router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Cet utilisateur existe déjà" });

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const vToken = crypto.randomBytes(32).toString('hex');

    
    user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      verificationToken: vToken 
    });
    await user.save();

   
    const verifyUrl = `http://localhost:5173/verify-email/${vToken}`;
    const messageHtml = `
      <h1>Bienvenue sur ImmoAhlem !</h1>
      <p>Bonjour ${name}, merci de valider votre compte en cliquant sur le lien ci-dessous :</p>
      <a href="${verifyUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Vérifier mon compte</a>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Vérification de votre compte ImmoAhlem",
        html: messageHtml
      });
      res.status(201).json({ message: "Utilisateur créé ! Vérifiez votre boîte mail." });
    } catch (mailErr) {
      res.status(201).json({ message: "Utilisateur créé, mais l'envoi du mail a échoué." });
    }

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ message: "Lien de vérification invalide ou expiré." });
    }

    
    user.isVerified = true;
    user.verificationToken = undefined; 
    await user.save();

    res.json({ message: "Votre compte a été vérifié avec succès !" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la vérification" });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Identifiants invalides" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Identifiants invalides" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret_provisoire',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role, isVerified: user.isVerified }
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


router.get('/test-email', async (req, res) => {
  try {
    await sendEmail({
      email: "ahlem@test.com",
      subject: "Test ImmoAhlem",
      html: "<h1>Succès !</h1><p>Ton système d'email fonctionne pour le Sprint 2.</p>"
    });
    res.status(200).json({ message: "Email de test envoyé ! Regarde ton interface Mailtrap." });
  } catch (error) {
    res.status(500).json({ message: "Erreur d'envoi", error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "Aucun utilisateur avec cet email." });

   
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Réinitialisation de mot de passe - ImmoAhlem",
      html: `
        <h3>Demande de nouveau mot de passe</h3>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
        <a href="${resetUrl}" style="background-color: #e11d48; color: white; padding: 10px; text-decoration: none; border-radius: 5px;">Changer mon mot de passe</a>
        <p>Ce lien expirera dans 1 heure.</p>
      `
    });

    res.json({ message: "Un e-mail de réinitialisation a été envoyé." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});


router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Le lien est invalide ou a expiré." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

  
    user.isVerified = true; 

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Mot de passe modifié et compte vérifié !" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour récupérer le profil de l'utilisateur connecté
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json({ 
      id: user._id, 
      name: user.name, 
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;