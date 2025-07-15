// firebase/Initializer.js
const bcrypt = require("bcryptjs");
const FirestoreService = require("./FirestoreService");
const { isValidEmail, isStrongPassword } = require("../utils/validator");
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { app } = require('./firebase');

class Initializer {
  constructor() {
    this.roleService = new FirestoreService("roles");
    this.userService = new FirestoreService("users");
  }

  async init() {
    const shouldInitRoles = await this.shouldInitRoles();
    const shouldInitAdmin = await this.shouldInitSuperAdmin();

    if (shouldInitRoles) await this.ensureRoles();
    if (shouldInitAdmin) await this.ensureSuperAdmin();
  }

  async shouldInitRoles() {
    const roles = await this.roleService.readAll();
    return roles.length === 0;
  }

  async shouldInitSuperAdmin() {
    const admin = await this.userService.findByField("email", "admin@example.com");
    return !admin;
  }

  async ensureRoles() {
    const defaultRoles = ["super-admin", "admin", "editor", "viewer"];
    for (const role of defaultRoles) {
      await this.roleService.create(null, { name: role });
    }
    console.log(`✅ Roles created: ${defaultRoles.join(", ")}`);
  }

  async ensureSuperAdmin() {
    const email = "admin@example.com";
    const password = "Admin1@001";

    if (!isValidEmail(email)) throw new Error("Invalid super-admin email.");
    if (!isStrongPassword(password)) throw new Error("Weak super-admin password.");

    const auth = getAuth(app);
    let userRecord;
    try {
      // Try to create the user in Firebase Auth
      userRecord = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Super-admin created in Firebase Auth:", email);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log("ℹ️ Super-admin already exists in Firebase Auth:", email);
        // Optionally, you could fetch the user here if needed
      } else {
        throw err;
      }
    }

    // Hash password for Firestore storage (optional, since Auth manages it)
    const hashed = await bcrypt.hash(password, 10);

    // Add to Firestore users collection
    await this.userService.create(null, {
      name: "Super Admin",
      email,
      password: hashed,
      role: "super-admin",
      createdAt: new Date().toISOString(),
    });

    console.log("✅ Super-admin created in Firestore:", email);
  }
}

module.exports = Initializer;
