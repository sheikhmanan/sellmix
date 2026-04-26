const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

// Simple single-product updates (Tibet Deluxe and Sensodyne Fluoride skipped — no prices given)
const simple = [
  { name: 'Dove Intense Repair Shampoo',          price: 520, discountPrice: 510, costPrice: 570 },
  { name: 'Dove Hair Fall Rescue Shampoo',         price: 470, discountPrice: 460, costPrice: 430 },
  { name: 'Dove Intense Repair Conditioner',       price: 540, discountPrice: 0,   costPrice: 500 },
  { name: 'Palmolive.*Intensive Moisture Shampoo', price: 400, discountPrice: 390, costPrice: 360 },
  { name: 'Lifebuoy Herbal Shampoo',               price: 370, discountPrice: 360, costPrice: 350 },
  { name: 'Lifebuoy Silky Soft Shampoo',           price: 370, discountPrice: 360, costPrice: 350 },
  { name: 'Sunsilk Hair Fall Shampoo',             price: 399, discountPrice: 390, costPrice: 360 },
  { name: 'Pantene Anti-Hairfall Shampoo',         price: 450, discountPrice: 440, costPrice: 420 },
  { name: 'Pantene Deep Black Shampoo',            price: 450, discountPrice: 440, costPrice: 420 },
  { name: 'Head.*Shoulders.*Classic Clean',        price: 470, discountPrice: 460, costPrice: 450 },
  { name: 'Head.*Shoulders.*Smooth.*Silky Shampoo',price: 470, discountPrice: 460, costPrice: 450 },
  { name: 'Head.*Shoulders.*Silky Black Shampoo',  price: 470, discountPrice: 460, costPrice: 450 },
  { name: 'Head.*Shoulders.*Dry Scalp',            price: 470, discountPrice: 465, costPrice: 450 },
  { name: 'Head.*Shoulders.*Neem',                 price: 470, discountPrice: 0,   costPrice: 450 },
  { name: 'Head.*Shoulders.*Silky Black.*2-in-1',  price: 470, discountPrice: 0,   costPrice: 450 },
  { name: 'Head.*Shoulders.*Smooth.*Silky.*2-in-1',price: 470, discountPrice: 0,   costPrice: 450 },
  { name: 'Sunsilk Black Shine Shampoo',           price: 450, discountPrice: 445, costPrice: 420 },
  { name: 'Sunsilk Black Shine Conditioner',       price: 480, discountPrice: 470, costPrice: 450 },
  { name: 'Sunsilk Thick.*Long Conditioner',       price: 480, discountPrice: 475, costPrice: 460 },
  { name: 'Pantene Smooth.*Strong Shampoo',        price: 450, discountPrice: 440, costPrice: 420 },
  { name: 'Capri Aloe Nurture',                    price: 140, discountPrice: 0,   costPrice: 130 },
  { name: 'Dove Beauty Bar',                       price: 530, discountPrice: 510, costPrice: 470 },
  { name: 'Capri Water Lily',                      price: 140, discountPrice: 0,   costPrice: 130 },
  { name: 'Capri Velvet Orchid',                   price: 140, discountPrice: 0,   costPrice: 130 },
  { name: 'Capri Nourishing Peach',                price: 140, discountPrice: 0,   costPrice: 130 },
  { name: 'Palmolive Flawless Glow',               price: 148, discountPrice: 145, costPrice: 135 },
  { name: 'Palmolive Refreshing Glow',             price: 148, discountPrice: 145, costPrice: 135 },
  { name: 'Palmolive Radiant Glow',                price: 148, discountPrice: 145, costPrice: 135 },
  { name: 'Palmolive Moisturising Glow',           price: 148, discountPrice: 145, costPrice: 135 },
  { name: 'Palmolive Hydrating Glow',              price: 148, discountPrice: 145, costPrice: 135 },
  { name: 'Safeguard Floral Bloom',                price: 175, discountPrice: 0,   costPrice: 160 },
  { name: 'Safeguard Lemon Fresh',                 price: 175, discountPrice: 0,   costPrice: 160 },
  { name: 'Safeguard Pure White',                  price: 175, discountPrice: 0,   costPrice: 160 },
  { name: 'Dettol Lemon Fresh Soap',               price: 130, discountPrice: 0,   costPrice: 120 },
  { name: 'Dettol Skin Care Soap',                 price: 130, discountPrice: 0,   costPrice: 120 },
  { name: 'Lux Velvet Touch Soap',                 price: 98,  discountPrice: 0,   costPrice: 90 },
  { name: 'Lux Fresh Glow Soap',                   price: 150, discountPrice: 0,   costPrice: 140 },
  { name: 'Lux Purple Lotus Soap',                 price: 150, discountPrice: 0,   costPrice: 140 },
  { name: 'Lux Velvet Glow Soap',                  price: 150, discountPrice: 0,   costPrice: 140 },
  { name: 'Lifebuoy Herbal Soap',                  price: 125, discountPrice: 0,   costPrice: 110 },
  { name: 'Lifebuoy Care.*Protect Soap',           price: 125, discountPrice: 0,   costPrice: 110 },
  { name: 'Lifebuoy Lemon Fresh Soap',             price: 130, discountPrice: 0,   costPrice: 120 },
  { name: 'Parodontax Original',                   price: 510, discountPrice: 500, costPrice: 490 },
  { name: 'Parodontax Extra Fresh',                price: 330, discountPrice: 320, costPrice: 300 },
  { name: 'Sensodyne Original',                    price: 345, discountPrice: 340, costPrice: 330 },
  { name: 'Sensodyne Rapid Relief',                price: 340, discountPrice: 336, costPrice: 325 },
  { name: 'Sensodyne Complete Protection',         price: 340, discountPrice: 332, costPrice: 325 },
  { name: 'Sensodyne Repair.*Protect',             price: 500, discountPrice: 490, costPrice: 470 },
  { name: 'Sensodyne Extra Whitening',             price: 330, discountPrice: 0,   costPrice: 310 },
  { name: 'Sensodyne Deep Clean',                  price: 385, discountPrice: 380, costPrice: 370 },
  { name: 'Medicam Dental Cream',                  price: 365, discountPrice: 355, costPrice: 340 },
];

