const logger = require("../utils/logger");

/**
 * Express error handling middleware
 * Logs error details and sends a generic response to the client
 */
function errorHandler(err, req, res, next) {
  logger.error("Unhandled error", { 
    message: err.message, 
    stack: err.stack, 
    path: req.path, 
    method: req.method 
  });

  // Don't expose detailed error info in production
  const response = process.env.NODE_ENV === "production"
    ? { error: "Something went wrong" }
    : { error: err.message, stack: err.stack };

  res.status(500).json(response);
}

module.exports = errorHandler;
