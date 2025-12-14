const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/postController');
const { canEditPost, onlyOwner } = require('../middleware/postPermissionMiddleware');
const prisma = require('../lib/prisma');

router.post('/', auth, ctrl.create);

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
