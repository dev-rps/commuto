const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Hard-fail at startup if secrets are missing — never fall back to a
// hardcoded string, that's a real security bug.
if (!ACCESS_SECRET) {
  throw new Error("FATAL: JWT_ACCESS_SECRET is not set in environment");
}
if (!REFRESH_SECRET) {
  throw new Error("FATAL: JWT_REFRESH_SECRET is not set in environment");
}

/**
 * Sign an access token.
 * @param {{ id: string, email: string, role: string, organizationId: string }} payload
 * @returns {string}
 */
function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

/**
 * Sign a refresh token.
 * @param {{ id: string }} payload
 * @returns {string}
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

/**
 * Verify an access token.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

/**
 * Verify a refresh token.
 * @param {string} token
 * @returns {object} decoded payload
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
