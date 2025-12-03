// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const { validateEnrollment } = require('../utils/enrollment');

const authMiddleware = require('../middleware/authMiddleware'); // 👈 NEW IMPORT


const router = express.Router();

// Config (from env or defaults)
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const ACCESS_TTL = process.env.JWT_ACCESS_TTL || 900;         // seconds (15m)
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || 604800;   // seconds (7d)
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function signAccessToken(user) {
  const payload = { sub: user._id.toString(), roles: user.roles || ['user'] };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: Number(ACCESS_TTL) });
}

function generateRefreshPlain() {
  return crypto.randomBytes(64).toString('hex');
}

// Helper (MVP): lookup a user whose stored refreshTokens contains the matching hash.
// Linear scan is fine for MVP/dev.
async function findUserByRefreshToken(refreshPlain) {
  // only check tokens that haven't expired
  const candidates = await User.find({ 'refreshTokens.expiresAt': { $gt: new Date() } });
  for (const u of candidates) {
    for (const rt of (u.refreshTokens || [])) {
      try {
        const ok = await bcrypt.compare(refreshPlain, rt.tokenHash);
        if (ok) return { user: u, tokenRecord: rt };
      } catch (_) {
        // ignore any compare errors for this candidate
      }
    }
  }
  return null;
}

/**
 * POST /auth/signup
 * body: { enrollment_no, name, email, password }
 */
router.post('/signup', async (req, res) => {
  try {
    const { enrollment_no, name, email, password } = req.body;

    if (!enrollment_no || !name || !password) {
      return res
        .status(400)
        .json({ message: 'enrollment_no, name and password are required' });
    }

    const normalized = enrollment_no.trim().toUpperCase();

    // Validate enrollment format + allowed college/branch/year
    const { valid, parsed, reason } = validateEnrollment(normalized);
    if (!valid) {
      return res.status(400).json({
        message: 'Invalid enrollment number',
        reason,
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ enrollment: normalized });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create user
    const user = await User.create({
      enrollment: normalized,
      parsed,
      name,
      email,
      passwordHash,
      roles: ['user'],
    });

    // Create tokens (same as login)
    const accessToken = signAccessToken(user);
    const refreshPlain = generateRefreshPlain();
    const refreshHash = await bcrypt.hash(refreshPlain, BCRYPT_SALT_ROUNDS);

    const rtRecord = {
      id: uuidv4(),
      tokenHash: refreshHash,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + Number(REFRESH_TTL) * 1000),
    };

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(rtRecord);
    await user.save();

    return res.status(201).json({
      accessToken,
      refreshToken: refreshPlain,
      user: {
        id: user._id,
        name: user.name,
        enrollment: user.enrollment,
        roles: user.roles,
      },
    });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


/**
 * POST /auth/login
 * body: { enrollment_no, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { enrollment_no, password } = req.body;
    if (!enrollment_no || !password) {
      return res.status(400).json({ message: 'enrollment_no and password required' });
    }

    const normalized = enrollment_no.trim().toUpperCase();
    const user = await User.findOne({ enrollment: normalized });
    if (!user) {
      return res.status(401).json({ message: 'Invalid enrollment or password' });
    }

    // Lock check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({ message: 'Account locked. Try again later' });
    }

    // Compare password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid enrollment or password' });
    }

    // Success: reset counters
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    // Create tokens
    const accessToken = signAccessToken(user);
    const refreshPlain = generateRefreshPlain();
    const refreshHash = await bcrypt.hash(refreshPlain, BCRYPT_SALT_ROUNDS);

    const rtRecord = {
      id: uuidv4(),
      tokenHash: refreshHash,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + Number(REFRESH_TTL) * 1000)
    };

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(rtRecord);
    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      accessToken,
      refreshToken: refreshPlain,
      user: {
        id: user._id,
        name: user.name,
        enrollment: user.enrollment,
        roles: user.roles
      }
    });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /auth/refresh
 * body: { refreshToken }
 * rotates refresh token on success
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken required' });
    }

    const found = await findUserByRefreshToken(refreshToken);
    if (!found) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const { user, tokenRecord } = found;

    // remove old token record and add a rotated one
    user.refreshTokens = (user.refreshTokens || []).filter(rt => rt.id !== tokenRecord.id);

    const newPlain = generateRefreshPlain();
    const newHash = await bcrypt.hash(newPlain, BCRYPT_SALT_ROUNDS);
    const newRecord = {
      id: uuidv4(),
      tokenHash: newHash,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + Number(REFRESH_TTL) * 1000)
    };
    user.refreshTokens.push(newRecord);
    await user.save();

    const accessToken = signAccessToken(user);
    return res.json({ accessToken, refreshToken: newPlain });
  } catch (err) {
    console.error('Refresh error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /auth/logout
 * body: { refreshToken }
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken required to logout' });
    }

    const found = await findUserByRefreshToken(refreshToken);
    if (!found) {
      return res.status(200).json({ message: 'Logged out' }); // token already invalid
    }

    const { user, tokenRecord } = found;
    user.refreshTokens = (user.refreshTokens || []).filter(rt => rt.id !== tokenRecord.id);
    await user.save();

    return res.status(204).send();
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /auth/me
 * protected route returning current user (no sensitive fields)
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -refreshTokens');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    console.error('Me error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
