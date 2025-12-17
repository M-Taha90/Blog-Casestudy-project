const prisma = require('../lib/prisma');
const slugify = require('slugify');
const { getIO } = require('../socket');

exports.create = async (req, res) => {
  try {
    const { title, type } = req.body;
    if (!title || !type) return res.status(400).json({ message: 'title and type required' });

    const slug = slugify(`${title}-${Date.now()}`, { lower: true, strict: true });

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        type,
        ownerId: req.user.id,
        collabLimit: type === 'BLOG' ? 5 : 4,
      },
    });

    // create owner collaborator (OWNER)
    await prisma.collaborator.create({
      data: { postId: post.id, userId: req.user.id, role: 'OWNER' },
    });

    // Emit Socket.IO event for real-time update
    try {
      const io = getIO();
      io.emit('posts:update');
    } catch (err) {
      console.error('Socket.IO error:', err);
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        owner: { select: { id: true, name: true, email: true, pic: true } },
        collaborators: { include: { user: { select: { id: true, name: true, email: true, pic: true } } } },
        versions: true,
        invites: {
          where: { used: false },
          include: {
            inviter: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
      },
    });
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true, pic: true } },
        collaborators: { include: { user: { select: { id: true, name: true, email: true, pic: true } } } },
        invites: {
          where: { used: false },
          include: {
            inviter: { select: { id: true, name: true, email: true } }
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, pic: true } },
        collaborators: { include: { user: { select: { id: true, name: true, email: true, pic: true } } } },
        versions: true,
        invites: {
          where: { used: false },
          include: {
            inviter: { select: { id: true, name: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
      },
    });
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;

    // check collaborator existence
    const collab = await prisma.collaborator.findFirst({
      where: { postId: id, userId: req.user.id },
    });
    if (!collab) return res.status(403).json({ message: 'No permission' });

    const updateData = {};
    if (title) updateData.title = title;
    if (status) updateData.status = status;
    // Note: content is NOT stored in PostgreSQL - it lives in Hocuspocus SQLite

    const updated = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    // Emit Socket.IO event for real-time update
    try {
      const io = getIO();
      io.emit('posts:update');
    } catch (err) {
      console.error('Socket.IO error:', err);
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.generateAI = async (req, res) => {
    const { brief } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
  
    const response = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Write a blog about: ${brief}` }],
      max_tokens: 800,
    });
  
    post.content = { raw: response.data.choices[0].message.content };
    await post.save();
    res.json({ content: post.content });
  };

// Database test endpoint
exports.testDatabase = async (req, res) => {
  try {
    // Test Prisma connection
    const postCount = await prisma.post.count();
    const userCount = await prisma.user.count();
    const inviteCount = await prisma.invite.count();
    const collaboratorCount = await prisma.collaborator.count();

    // Get sample data
    const recentPosts = await prisma.post.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        ownerId: true,
      },
    });

    const publishedPosts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    res.json({
      ok: true,
      database: 'Connected',
      dbUrl: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      counts: {
        posts: postCount,
        users: userCount,
        invites: inviteCount,
        collaborators: collaboratorCount,
        published: publishedPosts.length,
      },
      recentPosts,
      publishedPosts,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({
      ok: false,
      error: err.message,
      dbUrl: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    });
  }
};
  
