const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

// Each entry: base price/discountPrice/costPrice + exact variant weight label from DB
const updates = [
  // Shampoos & Conditioners
  { name: 'Sunsilk Hair Fall Shampoo',              weight: '185ml', price: 399, salePrice: 340, costPrice: 360 },
  { name: 'Pantene Anti-Hairfall Shampoo',          weight: '185ml', price: 450, salePrice: 440, costPrice: 420 },
  { name: 'Pantene Deep Black Shampoo',             weight: '185ml', price: 450, salePrice: 440, costPrice: 420 },
  { name: 'Head.*Shoulders.*Classic Clean',         weight: '185ml', price: 470, salePrice: 460, costPrice: 450 },
  { name: 'Head.*Shoulders.*Smooth.*Silky Shampoo', weight: '185ml', price: 470, salePrice: 460, costPrice: 450 },
  { name: 'Head.*Shoulders.*Silky Black Shampoo',   weight: '185ml', price: 470, salePrice: 460, costPrice: 450 },
  { name: 'Head.*Shoulders.*Dry Scalp',             weight: '185ml', price: 470, salePrice: 465, costPrice: 450 },
  { name: 'Head.*Shoulders.*Neem',                  weight: '185ml', price: 470, salePrice: 0,   costPrice: 450 },
  { name: 'Head.*Shoulders.*Silky Black.*2-in-1',   weight: '190ml', price: 470, salePrice: 0,   costPrice: 450 },
  { name: 'Head.*Shoulders.*Smooth.*Silky.*2-in-1', weight: '190ml', price: 470, salePrice: 0,   costPrice: 450 },
  { name: 'Sunsilk Black Shine Shampoo',            weight: '185ml', price: 450, salePrice: 445, costPrice: 420 },
  { name: 'Sunsilk Black Shine Conditioner',        weight: '180ml', price: 480, salePrice: 470, costPrice: 450 },
  { name: 'Sunsilk Thick.*Long Conditioner',        weight: '180ml', price: 480, salePrice: 475, costPrice: 460 },
  { name: 'Pantene Smooth.*Strong Shampoo',         weight: '185ml', price: 450, salePrice: 440, costPrice: 420 },
  // Soaps — Capri (no discount)
  { name: 'Capri Aloe Nurture Soap',    weight: '125gm', price: 140, salePrice: 0,   costPrice: 130 },
  { name: 'Capri Water Lily Soap',      weight: '125gm', price: 140, salePrice: 0,   costPrice: 130 },
  { name: 'Capri Velvet Orchid Soap',   weight: '125gm', price: 140, salePrice: 0,   costPrice: 130 },
  { name: 'Capri Nourishing Peach Soap',weight: '125gm', price: 140, salePrice: 0,   costPrice: 130 },
  // Dove Beauty Bar (variant label is "106gm" in DB)
  { name: 'Dove Beauty Bar',            weight: '106gm', price: 530, salePrice: 510, costPrice: 470 },
  // Palmolive soaps
  { name: 'Palmolive Flawless Glow Soap',     weight: '130gm', price: 148, salePrice: 145, costPrice: 135 },
  { name: 'Palmolive Refreshing Glow Soap',   weight: '130gm', price: 148, salePrice: 145, costPrice: 135 },
  { name: 'Palmolive Radiant Glow Soap',      weight: '130gm', price: 148, salePrice: 145, costPrice: 135 },
  { name: 'Palmolive Moisturising Glow Soap', weight: '130gm', price: 148, salePrice: 145, costPrice: 135 },
  { name: 'Palmolive Hydrating Glow Soap',    weight: '130gm', price: 148, salePrice: 145, costPrice: 135 },
  // Safeguard soaps (no discount)
  { name: 'Safeguard Floral Bloom Soap', weight: '125gm', price: 175, salePrice: 0, costPrice: 160 },
  { name: 'Safeguard Lemon Fresh Soap',  weight: '125gm', price: 175, salePrice: 0, costPrice: 160 },
  { name: 'Safeguard Pure White Soap',   weight: '125gm', price: 175, salePrice: 0, costPrice: 160 },
  // Dettol single-variant soaps (no discount)
  { name: 'Dettol Lemon Fresh Soap', weight: '72gm',  price: 130, salePrice: 0, costPrice: 120 },
  { name: 'Dettol Skin Care Soap',   weight: '80gm',  price: 130, salePrice: 0, costPrice: 120 },
  // Lux soaps (no discount)
  { name: 'Lux Velvet Touch Soap', weight: '98gm',  price: 98,  salePrice: 0, costPrice: 90 },
  { name: 'Lux Fresh Glow Soap',   weight: '130gm', price: 150, salePrice: 0, costPrice: 140 },
];

// Dettol Cool & Original: 2-variant products — update both variants + costPrice
const twoVariants = [
  {
    name: 'Dettol Cool Soap',
    costPrice: 120,
    variants: [{ weight: '85gm', price: 130, salePrice: 0 }, { weight: '110gm', price: 150, salePrice: 0 }],
  },
  {
    name: 'Dettol Original Soap',
    costPrice: 120,
    variants: [{ weight: '85gm', price: 130, salePrice: 0 }, { weight: '110gm', price: 150, salePrice: 0 }],
  },
];

async function run() {
  await connectDB();
  let updated = 0;

  for (const u of updates) {
    const p = await Product.findOne({ name: new RegExp(u.name, 'i') });
    if (!p) { console.log(`❌  ${u.name}`); continue; }
    p.price = u.price;
    p.discountPrice = u.salePrice > 0 ? u.salePrice : 0;
    p.costPrice = u.costPrice;
    const img = p.weightOptions?.find(w => w.weight === u.weight)?.image || p.weightOptions?.[0]?.image || '';
    p.weightOptions = [{ weight: u.weight, price: u.price, salePrice: u.salePrice, image: img }];
    await p.save();
    console.log(`✅  ${p.name} | ${u.weight} S=${u.price} D=${u.salePrice || '-'}`);
    updated++;
  }

  for (const u of twoVariants) {
    const p = await Product.findOne({ name: new RegExp(u.name, 'i') });
    if (!p) { console.log(`❌  ${u.name}`); continue; }
    p.price = u.variants[0].price;
    p.discountPrice = 0;
    p.costPrice = u.costPrice;
    const imgs = {};
    (p.weightOptions || []).forEach(w => { imgs[w.weight] = w.image || ''; });
    p.weightOptions = u.variants.map(v => ({ weight: v.weight, price: v.price, salePrice: v.salePrice, image: imgs[v.weight] || '' }));
    await p.save();
    console.log(`✅  ${p.name} | ${u.variants.map(v => v.weight + '(S:' + v.price + ')').join(', ')}`);
    updated++;
  }

  console.log(`\n🎉 Done — ${updated} updated`);
  process.exit(0);
}

run().catch(console.error);
