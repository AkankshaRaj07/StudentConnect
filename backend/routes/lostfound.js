// backend/routes/lostfound.js
const express = require('express');
const LostFoundItem = require('../models/LostFoundItem');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /lostfound
 * Create a lost/found post (protected)
 * body: { title, description, type, category, location, date, contactInfo }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      type,         // "lost" | "found"
      category,
      location,
      date,
      contactInfo,
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
      reportedBy: req.user.id,
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
 * query: type=lost|found (optional), onlyOpen=true (optional)
 */
router.get('/', async (req, res) => {
  try {
    const { type, onlyOpen } = req.query;

    const filter = {};
    if (type === 'lost' || type === 'found') {
      filter.type = type;
    }
    if (onlyOpen === 'true') {
      filter.isResolved = false;
    }

    const items = await LostFoundItem.find(filter)
      .populate('reportedBy', 'name enrollment')
      .sort({ createdAt: -1 });

    return res.json(items);
  } catch (err) {
    console.error('List lost/found items error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /lostfound/:id
 * Public - single item
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id)
      .populate('reportedBy', 'name enrollment');

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
 * PATCH /lostfound/:id/resolve
 * Mark item as resolved (only owner)
 */
router.patch('/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    if (!item.isResolved) {
      item.isResolved = true;
      item.resolvedAt = new Date();
      await item.save();
    }

    const populated = await item.populate('reportedBy', 'name enrollment');
    return res.json({ message: 'Marked as resolved', item: populated });
  } catch (err) {
    console.error('Resolve lost/found item error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /lostfound/:id
 * Delete item (only owner)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.reportedBy.toString() !== req.user.id) {
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
