const mongoose = require('mongoose');

const LostFoundItemSchema = new mongoose.Schema(
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

    // "lost" or "found"
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: true,
    },

    // backend/models/lostFoundItem.js
    category: {
      type: String,
      enum: ['ID Card', 'Book', 'Electronics', 'Keys', 'Wallet', 'Other'],
      default: 'Other',
    },


    // Where it was lost/found (e.g. "Library", "C Block, 2nd floor")
    location: {
      type: String,
      trim: true,
    },

    // When it was lost/found
    date: {
      type: Date,
    },

    // Optional contact info (like phone or email)
    contactInfo: {
      type: String,
      trim: true,
    },

    // For future: image URLs if you add uploads
    images: {
      type: [String],
      default: [],
    },

    // User who posted this  🔥 renamed to reportedBy
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Mark resolved when item is returned or no longer relevant
    isResolved: {
      type: Boolean,
      default: false,
    },

    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LostFoundItem', LostFoundItemSchema);
