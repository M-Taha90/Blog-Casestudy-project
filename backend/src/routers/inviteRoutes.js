const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const prisma = require('../lib/prisma');
const crypto = require('crypto');

/* ---------------- CREATE INVITE ---------------- */
router.post('/', authMiddleware, async (req, res) => {
  const { postId, inviteeEmail } = req.body;

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can invite' });
    }

    const token = crypto.randomBytes(24).toString('hex');

    const invite = await prisma.invite.create({
      data: {
        postId,
        inviterId: req.user.id,
        inviteeEmail,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({ ok: true, token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- CHECK INVITE ---------------- */
router.get('/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: {
        post: true,
        inviter: { select: { id: true, name: true, email: true } },
      },
    });
    
    if (!invite) return res.status(404).json({ message: 'Invalid token' });
    if (invite.used) return res.status(400).json({ message: 'Invite already used' });
    if (invite.expiresAt < new Date()) return res.status(400).json({ message: 'Invite expired' });

    res.json({ ok: true, invite });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- ACCEPT INVITE ---------------- */
router.post('/accept/:token', authMiddleware, async (req, res) => {
  const { token } = req.params;

  try {
    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { post: true },
    });
    
    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Check if user is already a collaborator
    const existingCollab = await prisma.collaborator.findFirst({
      where: {
        postId: invite.postId,
        userId: req.user.id,
      },
    });

    if (!existingCollab) {
      await prisma.collaborator.create({
        data: {
          postId: invite.postId,
          userId: req.user.id,
          role: 'EDITOR',
        },
      });
    }

    // Mark invite as used
    await prisma.invite.update({
      where: { id: invite.id },
      data: { used: true },
    });

    res.json({
      ok: true,
      message: 'You are now a collaborator',
      postId: invite.postId,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
