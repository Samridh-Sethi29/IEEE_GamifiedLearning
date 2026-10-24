/**
 * Input sanitization and validation utilities.
 * Ensures types are strings and prevents NoSQL query injection by disallowing object queries.
 */

function sanitizeString(val) {
  if (typeof val !== "string") return "";
  return val.trim();
}

function validateEmail(email) {
  if (typeof email !== "string") return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
}

function validateUsername(username) {
  if (typeof username !== "string") return false;
  const trimmed = username.trim();
  // Child-friendly username: 3-30 chars, alphanumeric + underscores/hyphens
  const re = /^[a-zA-Z0-9_-]{3,30}$/;
  return re.test(trimmed);
}

function validatePassword(password) {
  if (typeof password !== "string") return false;
  // Minimum 6 characters for children
  return password.length >= 6 && password.length <= 128;
}

module.exports = {
  sanitizeString,
  validateEmail,
  validateUsername,
  validatePassword,
};
