const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: '' },
  image: { type: String, default: '' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  level: { type: Number, default: 1 }, // 1 = Category, 2 = Subcategory, 3 = Sub-subcategory
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
