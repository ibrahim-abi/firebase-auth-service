const admin = require("../firebase/firebaseAdmin");
const logger = require("../utils/logger");

/**
 * Middleware to protect routes by verifying Firebase ID token in Authorization header
 */
module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    logger.warn("Missing access token in request", { path: req.path, method: req.method });
    return res.status(401).json({ error: "Access token missing" });
  }

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach decoded user info to request
    logger.info("Access token verified", { uid: decodedToken.uid, path: req.path });
    next();
  } catch (err) {
    logger.error("Access token verification failed", { error: err.message, path: req.path });
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
};
