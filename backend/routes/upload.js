const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

const UPLOAD_DIR = path.join(__dirname, '../uploads/products');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

// Stores a capped, webp-converted master on disk and returns a URL with the
// default display width baked in (mirrors the old Cloudinary w_800 default) —
// /uploads/:file?w=N is resized-on-request and cached by routes/images.js.
async function saveImage(buffer, req) {
  const filename = `${crypto.randomBytes(8).toString('hex')}.webp`;
  await sharp(buffer).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 85 }).toFile(path.join(UPLOAD_DIR, filename));
  return `${req.protocol}://${req.get('host')}/uploads/products/${filename}?w=800`;
}

// POST /api/upload
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  try {
    res.json({ url: await saveImage(req.file.buffer, req) });
  } catch (err) {
    res.status(500).json({ message: 'Image processing failed' });
  }
});

// POST /api/upload/multiple
router.post('/multiple', protect, adminOnly, upload.array('images', 5), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'No files uploaded' });
  try {
    const urls = await Promise.all(req.files.map((f) => saveImage(f.buffer, req)));
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ message: 'Image processing failed' });
  }
});

module.exports = router;
