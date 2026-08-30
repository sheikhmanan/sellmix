const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const router = express.Router();
const ROOT = path.join(__dirname, '../uploads');
const MAX_WIDTH = 1600;

// GET /uploads/*[?w=N] — serves an uploaded image, optionally resized.
// Resized variants are generated once and cached to disk next to the
// original, so a given width only ever costs one sharp pass.
router.get('/*', async (req, res) => {
  const relPath = path.normalize(req.params[0]).replace(/^(\.\.[/\\])+/, '');
  const srcPath = path.join(ROOT, relPath);
  if (!srcPath.startsWith(ROOT)) return res.status(400).end();

  const w = Math.min(parseInt(req.query.w, 10) || 0, MAX_WIDTH);
  if (!w) {
    return res.sendFile(srcPath, (err) => { if (err) res.status(404).end(); });
  }

  const ext = path.extname(srcPath);
  const cachedPath = `${srcPath.slice(0, -ext.length)}_w${w}.webp`;

  if (fs.existsSync(cachedPath)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(cachedPath);
  }
  if (!fs.existsSync(srcPath)) return res.status(404).end();

  try {
    await sharp(srcPath).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(cachedPath);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(cachedPath);
  } catch {
    res.sendFile(srcPath);
  }
});

module.exports = router;
