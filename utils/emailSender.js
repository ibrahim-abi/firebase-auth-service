const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // app password or Gmail password
  },
});

/**
 * Sends password reset email with token link
 * @param {string} to Recipient email address
 * @param {string} token Password reset token
 */
async function sendResetEmail(to, token) {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const mailOptions = {
    from: `"App Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset.</p>
      <p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 30 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Optionally log or handle the error
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
}

module.exports = { sendResetEmail };
