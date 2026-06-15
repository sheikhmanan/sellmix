const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly, ownerOnly } = require('../middleware/adminAuth');
const { readSettings, writeSettings } = require('../utils/settings');

// GET /api/settings/products-lock
router.get('/products-lock', protect, adminOnly, (req, res) => {
  const { productsLocked } = readSettings();
  res.json({ productsLocked: !!productsLocked, isOwner: req.user.role === 'owner' });
});

// PUT /api/settings/products-lock
router.put('/products-lock', protect, ownerOnly, (req, res) => {
  const settings = readSettings();
  settings.productsLocked = !!req.body.productsLocked;
  writeSettings(settings);
  res.json({ productsLocked: settings.productsLocked });
});

module.exports = router;
