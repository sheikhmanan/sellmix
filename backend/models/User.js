const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, unique: true, trim: true },
  email: { type: String, unique: true, sparse: true, trim: true },
  password: { type: String, required: true },
  address: { type: String, default: '' },
  city: { type: String, default: 'Chichawatni' },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
