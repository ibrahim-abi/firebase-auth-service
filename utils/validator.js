/**
 * Validates email format using regex
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  // Basic email regex allowing subdomains and longer TLDs
  const regex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/i;
  return regex.test(email);
}

/**
 * Validates strong password rules:
 * - Minimum 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character (non-word)
 * @param {string} password
 * @returns {boolean}
 */
function isStrongPassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
}

module.exports = { isValidEmail, isStrongPassword };
