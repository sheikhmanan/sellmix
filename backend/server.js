const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// CORS — in development allow all localhost ports; in production restrict to ALLOWED_ORIGINS
const isDev = process.env.NODE_ENV !== 'production';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    // Always allow requests with no origin (mobile apps, Postman)
    if (!origin) return cb(null, true);
    // In development allow any localhost origin
    if (isDev && /^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);
    // In production (or if ALLOWED_ORIGINS is set) restrict to the list
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false); // reject without throwing — avoids 500
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// Global rate limit — 1000 requests per 15 minutes per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, standardHeaders: true, legacyHeaders: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/upload', require('./routes/upload'));

app.get('/', (req, res) => res.json({ message: 'SellMix API running - Chichawatni' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SellMix server on port ${PORT}`));
