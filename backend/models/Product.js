const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  images: [{ type: String }],
  weightOptions: [{ weight: String, price: Number, salePrice: { type: Number, default: 0 }, image: { type: String, default: '' } }],
  unit: { type: String, default: 'kg' },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [{ type: String }],
  nutritionalInfo: { type: String, default: '' },
  cookingInstructions: { type: String, default: '' },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
