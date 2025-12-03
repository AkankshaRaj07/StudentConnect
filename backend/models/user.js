const mongoose = require('mongoose');

// Subdocument schema for refresh tokens
const RefreshTokenSchema = new mongoose.Schema({
  id: { type: String },            // unique id (uuid)
  tokenHash: { type: String },     // hashed refresh token
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
}, { _id: false });

const userSchema = new mongoose.Schema({

  // Enrollment number (normalized)
  enrollment: { 
    type: String, 
    required: true, 
    unique: true 
  },

  // Parsed parts of enrollment
  parsed: {
    collegeCode: { type: String },
    branch: { type: String },
    year: { type: String },
    roll: { type: String }
  },

  name: { type: String },
  email: { type: String },

  // Hashed password (rename to passwordHash was fine)
  passwordHash: { 
    type: String, 
    required: true 
  },

  roles: { 
    type: [String], 
    default: ['user'] 
  },

  isVerified: { 
    type: Boolean, 
    default: false 
  },

  // NEW — for secure login system
  refreshTokens: { 
    type: [RefreshTokenSchema], 
    default: [] 
  },

  failedLoginAttempts: { 
    type: Number, 
    default: 0 
  },

  lockedUntil: { 
    type: Date, 
    default: null 
  },

  lastLoginAt: {
    type: Date,
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
