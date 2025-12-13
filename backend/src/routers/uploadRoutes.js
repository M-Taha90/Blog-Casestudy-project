const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');
const authMiddleware = require('../middleware/authMiddleware');
const prisma = require('../lib/prisma');

// Upload image
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { postId } = req.body;

    cloudinary.uploader.upload_stream(
      { folder: 'posts' },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        try {
          // Save to database
          const dbRecord = await prisma.image.create({
            data: {
              postId: postId || null,
              uploaderId: req.user.id,
              key: result.public_id,
              url: result.secure_url,
              status: 'PENDING',
              meta: {
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                resource_type: result.resource_type,
              },
            },
          });

          res.json({
            message: 'Uploaded',
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            dbRecord: {
              id: dbRecord.id,
              url: dbRecord.url,
              postId: dbRecord.postId,
              createdAt: dbRecord.createdAt,
            },
          });
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Still return Cloudinary result even if DB save fails
          res.json({
            message: 'Uploaded',
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            warning: 'Image uploaded but database save failed',
          });
        }
      }
    ).end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
