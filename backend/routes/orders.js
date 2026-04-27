const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const { sendWhatsApp, orderPlacedAdminMsg, orderPlacedCustomerMsg } = require('../services/whatsapp');

// POST /api/orders — place order (requires login)
const jwt = require('jsonwebtoken');
const User = require('../models/User');
router.post('/', protect, async (req, res) => {
  try {
    const { customerName, whatsapp, address, items, subtotal, deliveryFee, discount,
            total, paymentMethod, promoCode, notes, city, deliverySlot } = req.body;

    // Basic field validation
    if (!customerName?.trim()) return res.status(400).json({ message: 'Customer name is required' });
    if (!whatsapp?.trim()) return res.status(400).json({ message: 'WhatsApp number is required' });
    if (!address?.trim()) return res.status(400).json({ message: 'Delivery address is required' });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Order must contain at least one item' });
    if (typeof total !== 'number' || total <= 0) return res.status(400).json({ message: 'Invalid order total' });

    // Validate payment method against allowed values
    const allowedPayments = ['COD', 'EasyPaisa', 'JazzCash'];
    if (paymentMethod && !allowedPayments.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Snapshot costPrice from Product; recalculate subtotal server-side to prevent manipulation
    let serverSubtotal = 0;
    const itemsWithCost = await Promise.all(
      items.map(async (item) => {
        const prod = item.product ? await Product.findById(item.product).select('costPrice price discountPrice') : null;
        const unitPrice = prod ? (prod.discountPrice > 0 ? prod.discountPrice : prod.price) : (item.price || 0);
        serverSubtotal += unitPrice * (item.quantity || 1);
        return {
          product: item.product,
          name: item.name,
          price: unitPrice,
          costPrice: prod?.costPrice || 0,
          quantity: item.quantity || 1,
          weight: item.weight || '',
          image: item.image || '',
        };
      })
    );

    // Validate promo code server-side
    let serverDiscount = 0;
    if (promoCode && PROMO_CODES[promoCode.toUpperCase()]) {
      serverDiscount = Math.round(serverSubtotal * PROMO_CODES[promoCode.toUpperCase()]);
    }

    const serverDeliveryFee = typeof deliveryFee === 'number' ? deliveryFee : 150;
    const serverTotal = serverSubtotal + serverDeliveryFee - serverDiscount;

    const order = await Order.create({
      user: req.user._id,
      customerName: customerName.trim(),
      whatsapp: whatsapp.trim(),
      address: address.trim(),
      city: city || process.env.BUSINESS_CITY || 'Chichawatni',
      items: itemsWithCost,
      subtotal: serverSubtotal,
      deliveryFee: serverDeliveryFee,
      discount: serverDiscount,
      total: serverTotal,
      paymentMethod: paymentMethod || 'COD',
      promoCode: promoCode?.toUpperCase() || '',
      notes: notes?.trim() || '',
      deliverySlot: deliverySlot || {},
    });

    // Decrement stock for each item (non-blocking, best-effort)
    itemsWithCost.forEach((item) => {
      if (item.product) {
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        }).catch(() => {});
      }
    });

    // Send WhatsApp notifications (non-blocking)
    const adminPhone = process.env.ADMIN_WHATSAPP;
    if (adminPhone) {
      sendWhatsApp(adminPhone, orderPlacedAdminMsg(order));
    }
    if (order.whatsapp) {
      sendWhatsApp(order.whatsapp, orderPlacedCustomerMsg(order));
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders/validate-promo — validate promo code without placing order
const PROMO_CODES = { SELLMIX20: 0.20, FIRST10: 0.10 };
router.post('/validate-promo', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ message: 'Promo code required' });
  const rate = PROMO_CODES[code.toUpperCase()];
  if (!rate) return res.status(400).json({ message: 'Invalid promo code' });
  const discount = Math.round((subtotal || 0) * rate);
  res.json({ valid: true, discount, rate });
});

// GET /api/orders/track/:orderId — public tracking
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('items.product', 'name images');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/stats/dashboard — admin dashboard stats
router.get('/stats/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, salesAgg, pendingDeliveries, newOrders, recentOrders] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ status: { $in: ['placed', 'packed', 'out_for_delivery'] } }),
      Order.countDocuments({ status: 'placed' }),
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      todayOrders,
      totalSales: salesAgg[0]?.total || 0,
      pendingDeliveries,
      newOrders,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/reports/daily — daily gross profit report (admin)
router.get('/reports/daily', protect, adminOnly, async (req, res) => {
  try {
    const { date } = req.query; // expects YYYY-MM-DD, defaults to today
    const day = new Date();
    if (date) {
      const [y, m, d] = date.split('-').map(Number);
      day.setFullYear(y, m - 1, d); // set in LOCAL time, not UTC
    }
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const orders = await Order.find({
      createdAt: { $gte: day, $lt: nextDay },
      status: { $ne: 'cancelled' },
    });

    // Aggregate product-level stats
    const productMap = {};
    let totalRevenue = 0;
    let totalCost = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const key = item.product?.toString() || item.name;
        if (!productMap[key]) {
          productMap[key] = {
            name: item.name,
            salePrice: item.price,
            costPrice: item.costPrice || 0,
            qtySold: 0,
            revenue: 0,
            cost: 0,
            grossProfit: 0,
          };
        }
        productMap[key].qtySold += item.quantity;
        productMap[key].revenue += item.price * item.quantity;
        productMap[key].cost += (item.costPrice || 0) * item.quantity;
        productMap[key].grossProfit += (item.price - (item.costPrice || 0)) * item.quantity;
        totalRevenue += item.price * item.quantity;
        totalCost += (item.costPrice || 0) * item.quantity;
      }
    }

    res.json({
      date: day.toISOString().split('T')[0],
      totalOrders: orders.length,
      totalRevenue,
      totalCost,
      grossProfit: totalRevenue - totalCost,
      products: Object.values(productMap).sort((a, b) => b.qtySold - a.qtySold),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/reports/range — last N days summary (admin)
router.get('/reports/range', protect, adminOnly, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const orders = await Order.find({
        createdAt: { $gte: day, $lt: nextDay },
        status: { $ne: 'cancelled' },
      });

      let revenue = 0, cost = 0;
      for (const o of orders) {
        for (const item of o.items) {
          revenue += item.price * item.quantity;
          cost += (item.costPrice || 0) * item.quantity;
        }
      }
      result.push({
        date: day.toISOString().split('T')[0],
        orders: orders.length,
        revenue,
        cost,
        grossProfit: revenue - cost,
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/my — logged-in user orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images price discountPrice stock');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders — all orders (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page) - 1) * Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ orders, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status — update status (admin)
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    // Fetch order first to check previous status
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const wasCancelled = order.status === 'cancelled';
    const isCancelling = status === 'cancelled';

    // Restore stock when cancelling (only if not already cancelled)
    if (isCancelling && !wasCancelled) {
      order.items.forEach((item) => {
        if (item.product) {
          Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          }).catch(() => {});
        }
      });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
