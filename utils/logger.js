const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

function getLogFilePath() {
  const date = new Date().toISOString().split("T")[0];
  return path.join(logsDir, `log-${date}.log`);
}

function log(type, message, data = null) {
  const timestamp = new Date().toISOString();
  const logType = type.toUpperCase();
  const fullMessage = `[${timestamp}] [${logType}] ${message}${data ? " | " + JSON.stringify(data) : ""}\n`;

  // Append to log file asynchronously
  fs.appendFile(getLogFilePath(), fullMessage, (err) => {
    if (err) {
      // fallback: output error to console if file write fails
      console.error("Failed to write log file:", err);
    }
  });

  // Log to console with appropriate method
  switch (logType) {
    case "ERROR":
      console.error(fullMessage.trim());
      break;
    case "WARN":
      console.warn(fullMessage.trim());
      break;
    default:
      console.log(fullMessage.trim());
  }
}

module.exports = {
  info: (msg, data) => log("INFO", msg, data),
  warn: (msg, data) => log("WARN", msg, data),
  error: (msg, data) => log("ERROR", msg, data),
};
