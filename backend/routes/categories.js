const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

router.get('/', async (req, res) => {
  try {
    const { level, parent } = req.query;
    const query = { isActive: true };
    if (level) query.level = Number(level);
    if (parent === 'null') query.parent = null;
    else if (parent) query.parent = parent;
    const cats = await Category.find(query).populate('parent', 'name icon level');
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function pickCatFields({ name, icon, level, parent, isActive }) {
  return { name, icon, level, parent, isActive };
}

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    if (!req.body.name?.trim()) return res.status(400).json({ message: 'Category name is required' });
    const cat = await Category.create(pickCatFields(req.body));
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: pickCatFields(req.body) },
      { new: true, runValidators: true }
    );
    if (!cat) return res.status(404).json({ message: 'Category not found' });
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
