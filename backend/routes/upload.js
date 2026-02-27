const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

const TRANSFORMS = 'f_auto,q_auto,w_800,c_limit';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sellmix/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Insert optimisation transforms into a Cloudinary URL
const optimise = (url) => url.replace('/upload/', `/upload/${TRANSFORMS}/`);

// POST /api/upload
router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: optimise(req.file.path) });
});

// POST /api/upload/multiple
router.post('/multiple', protect, adminOnly, upload.array('images', 5), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' });
  res.json({ urls: req.files.map((f) => optimise(f.path)) });
});

module.exports = router;
