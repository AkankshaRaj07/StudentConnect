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
    // Optional: name of the hackathon (SIH, etc.)
    hackathonName: {
      type: String,
      trim: true,
    },

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

    // for your UI: plain text "Frontend, backend..."
    skillsNeeded: {
      type: String,
      trim: true,
    },

    // For more structured roles (optional)
    requiredRoles: {
      type: [String],
      default: [],
    },

    // Max total team members (including owner)
    maxMembers: {
      type: Number,
      default: 4,
      min: 1,
    },

    // contact info for the team owner
    contactInfo: {
      type: String,
      trim: true,
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
