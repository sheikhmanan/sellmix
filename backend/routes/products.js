const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, limit = 20, page = 1 } = req.query;
    const query = { isActive: true };
    if (category) {
      const resolveCategoryIds = async (rootId) => {
        const children = await Category.find({ parent: rootId }, '_id');
        const grandchildren = await Category.find({ parent: { $in: children.map((c) => c._id) } }, '_id');
        return [rootId, ...children.map((c) => c._id), ...grandchildren.map((c) => c._id)];
      };

      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = { $in: await resolveCategoryIds(category) };
      } else {
        const cat = await Category.findOne({ name: category });
        if (cat) query.category = { $in: await resolveCategoryIds(cat._id) };
        else return res.json({ products: [], total: 0, page: 1, pages: 0 });
      }
    }
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escaped, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('category', 'name icon')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Product.countDocuments(query);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/low-stock
router.get('/low-stock', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lte: 6 }, isActive: true })
      .populate('category', 'name');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).json({ message: 'Product not found' });
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function pickProductFields(body) {
  const { name, description, price, discountPrice, costPrice, category, stock,
          unit, images, weightOptions, isActive, featured, tags } = body;
  return { name, description, price, discountPrice, costPrice, category, stock,
           unit, images, weightOptions, isActive, featured, tags };
}

// POST /api/products
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, price, category } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Product name is required' });
    if (typeof price !== 'number' || price < 0) return res.status(400).json({ message: 'Valid price is required' });
    if (!category) return res.status(400).json({ message: 'Category is required' });
    const product = await Product.create(pickProductFields(req.body));
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: pickProductFields(req.body) },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/products/:id/stock
router.patch('/:id/stock', protect, adminOnly, async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
