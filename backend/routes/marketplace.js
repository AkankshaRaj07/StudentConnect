// backend/routes/marketplace.js
const express = require('express');
const MarketplaceItem = require('../models/marketplaceItem');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /marketplace
 * Create a new item (protected)
 * body: { title, description, price, category, condition, images, location }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, price, category, condition, images, location } = req.body;

    if (!title || price == null) {
      return res.status(400).json({ message: 'title and price are required' });
    }

    const item = await MarketplaceItem.create({
      title,
      description,
      price,
      category,
      condition,
      images: images || [],
      location,
      seller: req.user.id, // from authMiddleware
      // status will default to "available" from schema
    });

    return res.status(201).json(item);
  } catch (err) {
    console.error('Create marketplace item error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /marketplace
 * Public - get all items
 * optional query: ?onlyAvailable=true  -> filter status=available
 */
router.get('/', async (req, res) => {
  try {
    const { onlyAvailable } = req.query;

    const filter = {};
    if (onlyAvailable === 'true') {
      filter.status = 'available';
    }

    const items = await MarketplaceItem.find(filter)
      .populate('seller', 'name enrollment') // show seller basic info
      .sort({ createdAt: -1 });

    return res.json(items);
  } catch (err) {
    console.error('List marketplace items error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /marketplace/my
 * Get items created by logged-in user
 */
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ seller: req.user.id }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error('List my marketplace items error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /marketplace/:id
 * Get single item by id
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id)
      .populate('seller', 'name enrollment');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    return res.json(item);
  } catch (err) {
    console.error('Get marketplace item error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /marketplace/:id
 * Update an item (only owner can update)
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to edit this item' });
    }

    const {
      title,
      description,
      price,
      category,
      condition,
      images,
      location,
      status, // 🔥 NEW instead of isSold
    } = req.body;

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (category !== undefined) item.category = category;
    if (condition !== undefined) item.condition = condition;
    if (images !== undefined) item.images = images;
    if (location !== undefined) item.location = location;
    if (status !== undefined) item.status = status; // "available" | "sold"

    const updated = await item.save();
    return res.json(updated);
  } catch (err) {
    console.error('Update marketplace item error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PATCH /marketplace/:id/mark-sold
 * Mark item as sold (only owner)
 */
router.patch('/:id/mark-sold', authMiddleware, async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    item.status = 'sold';
    await item.save();

    const populated = await item.populate('seller', 'name enrollment');
    return res.json({ message: 'Item marked as sold', item: populated });
  } catch (err) {
    console.error('Mark sold marketplace item error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /marketplace/:id
 * Delete an item (only owner can delete)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to delete this item' });
    }

    await item.deleteOne();

    return res.status(204).send(); // No content
  } catch (err) {
    console.error('Delete marketplace item error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;  
