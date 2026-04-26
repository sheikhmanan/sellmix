const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

// Products stored as single product with weightOptions variants
// base price = first/lowest variant; each variant gets exact salePrice
const variantUpdates = [
  {
    search: 'Dove Men Care Soap',
    base: { price: 530, discountPrice: 500, costPrice: 480 },
    variants: [
      { weight: '106g Clean Comfort', price: 530, salePrice: 500 },
      { weight: '106g Deep Clean',    price: 530, salePrice: 500 },
    ],
  },
  {
    search: 'Axe Body Spray',
    base: { price: 880, discountPrice: 850, costPrice: 800 },
    variants: [
      { weight: '150ml Musk',             price: 880, salePrice: 850 },
      { weight: '150ml Dark Temptation',  price: 880, salePrice: 850 },
    ],
  },
  {
    search: 'Fa Men Roll-On',
    base: { price: 490, discountPrice: 450, costPrice: 420 },
    variants: [
      { weight: '50ml Lime Ginger',       price: 490, salePrice: 450 },
      { weight: '50ml Invisible Power',   price: 640, salePrice: 600 },
    ],
  },
  {
    search: 'Gillette Razor',
    base: { price: 350, discountPrice: 0, costPrice: 340 },
    variants: [
      { weight: 'Blue 3 Comfort', price: 350, salePrice: 0 },
      { weight: 'Blue 2+',        price: 330, salePrice: 0 },
    ],
  },
  {
    search: 'Gillette Shaving Foam',
    base: { price: 980, discountPrice: 0, costPrice: 970 },
    variants: [
      { weight: '200ml Sensitive', price: 980,  salePrice: 0 },
      { weight: '200ml Regular',   price: 1050, salePrice: 0 },
    ],
  },
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
    search: 'Lux Velvet Touch Soap',
    base: { price: 98, discountPrice: 0, costPrice: 90 },
    variants: [
      { weight: '98gm', price: 98, salePrice: 0 },
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
      { weight: '40g',  price: 95,  salePrice: 90 },   // keep existing "40g" label
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
  {
    search: 'Molfix Baby Diapers',
    base: { price: 2450, discountPrice: 2400, costPrice: 2350 },
    variants: [
      { weight: 'Newborn (78 pcs)',           price: 2450, salePrice: 2400 },
      { weight: 'Junior Size 5 (44 pcs)',      price: 2450, salePrice: 2400 },
      { weight: 'Extra Large Size 6 (38 pcs)', price: 2450, salePrice: 2400 },
    ],
  },
  {
    search: "Johnson's Petroleum Jelly",
    base: { price: 510, discountPrice: 500, costPrice: 480 },
    variants: [
      { weight: '100ml Fragranced',     price: 510, salePrice: 500 },
      { weight: '100ml Fragrance Free', price: 510, salePrice: 500 },
    ],
  },
  {
    search: "Johnson's Baby Soap",
    base: { price: 215, discountPrice: 0, costPrice: 200 },
    variants: [
      { weight: 'Original 100g',  price: 215, salePrice: 0 },
      { weight: 'Milk 100g',      price: 280, salePrice: 0 },  // keep DB label
      { weight: 'Blossoms 100g',  price: 215, salePrice: 0 },
    ],
  },
  {
    search: "Johnson's Baby Powder",
    base: { price: 460, discountPrice: 450, costPrice: 430 },
    variants: [
      { weight: '100g',        price: 460, salePrice: 450 },
      { weight: '200g Blossom', price: 830, salePrice: 810 },
    ],
  },
  {
    search: 'Harpic Bathroom Cleaner Floral',
    base: { price: 140, discountPrice: 0, costPrice: 130 },
    variants: [
      { weight: '125ml', price: 140, salePrice: 0 },
      { weight: '225ml', price: 300, salePrice: 0 },
      { weight: '450ml', price: 600, salePrice: 0 },
    ],
  },
  {
    search: 'Harpic Toilet Cleaner Original',
    base: { price: 150, discountPrice: 0, costPrice: 140 },
    variants: [
      { weight: '125ml', price: 150, salePrice: 0 },
      { weight: '225ml', price: 200, salePrice: 0 },
    ],
  },
  {
    search: 'Lemon Max Dishwash Bar',
    base: { price: 30, discountPrice: 0, costPrice: 27 },
    variants: [
      { weight: '85g',  price: 30,  salePrice: 0 },
      { weight: '530g', price: 160, salePrice: 0 },
    ],
  },
  {
    search: 'Lemon Max Liquid',
    base: { price: 165, discountPrice: 0, costPrice: 160 },
    variants: [
      { weight: '275ml',       price: 165, salePrice: 0 },
      { weight: '475ml Green', price: 255, salePrice: 250 },
      { weight: '475ml Yellow', price: 285, salePrice: 280 },
    ],
  },
  {
    search: 'Lemon Max Paste',
    base: { price: 240, discountPrice: 0, costPrice: 225 },
    variants: [
      { weight: '400g Green',  price: 240, salePrice: 0 },
      { weight: '400g Yellow', price: 240, salePrice: 0 },
    ],
  },
  {
    search: 'Express Power',
    base: { price: 215, discountPrice: 210, costPrice: 200 },
    variants: [
      { weight: '500g', price: 215, salePrice: 210 },
      { weight: '1kg',  price: 430, salePrice: 420 },
    ],
  },
  {
    search: 'Bonus Active',
    base: { price: 150, discountPrice: 0, costPrice: 140 },
    variants: [
      { weight: '500g', price: 150, salePrice: 0 },
      { weight: '1kg',  price: 240, salePrice: 235 },
    ],
  },
  {
    search: 'Brite Maximum Power',
    base: { price: 300, discountPrice: 290, costPrice: 275 },
    variants: [
      { weight: '500g', price: 300,  salePrice: 290 },
      { weight: '1kg',  price: 580,  salePrice: 570 },
      { weight: '2kg',  price: 1110, salePrice: 1080 },
    ],
  },
  {
    search: 'Ariel Original',
    base: { price: 275, discountPrice: 0, costPrice: 255 },
    variants: [
      { weight: '500g', price: 275, salePrice: 0 },
      { weight: '1kg',  price: 580, salePrice: 570 },
    ],
  },
  {
    search: 'Surf Excel',
    base: { price: 290, discountPrice: 0, costPrice: 280 },
    variants: [
      { weight: '500g', price: 290,  salePrice: 0 },
      { weight: '1kg',  price: 580,  salePrice: 570 },
      { weight: '2kg',  price: 1110, salePrice: 1080 },
    ],
  },
];

// Simple name-only fixes
const nameFixUpdates = [
  { search: 'Kalwangi.*Nigella',  price: 140, discountPrice: 0, costPrice: 120 },
  { search: 'Candi Candy',        price: 320, discountPrice: 0, costPrice: 300 },
];

async function run() {
  await connectDB();
  let updated = 0, notFound = 0;

  for (const u of variantUpdates) {
    const product = await Product.findOne({ name: new RegExp(u.search, 'i') });
    if (!product) { console.log(`❌ Not found: ${u.search}`); notFound++; continue; }

    product.price = u.base.price;
    product.discountPrice = u.base.discountPrice;
    product.costPrice = u.base.costPrice;

    // Match variant by weight label, preserve images
    const existingImages = {};
    (product.weightOptions || []).forEach((w) => { existingImages[w.weight] = w.image || ''; });

    product.weightOptions = u.variants.map((v) => ({
      weight: v.weight,
      price: v.price,
      salePrice: v.salePrice,
      image: existingImages[v.weight] || '',
    }));

    await product.save();
    const variantSummary = u.variants.map((v) => `${v.weight}(S:${v.price} D:${v.salePrice || '-'})`).join(', ');
    console.log(`✅  ${product.name} — ${variantSummary}`);
    updated++;
  }

  for (const u of nameFixUpdates) {
    const product = await Product.findOne({ name: new RegExp(u.search, 'i') });
    if (!product) { console.log(`❌ Not found: ${u.search}`); notFound++; continue; }
    product.price = u.price;
    product.discountPrice = u.discountPrice;
    product.costPrice = u.costPrice;
    await product.save();
    console.log(`✅  ${product.name}`);
    updated++;
  }

  console.log(`\n🎉 Done — ${updated} updated, ${notFound} not found`);
  if (notFound > 0) console.log('ℹ️  Not found: Cadbury Dairy Milk Bubbly, Matcher — these products are not in the database.');
  process.exit(0);
}

run().catch(console.error);
