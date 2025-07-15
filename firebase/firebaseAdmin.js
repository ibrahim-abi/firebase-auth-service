const admin = require("firebase-admin");
const serviceAccount = require("./service.json"); // Make sure this file exists and is downloaded from Firebase Console

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin; 