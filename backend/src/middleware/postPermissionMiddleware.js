const prisma = require('../lib/prisma');

exports.canEditPost = async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        collaborators: true,
      },
    });
    
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;

    const isOwner = post.ownerId === userId;
    const isCollaborator = post.collaborators.some(
      collab => collab.userId === userId
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'No edit permission' });
    }

    req.post = post; // attach for later use
    next();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.onlyOwner = async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
    });
    
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Only owner allowed' });
    }

    req.post = post;
    next();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
