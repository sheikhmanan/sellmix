const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

router.get('/', async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Category deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
