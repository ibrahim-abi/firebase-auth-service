const express = require("express");
const router = express.Router();
const authService = require("../services/AuthService");
const logger = require("../utils/logger.js");
const authMiddleware = require("../middleware/middleware");

// Allowed roles
const allowedRoles = ["user", "admin", "super-admin"];
const allowedAppTypes = ["app_user", "web_user"];

// 🔐 POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, confirmPassword, role } = req.body;
    const appType = req.header("X-AppType");

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Email, password, and confirm password are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password and confirm password do not match" });
    }
    if (!appType || !allowedAppTypes.includes(appType)) {
      return res.status(400).json({ error: "Invalid or missing X-AppType header. Must be 'app_user' or 'web_user'" });
    }

    const sanitizedRole = allowedRoles.includes(role) ? role : "user";

    const result = await authService.signup({ email, password, role: sanitizedRole, appType });
    res.json(result);
  } catch (err) {
    logger.error("Signup failed", { error: err.message });
    res.status(400).json({ error: err.message });
  }
});

// 🔄 POST /auth/refresh-token
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token is required" });

    const tokens = await authService.refreshToken(refreshToken);
    res.json(tokens);
  } catch (err) {
    logger.error("Token refresh failed", { error: err.message });
    res.status(403).json({ error: err.message });
  }
});

// 🚪 POST /auth/logout
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token is required" });

    await authService.logout(refreshToken);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    logger.error("Logout failed", { error: err.message });
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /auth/request-reset
 * Request a password reset email with a token link
 */
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;
    await authService.sendPasswordResetEmail(email);
    res.json({ message: "Reset link sent to your email." });
  } catch (e) {
    logger.error("Request reset failed", { error: e.message });
    res.status(400).json({ error: e.message });
  }
});

/**
 * POST /auth/reset-password
 * Reset password using oobCode and new password
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { oobCode, newPassword, confirmPassword } = req.body;
    await authService.confirmPasswordReset(oobCode, newPassword, confirmPassword);
    res.json({ message: "Password reset successful." });
  } catch (e) {
    logger.error("Password reset failed", { error: e.message });
    res.status(400).json({ error: e.message });
  }
});

// POST /auth/send-otp
router.post("/send-otp", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const uid = req.user.uid;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    await authService.sendEmailOtp(uid, email);
    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    logger.error("Send OTP failed", { error: err.message });
    res.status(400).json({ error: err.message });
  }
});

// POST /auth/verify-otp
router.post("/verify-otp", authMiddleware, async (req, res) => {
  try {
    const { otp } = req.body;
    const uid = req.user.uid;
    if (!otp) {
      return res.status(400).json({ error: "OTP is required" });
    }
    await authService.verifyEmailOtp(uid, otp);
    res.json({ message: "Email verified successfully." });
  } catch (err) {
    logger.error("Verify OTP failed", { error: err.message });
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
