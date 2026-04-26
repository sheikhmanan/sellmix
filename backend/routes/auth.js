const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

// Rate limit for auth endpoints — 200 attempts per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
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
router.post('/login', authLimiter, async (req, res) => {
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

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { mobile, newPassword } = req.body;
    if (!mobile || !newPassword) return res.status(400).json({ message: 'Mobile and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: 'No account found with this mobile number' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/users — all customers (admin)
const { adminOnly } = require('../middleware/adminAuth');
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }, 'name mobile address city createdAt').sort({ createdAt: -1 });
    res.json(users);
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
