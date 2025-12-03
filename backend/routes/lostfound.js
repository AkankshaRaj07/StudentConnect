// backend/routes/lostfound.js
const express = require('express');
const LostFoundItem = require('../models/LostFoundItem');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /lostfound
 * Create a lost or found item (protected)
 * body: { title, description, type, category, location, date, contactInfo, images }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      type,         // "lost" or "found"
      category,
      location,
      date,
      contactInfo,
      images,
    } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: 'title and type are required' });
    }

    const item = await LostFoundItem.create({
      title,
      description,
      type,
      category,
      location,
      date,
      contactInfo,
      images: images || [],
      postedBy: req.user.id,
    });

    return res.status(201).json(item);
  } catch (err) {
    console.error('Create lost/found item error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /lostfound
 * Public - list items
 * Optional query params:
 *   type=lost|found
 *   onlyActive=true  (filters out resolved items)
 */
router.get('/', async (req, res) => {
  try {
    const { type, onlyActive } = req.query;

    const filter = {};
    if (type === 'lost' || type === 'found') {
      filter.type = type;
    }
    if (onlyActive === 'true') {
      filter.isResolved = false;
    }

    const items = await LostFoundItem.find(filter)
      .populate('postedBy', 'name enrollment')
      .sort({ createdAt: -1 });

    return res.json(items);
  } catch (err) {
    console.error('List lost/found items error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /lostfound/my
 * Items posted by logged-in user
 */
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const items = await LostFoundItem.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error('List my lost/found items error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /lostfound/item/:id
 * Get single lost/found item
 */
router.get('/item/:id', async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id)
      .populate('postedBy', 'name enrollment');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    return res.json(item);
  } catch (err) {
    console.error('Get lost/found item error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /lostfound/item/:id
 * Update item (only owner)
 */
router.put('/item/:id', authMiddleware, async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to edit this item' });
    }

    const {
      title,
      description,
      type,
      category,
      location,
      date,
      contactInfo,
      images,
      isResolved,
    } = req.body;

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (type !== undefined) item.type = type;
    if (category !== undefined) item.category = category;
    if (location !== undefined) item.location = location;
    if (date !== undefined) item.date = date;
    if (contactInfo !== undefined) item.contactInfo = contactInfo;
    if (images !== undefined) item.images = images;

    // If you mark as resolved, set resolvedAt
    if (isResolved !== undefined) {
      item.isResolved = isResolved;
      if (isResolved && !item.resolvedAt) {
        item.resolvedAt = new Date();
      }
      if (!isResolved) {
        item.resolvedAt = null;
      }
    }

    const updated = await item.save();
    return res.json(updated);
  } catch (err) {
    console.error('Update lost/found item error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /lostfound/item/:id
 * Delete item (only owner)
 */
router.delete('/item/:id', authMiddleware, async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to delete this item' });
    }

    await item.deleteOne();
    return res.status(204).send();
  } catch (err) {
    console.error('Delete lost/found item error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
