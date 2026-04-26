const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

// Single-variant products — weight label from DB, corrected where needed
const updates = [
  { name: 'Lux Purple Lotus Soap',    weight: '128gm', price: 150, salePrice: 0,   costPrice: 140 },
  { name: 'Lux Velvet Glow Soap',     weight: '128gm', price: 150, salePrice: 0,   costPrice: 140 },
  { name: 'Lifebuoy Herbal Soap',     weight: '128gm', price: 125, salePrice: 0,   costPrice: 110 },
  { name: 'Lifebuoy Care.*Protect Soap', weight: '128gm', price: 125, salePrice: 0, costPrice: 110 },
  { name: 'Lifebuoy Lemon Fresh Soap',weight: '128gm', price: 130, salePrice: 0,   costPrice: 120 },
  { name: 'Parodontax Original',      weight: '100g',  price: 510, salePrice: 500, costPrice: 490 },  // correct label to 100g
  { name: 'Parodontax Extra Fresh',   weight: '75g',   price: 330, salePrice: 320, costPrice: 300 },
  { name: 'Sensodyne Original',       weight: '70g',   price: 345, salePrice: 340, costPrice: 330 },  // correct label to 70g
  { name: 'Sensodyne Rapid Relief',   weight: '70g',   price: 340, salePrice: 336, costPrice: 325 },
  { name: 'Sensodyne Complete Protection', weight: '70g', price: 340, salePrice: 332, costPrice: 325 },
  { name: 'Sensodyne Repair.*Protect',weight: '70g',   price: 500, salePrice: 490, costPrice: 470 },
  { name: 'Sensodyne Extra Whitening',weight: '70g',   price: 330, salePrice: 0,   costPrice: 310 },
  { name: 'Sensodyne Deep Clean',     weight: '70g',   price: 385, salePrice: 380, costPrice: 370 },
  { name: 'Medicam Dental Cream',     weight: '180g',  price: 365, salePrice: 355, costPrice: 340 },  // correct label to 180g
];

// Colgate Herbal — already has 2 variants, just confirm prices
const colgate = {
  name: 'Colgate Herbal Toothpaste',
  base: { price: 325, discountPrice: 310, costPrice: 300 },
  variants: [
    { weight: '150g', price: 325, salePrice: 310 },
    { weight: '200g', price: 400, salePrice: 180 },
  ],
};

async function run() {
  await connectDB();
  let updated = 0;

  for (const u of updates) {
    const p = await Product.findOne({ name: new RegExp(u.name, 'i') });
    if (!p) { console.log(`❌  ${u.name}`); continue; }
    p.price = u.price;
    p.discountPrice = u.salePrice > 0 ? u.salePrice : 0;
    p.costPrice = u.costPrice;
    const existingImg = p.weightOptions?.[0]?.image || '';
    p.weightOptions = [{ weight: u.weight, price: u.price, salePrice: u.salePrice, image: existingImg }];
    await p.save();
    console.log(`✅  ${p.name} | ${u.weight} S=${u.price} D=${u.salePrice || '-'}`);
    updated++;
  }

  // Colgate Herbal 2-variant
  const cp = await Product.findOne({ name: /Colgate Herbal Toothpaste/i });
  if (cp) {
    cp.price = colgate.base.price;
    cp.discountPrice = colgate.base.discountPrice;
    cp.costPrice = colgate.base.costPrice;
    const imgs = {};
    (cp.weightOptions || []).forEach(w => { imgs[w.weight] = w.image || ''; });
    cp.weightOptions = colgate.variants.map(v => ({ weight: v.weight, price: v.price, salePrice: v.salePrice, image: imgs[v.weight] || '' }));
    await cp.save();
    console.log(`✅  ${cp.name} | 150g(S:325 D:310), 200g(S:400 D:180)`);
    updated++;
  }

  console.log(`\n🎉 Done — ${updated} updated`);
  console.log('ℹ️  Sensodyne Fluoride skipped — no prices provided');
  process.exit(0);
}

run().catch(console.error);
