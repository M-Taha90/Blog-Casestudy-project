const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/postController');
const { canEditPost, onlyOwner } = require('../middleware/postPermissionMiddleware');
const prisma = require('../lib/prisma');
const { getIO } = require('../socket');

router.post('/', auth, ctrl.create);

// Database test endpoint (temporary - for debugging)
router.get('/test/db', ctrl.testDatabase);

// Get all posts
router.get('/', ctrl.getAll);

// MUST be before /:slug
router.get('/id/:id', ctrl.getById);

// ✅ UPDATE POST (Owner OR Collaborator)
router.put('/:id', auth, canEditPost, async (req, res) => {
  try {
    const { title, content, status } = req.body;

    const data = {};
    if (title) data.title = title;
    if (content !== undefined) data.content = content;
    if (status) data.status = status;

    const post = await prisma.post.update({
      where: { id: req.params.id },
      data,
    });

    // Versioning
    if (content !== undefined) {
      await prisma.postVersion.create({
        data: {
          postId: req.params.id,
          authorId: req.user.id,
          snapshot: content,
        },
      });
    }

    // Emit Socket.IO event for real-time update
    try {
      const io = getIO();
      io.emit('posts:update');
    } catch (err) {
      console.error('Socket.IO error:', err);
    }

    res.json({ ok: true, post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/generate', auth, ctrl.generateAI);

// ✅ ONLY OWNER CAN PUBLISH
router.post('/:id/publish', auth, onlyOwner, async (req, res) => {
  try {
    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: { status: 'PUBLISHED' },
    });

    // Emit Socket.IO event for real-time update
    try {
      const io = getIO();
      io.emit('posts:update');
    } catch (err) {
      console.error('Socket.IO error:', err);
    }

    res.json({ ok: true, message: 'Post published', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MUST BE LAST
router.get('/:slug', async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { slug: req.params.slug },
  });

  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.status !== 'PUBLISHED')
    return res.status(403).json({ message: 'Not published yet' });

  res.json(post);
});

module.exports = router;
