const nodemailer = require('nodemailer');

// Configuration Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,      // ahlem.MANSOUR@polytechnicien.tn
    pass: process.env.GMAIL_PASS,      // App Password (pas le mot de passe Gmail normal!)
  },
});

// Fonction générique pour envoyer les alertes de statut
exports.sendApplicationStatusEmail = async (toEmail, userName, propertyTitle, newStatus) => {
  const mailOptions = {
    from: `"HOMA Immobilier" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Mise à jour de votre dossier : ${propertyTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #00BCD4;">Bonjour ${userName},</h2>
        <p>Le statut de votre candidature pour le bien <strong>${propertyTitle}</strong> a été modifié.</p>
        
        <div style="background-color: #f9f9f9; border-left: 4px solid #00BCD4; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 18px;">Nouveau statut : <strong>${newStatus}</strong></p>
        </div>

        <p>Vous pouvez consulter les détails et les commentaires de l'agence en cliquant sur le bouton ci-dessous :</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:5174/dashboard/applications" 
             style="background-color: #00BCD4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Accéder à mon espace
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #888; text-align: center;">HOMA Immobilier - Votre futur chez-vous, en un clic.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};