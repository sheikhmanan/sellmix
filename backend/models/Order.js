const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  costPrice: { type: Number, default: 0 }, // snapshot of cost at time of sale
  quantity: Number,
  weight: String,
  image: String,
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  whatsapp: { type: String, required: true },
  address: { type: String, required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 150 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['COD', 'EasyPaisa', 'JazzCash'],
    default: 'COD',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['placed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
  },
  promoCode: { type: String, default: '' },
  notes: { type: String, default: '' },
  city: { type: String, default: 'Chichawatni' },
}, { timestamps: true });

orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `SLX-${9000 + count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