// Variant products — update base + weightOption prices
const variantUpdates = [
  {
    search: 'Dettol Cool Soap',
    base: { price: 130, discountPrice: 0, costPrice: 120 },
    variants: [
      { weight: '85gm',  price: 130, salePrice: 0 },
      { weight: '110gm', price: 150, salePrice: 0 },
    ],
  },
  {
    search: 'Dettol Original Soap',
    base: { price: 130, discountPrice: 0, costPrice: 120 },
    variants: [
      { weight: '85gm',  price: 130, salePrice: 0 },
      { weight: '110gm', price: 150, salePrice: 0 },
    ],
  },
  {
    search: 'Colgate Herbal Toothpaste',
    base: { price: 325, discountPrice: 310, costPrice: 300 },
    variants: [
      { weight: '150g', price: 325, salePrice: 310 },
      { weight: '200g', price: 400, salePrice: 180 },
    ],
  },
  {
    search: "Forhan's Toothpaste",
    base: { price: 95, discountPrice: 90, costPrice: 80 },
    variants: [
      { weight: '40g',  price: 95,  salePrice: 90 },
      { weight: '180g', price: 375, salePrice: 370 },
    ],
  },
  {
    search: 'Colgate MaxFresh Toothpaste',
    base: { price: 220, discountPrice: 210, costPrice: 190 },
    variants: [
      { weight: '75g',  price: 220, salePrice: 210 },
      { weight: '125g', price: 325, salePrice: 315 },
    ],
  },
];

async function run() {
  await connectDB();
  let updated = 0;

  for (const u of simple) {
    const p = await Product.findOne({ name: new RegExp(u.name, 'i') });
    if (!p) { console.log(`❌  ${u.name}`); continue; }
    p.price = u.price; p.discountPrice = u.discountPrice; p.costPrice = u.costPrice;
    await p.save();
    console.log(`✅  ${p.name}`);
    updated++;
  }

  for (const u of variantUpdates) {
    const p = await Product.findOne({ name: new RegExp(u.search, 'i') });
    if (!p) { console.log(`❌  ${u.search}`); continue; }
    p.price = u.base.price; p.discountPrice = u.base.discountPrice; p.costPrice = u.base.costPrice;
    const imgs = {};
    (p.weightOptions || []).forEach((w) => { imgs[w.weight] = w.image || ''; });
    p.weightOptions = u.variants.map((v) => ({ weight: v.weight, price: v.price, salePrice: v.salePrice, image: imgs[v.weight] || '' }));
    await p.save();
    console.log(`✅  ${p.name} (variants: ${u.variants.map(v => v.weight).join(', ')})`);
    updated++;
  }

  console.log(`\n🎉 Done — ${updated} updated`);
  process.exit(0);
}

run().catch(console.error);
