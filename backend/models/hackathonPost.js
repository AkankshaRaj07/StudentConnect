// backend/models/hackathonPost.js
const mongoose = require('mongoose');

const ApplicantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const HackathonPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    techStack: {
      type: [String], // e.g. ["React", "Node.js", "ML"]
      default: [],
    },

    requiredRoles: {
      type: [String], // e.g. ["Frontend", "Backend", "ML", "Designer"]
      default: [],
    },

    // Max total team members (including owner)
    maxMembers: {
      type: Number,
      default: 4,
      min: 1,
    },

    // creator / team leader
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    applicants: {
      type: [ApplicantSchema],
      default: [],
    },

    isClosed: {
      type: Boolean,
      default: false, // closed when team is full or owner decides
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HackathonPost', HackathonPostSchema);
