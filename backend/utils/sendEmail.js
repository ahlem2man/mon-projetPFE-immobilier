const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,      // sandbox.smtp.mailtrap.io
    port: process.env.MAILTRAP_PORT,      // 2525
    auth: {
      user: process.env.MAILTRAP_USER,    // 8576c364cad1f1
      pass: process.env.MAILTRAP_PASS,    // 397dedbaed7438
    },
  });

  const mailOptions = {
    from: '"ImmoAhlem" <noreply@immoahlem.com>',
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;