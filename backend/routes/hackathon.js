const express = require('express');
const HackathonPost = require('../models/hackathonPost');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /hackathon
 * Create a new hackathon team post (protected)
 * body: { hackathonName, title, description, techStack, skillsNeeded, maxMembers, contactInfo }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      hackathonName,
      title,
      description,
      techStack,
      skillsNeeded,
      maxMembers,
      contactInfo,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    // frontend sends techStack as comma-separated string → convert to array
    let techArray = [];
    if (Array.isArray(techStack)) {
      techArray = techStack;
    } else if (typeof techStack === 'string') {
      techArray = techStack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const rolesArray =
      typeof skillsNeeded === 'string'
        ? skillsNeeded
            .split(',')
            .map((r) => r.trim())
            .filter(Boolean)
        : [];

    const post = await HackathonPost.create({
      hackathonName,
      title,
      description,
      techStack: techArray,
      skillsNeeded,
      requiredRoles: rolesArray,
      maxMembers: maxMembers || 4,
      contactInfo,
      createdBy: req.user.id,
    });

    return res.status(201).json(post);
  } catch (err) {
    console.error('Create hackathon post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /hackathon
 * Public - list all posts
 * Optional query:
 *   isClosed=false/true
 *   tech=React  (filter if techStack contains this value)
 */
router.get('/', async (req, res) => {
  try {
    const { isClosed, tech } = req.query;
    const filter = {};

    if (isClosed === 'true') filter.isClosed = true;
    if (isClosed === 'false') filter.isClosed = false;

    if (tech) {
      filter.techStack = { $in: [tech] };
    }

    const posts = await HackathonPost.find(filter)
      .populate('createdBy', 'name enrollment')
      .populate('applicants.user', 'name enrollment')
      .sort({ createdAt: -1 });

    return res.json(posts);
  } catch (err) {
    console.error('List hackathon posts error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /hackathon/my
 * Posts created by the logged-in user
 */
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const posts = await HackathonPost.find({ createdBy: req.user.id })
      .populate('applicants.user', 'name enrollment')
      .sort({ createdAt: -1 });

    return res.json(posts);
  } catch (err) {
    console.error('List my hackathon posts error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /hackathon/post/:id
 * Get single post
 */
router.get('/post/:id', async (req, res) => {
  try {
    const post = await HackathonPost.findById(req.params.id)
      .populate('createdBy', 'name enrollment')
      .populate('applicants.user', 'name enrollment');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    return res.json(post);
  } catch (err) {
    console.error('Get hackathon post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT /hackathon/post/:id
 * Update post (only owner)
 */
router.put('/post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await HackathonPost.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to edit this post' });
    }

    const {
      hackathonName,
      title,
      description,
      techStack,
      skillsNeeded,
      maxMembers,
      contactInfo,
      isClosed,
    } = req.body;

    if (hackathonName !== undefined) post.hackathonName = hackathonName;
    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (techStack !== undefined) {
      if (Array.isArray(techStack)) {
        post.techStack = techStack;
      } else if (typeof techStack === 'string') {
        post.techStack = techStack
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }
    if (skillsNeeded !== undefined) {
      post.skillsNeeded = skillsNeeded;
      post.requiredRoles =
        typeof skillsNeeded === 'string'
          ? skillsNeeded
              .split(',')
              .map((r) => r.trim())
              .filter(Boolean)
          : [];
    }
    if (maxMembers !== undefined) post.maxMembers = maxMembers;
    if (contactInfo !== undefined) post.contactInfo = contactInfo;
    if (isClosed !== undefined) post.isClosed = isClosed;

    const updated = await post.save();
    return res.json(updated);
  } catch (err) {
    console.error('Update hackathon post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PATCH /hackathon/post/:id/close
 * Close the team (only owner)
 */
router.patch('/post/:id/close', authMiddleware, async (req, res) => {
  try {
    const post = await HackathonPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can close this post' });
    }

    if (!post.isClosed) {
      post.isClosed = true;
      await post.save();
    }

    return res.json({ message: 'Team closed', post });
  } catch (err) {
    console.error('Close hackathon post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /hackathon/post/:id
 * Delete post (only owner)
 */
router.delete('/post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await HackathonPost.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to delete this post' });
    }

    await post.deleteOne();
    return res.status(204).send();
  } catch (err) {
    console.error('Delete hackathon post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /hackathon/post/:id/apply
 * Apply to join a team (protected)
 * body: { message }
 */
router.post('/post/:id/apply', authMiddleware, async (req, res) => {
  try {
    const post = await HackathonPost.findById(req.params.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.isClosed) return res.status(400).json({ message: 'This team is closed' });

    // prevent creator applying
    if (post.createdBy.toString() === req.user.id) {
      return res.status(400).json({ message: 'You are the creator of this post' });
    }

    // check if already applied
    const already = (post.applicants || []).some(
      (a) => a.user.toString() === req.user.id
    );
    if (already) {
      return res.status(400).json({ message: 'You already applied to this team' });
    }

    const { message } = req.body;

    post.applicants.push({
      user: req.user.id,
      message: message || '',
      status: 'pending',
    });

    await post.save();

    return res.status(201).json({ message: 'Applied successfully' });
  } catch (err) {
    console.error('Apply to hackathon post error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /hackathon/post/:id/applicants/:userId/status
 * Team owner accepts / rejects an applicant
 * body: { status: "accepted" | "rejected" }
 */
router.post(
  '/post/:id/applicants/:userId/status',
  authMiddleware,
  async (req, res) => {
    try {
      const { status } = req.body;
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const post = await HackathonPost.findById(req.params.id);

      if (!post) return res.status(404).json({ message: 'Post not found' });

      if (post.createdBy.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ message: 'Only owner can manage applicants' });
      }

      const applicant = (post.applicants || []).find(
        (a) => a.user.toString() === req.params.userId
      );

      if (!applicant) {
        return res.status(404).json({ message: 'Applicant not found' });
      }

      applicant.status = status;

      await post.save();
      return res.json({ message: `Applicant ${status}` });
    } catch (err) {
      console.error('Update applicant status error', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
