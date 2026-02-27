const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, mobile, password, address } = req.body;
    if (!name || !mobile || !password) {
      return res.status(400).json({ message: 'Name, mobile and password are required' });
    }
    const exists = await User.findOne({ mobile });
    if (exists) return res.status(400).json({ message: 'Mobile number already registered' });

    const user = await User.create({ name, mobile, password, address });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      address: user.address,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid mobile or password' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      address: user.address,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/profile
router.get('/profile', protect, (req, res) => res.json(req.user));

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.name = req.body.name || user.name;
    user.address = req.body.address || user.address;
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, mobile: updated.mobile, address: updated.address });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
