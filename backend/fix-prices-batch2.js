const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

const updates = [
  { name: 'Red Bull Energy Drink', price: 500, discountPrice: 0, costPrice: 480 },
  { name: 'Sting Energy Drink', price: 85, discountPrice: 65, costPrice: 75 },
  { name: 'Brooke Bond Supreme Tea', price: 380, discountPrice: 370, costPrice: 350 },
  { name: 'Nestle Nesfruita Apple', price: 160, discountPrice: 150, costPrice: 140 },
  { name: 'Fresher Mango Nectar', price: 90, discountPrice: 85, costPrice: 75 },
  { name: 'Sprite', price: 120, discountPrice: 115, costPrice: 100 },
  { name: 'Nestle Nesfruita Mango', price: 160, discountPrice: 150, costPrice: 140 },
  { name: 'Nestle Fruita Vitals Mango', price: 390, discountPrice: 0, costPrice: 370 },
];

async function run() {
  await connectDB();
  for (const u of updates) {
    const product = await Product.findOne({ name: new RegExp(u.name, 'i') });
    if (!product) { console.log(`❌ Not found: ${u.name}`); continue; }

    // Update base prices
    product.price = u.price;
    product.discountPrice = u.discountPrice;
    product.costPrice = u.costPrice;

    // Update weightOptions salePrice if they exist
    if (product.weightOptions?.length > 0) {
      const ratio = u.price > 0 && u.discountPrice > 0 ? u.discountPrice / u.price : 1;
      product.weightOptions = product.weightOptions.map((w) => ({
        ...w.toObject(),
        price: u.price,
        salePrice: ratio < 1 ? Math.round(u.price * ratio) : 0,
      }));
    }

    await product.save();
    console.log(`✅ ${product.name} — S=${u.price} D=${u.discountPrice} C=${u.costPrice}`);
  }
  process.exit(0);
  console.log('Done');
}

run().catch(console.error);
