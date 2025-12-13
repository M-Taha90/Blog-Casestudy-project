const prisma = require('../lib/prisma');
const slugify = require('slugify');

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
        collaborators: { include: { user: { select: { id: true, name: true, email: true } } } },
        versions: true,
      },
    });
    if (!post) return res.status(404).json({ message: 'Not found' });
    res.json(post);
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
        collaborators: { include: { user: { select: { id: true, name: true, email: true } } } },
        versions: true,
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
    const { title, content, status } = req.body;

    // check collaborator existence
    const collab = await prisma.collaborator.findFirst({
      where: { postId: id, userId: req.user.id },
    });
    if (!collab) return res.status(403).json({ message: 'No permission' });

    const updateData = {};
    if (title) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status) updateData.status = status;

    const updated = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    // create a version snapshot if content changed
    if (content !== undefined) {
      await prisma.postVersion.create({
        data: {
          postId: id,
          authorId: req.user.id,
          snapshot: content,
        },
      });
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
  
