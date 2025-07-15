const bcrypt = require("bcryptjs");
const FirestoreService = require("../firebase/FirestoreService");
const { isValidEmail, isStrongPassword } = require("../utils/validator");
const logger = require("../utils/logger.js");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword , sendPasswordResetEmail, confirmPasswordRese} = require('firebase/auth');
const { app } = require('../firebase/firebase');
const { sendResetEmail } = require('../utils/emailSender');
const admin = require("../firebase/firebaseAdmin");

const userRepo = new FirestoreService("users");

class AuthService {
  async signup({ email, password, role = "user", appType }) {
    // Validate email, password, appType as before...
    if (!email || !password) throw new Error("Email and password are required");
    if (!appType) throw new Error("appType is required");

    // Check if user already exists in Firestore
    const existingUser = await userRepo.findByField("email", email);
    if (existingUser) throw new Error("Email already in use");

    // Create user in Firebase Auth (Admin SDK)
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({ email, password });
    } catch (error) {
      logger.error("Firebase Admin signup failed", { error: error.message });
      throw new Error("Signup failed: " + error.message);
    }

    // Set custom claims for role if needed
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // Store user profile in Firestore
    await userRepo.create(userRecord.uid, { email, role, appType });

    logger.info("New user signed up via Firebase Admin", { uid: userRecord.uid, email, appType });

    // No accessToken/refreshToken generated here; use ID tokens from client after login
    return { user: { uid: userRecord.uid, email, role, appType } };
  }

  async login({ email, password }) {
    // With Admin SDK, you can't sign in with email/password directly.
    // You should verify the ID token sent from the client after login.
    throw new Error("Login with email/password should be handled on the client. Send ID token to backend for verification.");
  }

  async verifyToken(idToken) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      return decoded;
    } catch (err) {
      throw new Error("Invalid or expired token");
    }
  }

  async getUserRole(uid) {
    // Option 1: From custom claims
    const user = await admin.auth().getUser(uid);
    return user.customClaims?.role || null;
    // Option 2: Or from Firestore
    // const userDoc = await userRepo.read(uid);
    // return userDoc ? userDoc.role : null;
  }

  async sendPasswordResetEmail(email) {
    if (!email) throw new Error("Email is required");
    if (!isValidEmail(email)) throw new Error("Invalid email format");
    const auth = getAuth(app);
    await sendPasswordResetEmail(auth, email);
    logger.info("Password reset email sent", { email });
  }

  async confirmPasswordReset(oobCode, newPassword, confirmPassword) {s
    if (!oobCode || !newPassword || !confirmPassword) {
      throw new Error("Code, new password, and confirm password are required");
    }
    if (newPassword !== confirmPassword) {
      throw new Error("Password and confirm password do not match");
    }
    const auth = getAuth(app);
    await confirmPasswordRese(auth, oobCode, newPassword);
    logger.info("Password reset successful", { oobCode });
  }

  async sendEmailOtp(uid, email) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await userRepo.update(uid, { emailOtp: otp, otpCreatedAt: Date.now() });
    await sendResetEmail(email, otp, true); 
    logger.info("OTP sent to email", { uid, email, otp });
    return true;
  }

  async verifyEmailOtp(uid, otp) {
    const user = await userRepo.read(uid);
    if (!user) throw new Error("User not found");
    if (!user.emailOtp || user.emailOtp !== otp) {
      throw new Error("Invalid OTP");
    }
     if (Date.now() - user.otpCreatedAt > 5 * 60 * 1000) throw new Error("OTP expired");
    await userRepo.update(uid, { verifiedEmail: 1, emailOtp: null, otpCreatedAt: null });
    logger.info("Email verified for user", { uid });
    return true;
  }
}

module.exports = new AuthService();
