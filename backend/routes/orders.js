const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const { sendWhatsApp, orderPlacedAdminMsg, orderPlacedCustomerMsg } = require('../services/whatsapp');

// POST /api/orders — place order (public, no login required)
router.post('/', async (req, res) => {
  try {
    // Snapshot costPrice from Product into each order item at time of sale
    const itemsWithCost = await Promise.all(
      (req.body.items || []).map(async (item) => {
        if (item.product) {
          const prod = await Product.findById(item.product).select('costPrice');
          return { ...item, costPrice: prod?.costPrice || 0 };
        }
        return { ...item, costPrice: 0 };
      })
    );
    const order = await Order.create({ ...req.body, items: itemsWithCost });

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

    const [todayOrders, salesAgg, pendingDeliveries, recentOrders] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ status: { $in: ['placed', 'packed', 'out_for_delivery'] } }),
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      todayOrders,
      totalSales: salesAgg[0]?.total || 0,
      pendingDeliveries,
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
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
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
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
