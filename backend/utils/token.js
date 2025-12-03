const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || 900; // seconds
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || 604800; // seconds (7d)

function signAccessToken(user) {
  const payload = { sub: user._id.toString(), roles: user.roles || ['user'] };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: Number(ACCESS_TTL) });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function generateRefreshTokenPlain() {
  return crypto.randomBytes(64).toString('hex');
}

module.exports = { signAccessToken, verifyAccessToken, generateRefreshTokenPlain, ACCESS_TTL, REFRESH_TTL };
