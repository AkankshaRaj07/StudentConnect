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

    images: {
      type: [String],
      default: [],
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // 🔥 replaced `isSold` with better scalable status
    status: {
      type: String,
      enum: ['available', 'sold'],
      default: 'available',
    },

    location: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MarketplaceItem', MarketplaceItemSchema);
