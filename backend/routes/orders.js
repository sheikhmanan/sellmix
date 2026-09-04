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
const isDev = process.env.NODE_ENV !== 'production';
const errMsg = (err) => isDev ? err.message : 'Internal server error';
// Snapshot costPrice from Product; recalculate subtotal server-side to prevent
// manipulation. Shared by the create route and the "repeat order" route below.
async function priceItems(items, deliveryFee) {
  let serverSubtotal = 0;
  let serverMrpTotal = 0;
  const itemsWithCost = await Promise.all(
    items.map(async (item) => {
      const prod = item.product ? await Product.findById(item.product).select('costPrice price discountPrice') : null;
      const unitPrice = prod ? (prod.discountPrice > 0 ? prod.discountPrice : prod.price) : (item.price || 0);
      const unitMrp = prod ? prod.price : unitPrice;
      serverSubtotal += unitPrice * (item.quantity || 1);
      serverMrpTotal += unitMrp * (item.quantity || 1);
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
  const serverProductDiscount = serverMrpTotal - serverSubtotal;
  const serverDeliveryFee = typeof deliveryFee === 'number' ? deliveryFee : 150;
  const serverTotal = serverSubtotal + serverDeliveryFee;
  return { itemsWithCost, serverSubtotal, serverProductDiscount, serverDeliveryFee, serverTotal };
}

// Decrements stock and sends WhatsApp notifications for a newly-created order
// (non-blocking, best-effort). Shared by the create route and the "repeat
// order" route below.
function finalizeNewOrder(order) {
  order.items.forEach((item) => {
    if (item.product) {
      Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }).catch(() => {});
    }
  });
  const adminPhone = process.env.ADMIN_WHATSAPP;
  if (adminPhone) sendWhatsApp(adminPhone, orderPlacedAdminMsg(order));
  if (order.whatsapp) sendWhatsApp(order.whatsapp, orderPlacedCustomerMsg(order));
}

router.post('/', protect, async (req, res) => {
  try {
    const { customerName, whatsapp, address, items, deliveryFee,
            total, paymentMethod, notes, city, deliverySlot } = req.body;

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

    const { itemsWithCost, serverSubtotal, serverProductDiscount, serverDeliveryFee, serverTotal } =
      await priceItems(items, deliveryFee);

    const order = await Order.create({
      user: req.user._id,
      customerName: customerName.trim(),
      whatsapp: whatsapp.trim(),
      address: address.trim(),
      city: city || process.env.BUSINESS_CITY || 'Chichawatni',
      items: itemsWithCost,
      subtotal: serverSubtotal,
      productDiscount: serverProductDiscount,
      deliveryFee: serverDeliveryFee,
      total: serverTotal,
      paymentMethod: paymentMethod || 'COD',
      notes: notes?.trim() || '',
      deliverySlot: deliverySlot || {},
    });

    finalizeNewOrder(order);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: errMsg(err) });
  }
});

// POST /api/orders/:id/repeat — create a new order that re-orders an existing
// one for the same customer, at current prices/stock (admin)
router.post('/:id/repeat', protect, adminOnly, async (req, res) => {
  try {
    const original = await Order.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Order not found' });
    if (!original.items?.length) return res.status(400).json({ message: 'Order has no items to repeat' });

    const { itemsWithCost, serverSubtotal, serverProductDiscount, serverDeliveryFee, serverTotal } =
      await priceItems(original.items, original.deliveryFee);

    const order = await Order.create({
      user: original.user,
      customerName: original.customerName,
      whatsapp: original.whatsapp,
      address: original.address,
      city: original.city,
      items: itemsWithCost,
      subtotal: serverSubtotal,
      productDiscount: serverProductDiscount,
      deliveryFee: serverDeliveryFee,
      total: serverTotal,
      paymentMethod: original.paymentMethod,
      notes: original.notes,
      deliverySlot: {},
    });

    finalizeNewOrder(order);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: errMsg(err) });
  }
});

// GET /api/orders/track/:orderId — public tracking (safe subset only)
router.get('/track/:orderId', async (req, res) => {
  try {
    // Validate orderId format to prevent injection/enumeration probing
    if (!/^SLX-\d+$/.test(req.params.orderId)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const order = await Order.findOne({ orderId: req.params.orderId })
      .select('orderId status customerName city deliverySlot items subtotal deliveryFee discount total paymentMethod createdAt')
      .populate('items.product', 'name images');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Strip costPrice from items before sending — it's internal business data
    const safeOrder = order.toObject();
    safeOrder.items = safeOrder.items.map(({ costPrice: _, ...item }) => item);
    res.json(safeOrder);
  } catch (err) {
    res.status(500).json({ message: errMsg(err) });
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
    res.status(500).json({ message: errMsg(err) });
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
    res.status(500).json({ message: errMsg(err) });
  }
});

// GET /api/orders/reports/range — per-day summary (admin).
// Pass either ?from=YYYY-MM-DD&to=YYYY-MM-DD for an explicit range, or
// ?days=N for the last N days ending today (default 7).
router.get('/reports/range', protect, adminOnly, async (req, res) => {
  try {
    const { from, to } = req.query;
    let startDay;
    let numDays;

    if (from && to) {
      const [fy, fm, fd] = from.split('-').map(Number);
      const [ty, tm, td] = to.split('-').map(Number);
      startDay = new Date(fy, fm - 1, fd);
      const endDay = new Date(ty, tm - 1, td);
      startDay.setHours(0, 0, 0, 0);
      endDay.setHours(0, 0, 0, 0);
      numDays = Math.round((endDay - startDay) / 86400000) + 1;
      if (!(numDays >= 1)) return res.status(400).json({ message: '"to" must not be before "from"' });
    } else {
      numDays = parseInt(req.query.days) || 7;
      startDay = new Date();
      startDay.setHours(0, 0, 0, 0);
      startDay.setDate(startDay.getDate() - (numDays - 1));
    }

    const MAX_DAYS = 366;
    if (numDays > MAX_DAYS) return res.status(400).json({ message: `Range too large (max ${MAX_DAYS} days)` });

    const result = [];
    for (let i = 0; i < numDays; i++) {
      const day = new Date(startDay);
      day.setDate(day.getDate() + i);
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
    res.status(500).json({ message: errMsg(err) });
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
    res.status(500).json({ message: errMsg(err) });
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
    res.status(500).json({ message: errMsg(err) });
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
    res.status(500).json({ message: errMsg(err) });
  }
});

module.exports = router;
