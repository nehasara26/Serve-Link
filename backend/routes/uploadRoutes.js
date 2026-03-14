const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// POST /api/upload  — body: { data: "data:image/jpeg;base64,..." }
router.post('/', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ msg: 'No image data provided' });
    }

    // Check if Cloudinary credentials are configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      // Fallback: return a placeholder image URL so demo works without credentials
      return res.json({ imageUrl: `https://placehold.co/600x400?text=Issue+Photo` });
    }

    const result = await cloudinary.uploader.upload(data, {
      folder: 'serve-link/issues',
      resource_type: 'auto'
    });

    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    // Graceful fallback for demo
    res.json({ imageUrl: `https://placehold.co/600x400?text=Issue+Photo` });
  }
});

module.exports = router;
