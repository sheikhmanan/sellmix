const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

// These are the NEW duplicate products that were wrongly created (with weight suffix in name)
// We need to DELETE them
const DUPLICATES_TO_DELETE = [
  'National Chicken Tandoori Mix – 45g',
  'National Seekh Kabab Mix',
  'National Malai Boti Mix',
  'National Qeema Masala – 50g',
  'National Kaleji Masala – 45g',
  'National Paya Masala – 39g',
  'National Pulao Masala – 70g',
  'National Murghi Masala – 43g',
  'National Tikka Boti Mix – 44g',
  'National Garam Masala – 50g',
  'National Garam Masala – 100g',
  'National Biryani Masala – 78g',
];

// These are the REAL existing products (without weight suffix) — update their prices
const UPDATES = [
  { name: 'National Chicken Tandoori Mix', price: 150, discountPrice: 145, costPrice: 125 },
  { name: 'National Seekh Kabab Mix',      price: 150, discountPrice: 145, costPrice: 125 },
  { name: 'National Malai Boti Mix',       price: 150, discountPrice: 145, costPrice: 125 },
  { name: 'National Qeema Masala',         price: 150, discountPrice: 145, costPrice: 125 },
  { name: 'National Kaleji Masala',        price: 150, discountPrice: 145, costPrice: 125 },
  { name: 'National Paya Masala',          price: 150, discountPrice: 145, costPrice: 125 },
  { name: 'National Pulao Masala',         price: 150, discountPrice: 145, costPrice: 125 },
  { name: 'National Murghi Masala',        price: 150, discountPrice: 145, costPrice: 125 },
  { name: 'National Tikka Boti Mix',       price: 150, discountPrice: 145, costPrice: 125 },
  { name: 'National Garam Masala',         price: 150, discountPrice: 145, costPrice: 125 },
  { name: 'National Biryani Masala',       price: 150, discountPrice: 145, costPrice: 125 },
];

const run = async () => {
  await connectDB();

  console.log('\n🗑️  Deleting wrongly created duplicate products...');
  for (const name of DUPLICATES_TO_DELETE) {
    const result = await Product.deleteOne({ name });
    if (result.deletedCount > 0) {
      console.log(`  ✅  Deleted: ${name}`);
    } else {
      console.log(`  ⚠️   Not found: ${name}`);
    }
  }

  console.log('\n✏️  Updating prices on existing products...');
  for (const p of UPDATES) {
    const result = await Product.updateOne(
      { name: p.name },
      { $set: { price: p.price, discountPrice: p.discountPrice, costPrice: p.costPrice } }
    );
    if (result.matchedCount > 0) {
      console.log(`  ✅  Updated: ${p.name} → S=${p.price}, D=${p.discountPrice}, C=${p.costPrice}`);
    } else {
      console.log(`  ⚠️   Not found in DB: ${p.name}`);
    }
  }

  console.log('\n🎉 Done');
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
