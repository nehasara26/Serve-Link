const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

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
      // Local Fallback: save to uploads folder
      const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
      const filename = `img_${Date.now()}.png`;
      const filePath = path.join(__dirname, '../uploads', filename);
      
      fs.writeFileSync(filePath, base64Data, 'base64');
      
      const port = process.env.PORT || 5000;
      return res.json({ imageUrl: `http://localhost:${port}/uploads/${filename}` });
    }

    const result = await cloudinary.uploader.upload(data, {
      folder: 'serve-link/issues',
      resource_type: 'auto'
    });

    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    try {
      // Final attempt: local save if anything else failed
      const { data } = req.body;
      const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
      const filename = `img_err_${Date.now()}.png`;
      const filePath = path.join(__dirname, '../uploads', filename);
      fs.writeFileSync(filePath, base64Data, 'base64');
      const port = process.env.PORT || 5000;
      return res.json({ imageUrl: `http://localhost:${port}/uploads/${filename}` });
    } catch (saveErr) {
      console.error('Final fallback failed:', saveErr);
      res.json({ imageUrl: `https://placehold.co/600x400?text=Issue+Photo` });
    }
  }
});

module.exports = router;
