const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/upload', require('./routes/upload'));

app.get('/', (req, res) => res.json({ message: 'SellMix API running - Chichawatni' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SellMix server on port ${PORT}`));
