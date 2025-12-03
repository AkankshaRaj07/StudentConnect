// backend/models/marketplaceItem.js
const mongoose = require('mongoose');

const MarketplaceItemSchema = new mongoose.Schema(
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

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      enum: ['Books', 'Electronics', 'Hostel Essentials', 'Stationery', 'Other'],
      default: 'Other',
    },

    condition: {
      type: String,
      enum: ['New', 'Like New', 'Good', 'Used'],
      default: 'Used',
    },

    // If later you want to store image URLs (Cloudinary, etc.)
    images: {
      type: [String],
      default: [],
    },

    // Reference to the seller (User)
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isSold: {
      type: Boolean,
      default: false,
    },

    // Optional: campus or location text
    location: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

module.exports = mongoose.model('MarketplaceItem', MarketplaceItemSchema);
