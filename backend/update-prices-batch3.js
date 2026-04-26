const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

// D=0 means no discount (D==S). D>0 means sale price shown.
const updates = [
  // ── Health & Beauty ──────────────────────────────────────────
  { name: 'Glow & Handsome Face Cream',                   price: 199,  discountPrice: 0,    costPrice: 180 },
  { name: 'Dove Men Care Soap.*Clean Comfort',            price: 530,  discountPrice: 500,  costPrice: 480 },
  { name: 'Dove Men Care Soap.*Deep Clean',               price: 530,  discountPrice: 500,  costPrice: 480 },
  { name: 'Axe Body Spray.*Musk',                         price: 880,  discountPrice: 850,  costPrice: 800 },
  { name: 'Axe Body Spray.*Dark Temptation',              price: 880,  discountPrice: 850,  costPrice: 800 },
  { name: 'Fa Men Roll-On.*Lime Ginger',                  price: 490,  discountPrice: 450,  costPrice: 420 },
  { name: 'Fa Men Roll-On.*Invisible Power',              price: 640,  discountPrice: 600,  costPrice: 560 },
  { name: 'Gillette.*Blue 3.*Comfort',                    price: 350,  discountPrice: 0,    costPrice: 340 },
  { name: 'Gillette.*Blue 2',                             price: 330,  discountPrice: 0,    costPrice: 320 },
  { name: 'Gillette Shaving Foam.*Sensitive',             price: 980,  discountPrice: 0,    costPrice: 970 },
  { name: 'Gillette Shaving Foam.*Regular',               price: 1050, discountPrice: 0,    costPrice: 1000 },
  { name: 'Palmolive.*Healthy.*Smooth Shampoo',           price: 400,  discountPrice: 390,  costPrice: 350 },
  { name: 'Dove Intense Repair Shampoo',                  price: 520,  discountPrice: 510,  costPrice: 470 },
  { name: 'Dove Hair Fall Rescue Shampoo',                price: 470,  discountPrice: 460,  costPrice: 430 },
  { name: 'Dove Intense Repair Conditioner',              price: 540,  discountPrice: 0,    costPrice: 500 },
  { name: 'Palmolive.*Intensive Moisture Shampoo',        price: 400,  discountPrice: 390,  costPrice: 350 },
  { name: 'Lifebuoy Herbal Shampoo',                      price: 370,  discountPrice: 360,  costPrice: 350 },
  { name: 'Lifebuoy Silky Soft Shampoo',                  price: 370,  discountPrice: 360,  costPrice: 350 },
  { name: 'Sunsilk Hair Fall Shampoo',                    price: 399,  discountPrice: 340,  costPrice: 360 },
  { name: 'Pantene Anti-Hairfall Shampoo',                price: 450,  discountPrice: 440,  costPrice: 420 },
  { name: 'Pantene Deep Black Shampoo',                   price: 450,  discountPrice: 440,  costPrice: 420 },
  { name: 'Head.*Shoulders.*Classic Clean',               price: 470,  discountPrice: 465,  costPrice: 450 },
  { name: 'Head.*Shoulders.*Smooth.*Silky Shampoo',       price: 470,  discountPrice: 460,  costPrice: 450 },
  { name: 'Head.*Shoulders.*Silky Black Shampoo',         price: 470,  discountPrice: 465,  costPrice: 450 },
  { name: 'Head.*Shoulders.*Dry Scalp',                   price: 470,  discountPrice: 465,  costPrice: 450 },
  { name: 'Head.*Shoulders.*Neem',                        price: 470,  discountPrice: 0,    costPrice: 450 },
  { name: 'Head.*Shoulders.*Silky Black.*2-in-1',         price: 470,  discountPrice: 0,    costPrice: 450 },
  { name: 'Head.*Shoulders.*Smooth.*Silky.*2-in-1',       price: 470,  discountPrice: 0,    costPrice: 450 },
  { name: 'Sunsilk Black Shine Shampoo',                  price: 450,  discountPrice: 445,  costPrice: 420 },
  { name: 'Sunsilk Black Shine Conditioner',              price: 480,  discountPrice: 470,  costPrice: 450 },
  { name: 'Sunsilk Thick.*Long Conditioner',              price: 480,  discountPrice: 475,  costPrice: 460 },
  { name: 'Pantene Smooth.*Strong Shampoo',               price: 450,  discountPrice: 440,  costPrice: 420 },
  { name: 'Capri Aloe Nurture',                           price: 140,  discountPrice: 0,    costPrice: 130 },
  { name: 'Dove Beauty Bar',                              price: 530,  discountPrice: 510,  costPrice: 470 },
  { name: 'Capri Water Lily',                             price: 140,  discountPrice: 0,    costPrice: 130 },
  { name: 'Capri Velvet Orchid',                          price: 140,  discountPrice: 0,    costPrice: 130 },
  { name: 'Capri Nourishing Peach',                       price: 140,  discountPrice: 0,    costPrice: 130 },
  { name: 'Palmolive Flawless Glow',                      price: 148,  discountPrice: 145,  costPrice: 135 },
  { name: 'Palmolive Refreshing Glow',                    price: 148,  discountPrice: 145,  costPrice: 135 },
  { name: 'Palmolive Radiant Glow',                       price: 148,  discountPrice: 145,  costPrice: 135 },
  { name: 'Palmolive Moisturising Glow',                  price: 148,  discountPrice: 145,  costPrice: 135 },
  { name: 'Palmolive Hydrating Glow',                     price: 148,  discountPrice: 145,  costPrice: 135 },
  { name: 'Safeguard Floral Bloom',                       price: 175,  discountPrice: 0,    costPrice: 160 },
  { name: 'Safeguard Lemon Fresh',                        price: 175,  discountPrice: 0,    costPrice: 160 },
  { name: 'Safeguard Pure White',                         price: 175,  discountPrice: 0,    costPrice: 160 },
  { name: 'Dettol Lemon Fresh Soap',                      price: 130,  discountPrice: 0,    costPrice: 120 },
  { name: 'Dettol Skin Care Soap',                        price: 130,  discountPrice: 0,    costPrice: 120 },
  { name: 'Dettol Cool Soap 85g',                         price: 130,  discountPrice: 0,    costPrice: 120 },
  { name: 'Dettol Cool Soap 110g',                        price: 150,  discountPrice: 0,    costPrice: 140 },
  { name: 'Dettol Original Soap 85g',                     price: 130,  discountPrice: 0,    costPrice: 120 },
  { name: 'Dettol Original Soap 110g',                    price: 150,  discountPrice: 0,    costPrice: 140 },
  { name: 'Lux Velvet Touch.*98g',                        price: 98,   discountPrice: 0,    costPrice: 90 },
  { name: 'Lux Fresh Glow',                               price: 150,  discountPrice: 0,    costPrice: 140 },
  { name: 'Lux Purple Lotus',                             price: 150,  discountPrice: 0,    costPrice: 140 },
  { name: 'Lux Velvet Glow',                              price: 150,  discountPrice: 0,    costPrice: 140 },
  { name: 'Lifebuoy Herbal Soap',                         price: 125,  discountPrice: 0,    costPrice: 110 },
  { name: 'Lifebuoy Care.*Protect Soap',                  price: 125,  discountPrice: 0,    costPrice: 110 },
  { name: 'Lifebuoy Lemon Fresh Soap',                    price: 130,  discountPrice: 0,    costPrice: 120 },
  { name: 'Parodontax Original',                          price: 510,  discountPrice: 500,  costPrice: 490 },
  { name: 'Parodontax Extra Fresh',                       price: 330,  discountPrice: 320,  costPrice: 300 },
  { name: 'Sensodyne Original',                           price: 345,  discountPrice: 340,  costPrice: 330 },
  { name: 'Sensodyne Rapid Relief',                       price: 340,  discountPrice: 336,  costPrice: 325 },
  { name: 'Colgate Herbal.*150g',                         price: 325,  discountPrice: 310,  costPrice: 300 },
  { name: 'Colgate Herbal.*200g',                         price: 400,  discountPrice: 180,  costPrice: 170 },
  { name: 'Sensodyne Complete Protection',                price: 340,  discountPrice: 0,    costPrice: 320 },
  { name: 'Sensodyne Repair.*Protect',                    price: 500,  discountPrice: 490,  costPrice: 470 },
  { name: 'Sensodyne Extra Whitening',                    price: 330,  discountPrice: 0,    costPrice: 310 },
  { name: 'Sensodyne Deep Clean',                         price: 395,  discountPrice: 390,  costPrice: 370 },
  { name: 'Medicam Dental Cream',                         price: 365,  discountPrice: 355,  costPrice: 340 },
  { name: "Forhan's Toothpaste 35g",                      price: 95,   discountPrice: 90,   costPrice: 80 },
  { name: "Forhan's Toothpaste 180g",                     price: 375,  discountPrice: 370,  costPrice: 360 },
  { name: 'Colgate MaxFresh.*75g',                        price: 220,  discountPrice: 210,  costPrice: 190 },
  { name: 'Colgate MaxFresh.*125g',                       price: 325,  discountPrice: 315,  costPrice: 300 },
  { name: 'Nexton Baby Wipes',                            price: 525,  discountPrice: 510,  costPrice: 500 },
  { name: 'Molfix.*Newborn',                              price: 2450, discountPrice: 2400, costPrice: 2350 },
  { name: 'Molfix.*Junior.*Size 5',                       price: 2450, discountPrice: 2400, costPrice: 2350 },
  { name: 'Molfix.*Extra Large.*Size 6',                  price: 2450, discountPrice: 2400, costPrice: 2350 },
  { name: "Johnson's Petroleum Jelly.*Fragranc",          price: 510,  discountPrice: 500,  costPrice: 480 },
  { name: "Johnson's Baby Wipes",                         price: 250,  discountPrice: 0,    costPrice: 230 },
  { name: "Johnson's Baby Bath",                          price: 630,  discountPrice: 610,  costPrice: 590 },
  { name: "Johnson's Baby Shampoo",                       price: 850,  discountPrice: 835,  costPrice: 800 },
  { name: "Johnson's Baby Soap Original",                 price: 215,  discountPrice: 0,    costPrice: 200 },
  { name: "Johnson's Baby Soap Milk",                     price: 280,  discountPrice: 0,    costPrice: 270 },
  { name: "Johnson's Baby Soap Blossoms",                 price: 215,  discountPrice: 0,    costPrice: 200 },
  { name: "Johnson's Baby Powder 100g",                   price: 460,  discountPrice: 450,  costPrice: 430 },
  { name: "Johnson's Baby Powder Blossom",                price: 830,  discountPrice: 810,  costPrice: 800 },
  { name: "Johnson's Baby Lotion",                        price: 910,  discountPrice: 880,  costPrice: 850 },

  // ── Laundry & Household ──────────────────────────────────────
  { name: 'Robin Liquid Bleach',                          price: 650,  discountPrice: 0,    costPrice: 630 },
  { name: 'Robin Liquid Blue',                            price: 600,  discountPrice: 590,  costPrice: 580 },
  { name: 'Dettol Surface Cleaner Floral',                price: 825,  discountPrice: 0,    costPrice: 810 },
  { name: 'Dettol Surface Cleaner Citrus',                price: 825,  discountPrice: 0,    costPrice: 810 },
  { name: 'Dettol Surface Cleaner Lavender',              price: 825,  discountPrice: 0,    costPrice: 810 },
  { name: 'Dettol Surface Cleaner Aqua',                  price: 825,  discountPrice: 0,    costPrice: 810 },
  { name: 'Harpic Bathroom Cleaner.*125ml',               price: 140,  discountPrice: 0,    costPrice: 130 },
  { name: 'Harpic Bathroom Cleaner.*225ml',               price: 300,  discountPrice: 0,    costPrice: 280 },
  { name: 'Harpic Bathroom Cleaner.*450ml',               price: 600,  discountPrice: 0,    costPrice: 570 },
  { name: 'Harpic Toilet Cleaner Citrus',                 price: 475,  discountPrice: 470,  costPrice: 450 },
  { name: 'Harpic Toilet Cleaner Original.*125ml',        price: 150,  discountPrice: 0,    costPrice: 140 },
  { name: 'Harpic Toilet Cleaner Original.*225ml',        price: 200,  discountPrice: 0,    costPrice: 190 },
  { name: 'Lemon Max Paste Green',                        price: 240,  discountPrice: 0,    costPrice: 225 },
  { name: 'Lemon Max Paste Yellow',                       price: 240,  discountPrice: 0,    costPrice: 230 },
  { name: 'Lemon Max Liquid 275ml',                       price: 165,  discountPrice: 0,    costPrice: 160 },
  { name: 'Lemon Max Liquid Green',                       price: 255,  discountPrice: 250,  costPrice: 240 },
  { name: 'Lemon Max Liquid Yellow',                      price: 285,  discountPrice: 280,  costPrice: 270 },
  { name: 'Lemon Max Dishwash Bar 85g',                   price: 30,   discountPrice: 0,    costPrice: 27 },
  { name: 'Lemon Max Dishwash Bar 530g',                  price: 160,  discountPrice: 0,    costPrice: 155 },
  { name: 'Express Power 500g',                           price: 215,  discountPrice: 210,  costPrice: 200 },
  { name: 'Express Power 1kg',                            price: 430,  discountPrice: 420,  costPrice: 410 },
  { name: 'Bonus Active 500g',                            price: 150,  discountPrice: 0,    costPrice: 140 },
  { name: 'Bonus Active 1kg',                             price: 240,  discountPrice: 235,  costPrice: 230 },
  { name: 'Brite.*500g',                                  price: 300,  discountPrice: 290,  costPrice: 275 },
  { name: 'Brite.*1kg',                                   price: 580,  discountPrice: 570,  costPrice: 550 },
  { name: 'Brite.*2kg',                                   price: 1110, discountPrice: 1080, costPrice: 1060 },
  { name: 'Ariel Original 500g',                          price: 275,  discountPrice: 0,    costPrice: 255 },
  { name: 'Ariel Original 1kg',                           price: 580,  discountPrice: 570,  costPrice: 550 },
  { name: 'Surf Excel 500g',                              price: 290,  discountPrice: 0,    costPrice: 280 },
  { name: 'Surf Excel 1kg',                               price: 580,  discountPrice: 570,  costPrice: 560 },
  { name: 'Surf Excel 2kg',                               price: 1110, discountPrice: 1080, costPrice: 1050 },
  { name: 'Dettol Antiseptic Liquid',                     price: 250,  discountPrice: 0,    costPrice: 240 },

  // ── Biscuits, Snacks & Chocolate ────────────────────────────
  { name: 'Bhuna Chana',                                  price: 120,  discountPrice: 0,    costPrice: 100 },
  { name: 'Badyan Khatai',                                price: 80,   discountPrice: 0,    costPrice: 60 },
  { name: 'Badam.*Whole Almonds',                         price: 1500, discountPrice: 0,    costPrice: 1400 },
  { name: 'Khashkhash.*Poppy Seeds',                      price: 260,  discountPrice: 0,    costPrice: 250 },
  { name: 'Pumpkin Seeds',                                price: 140,  discountPrice: 0,    costPrice: 130 },
  { name: 'Kalwanji.*Nigella Seeds',                      price: 140,  discountPrice: 0,    costPrice: 120 },
  { name: 'Kaju.*Cashews',                                price: 700,  discountPrice: 0,    costPrice: 650 },
  { name: 'Desi Kishmish.*Raisins',                       price: 130,  discountPrice: 0,    costPrice: 110 },
  { name: 'Basil Seeds.*Tukmaria',                        price: 140,  discountPrice: 0,    costPrice: 120 },
  { name: 'Kishmish Premium',                             price: 110,  discountPrice: 0,    costPrice: 100 },
  { name: 'Cadbury Dairy Milk Chocolate 56g',             price: 130,  discountPrice: 0,    costPrice: 120 },
  { name: 'Cadbury Dairy Milk Bubbly',                    price: 50,   discountPrice: 0,    costPrice: 45 },
  { name: 'Oreo Biscuits',                                price: 320,  discountPrice: 0,    costPrice: 300 },
  { name: 'Choco Lava Chocolate',                         price: 320,  discountPrice: 0,    costPrice: 300 },
  { name: 'Candy Candy',                                  price: 320,  discountPrice: 0,    costPrice: 300 },
  { name: 'Chocolicious Biscuits',                        price: 320,  discountPrice: 0,    costPrice: 300 },
  { name: 'LU Zeera Plus',                                price: 320,  discountPrice: 0,    costPrice: 300 },
  { name: 'Aloo Bukhara.*Dried Plum',                     price: 230,  discountPrice: 200,  costPrice: 200 },

  // ── Grocery & Staples ────────────────────────────────────────
  { name: 'Matcher',                                      price: 30,   discountPrice: 0,    costPrice: 28 },
];

async function run() {
  await connectDB();
  let updated = 0, notFound = 0;

  for (const u of updates) {
    const product = await Product.findOne({ name: new RegExp(u.name, 'i') });
    if (!product) {
      console.log(`❌ Not found: ${u.name}`);
      notFound++;
      continue;
    }
    product.price = u.price;
    product.discountPrice = u.discountPrice;
    product.costPrice = u.costPrice;
    // Also update salePrice on all weightOptions proportionally if product has variants
    if (product.weightOptions?.length > 0) {
      const ratio = u.price > 0 && u.discountPrice > 0 ? u.discountPrice / u.price : 1;
      product.weightOptions = product.weightOptions.map((w) => ({
        ...w.toObject(),
        salePrice: ratio < 1 ? Math.round(w.price * ratio) : 0,
      }));
    }
    await product.save();
    console.log(`✅  ${product.name}`);
    updated++;
  }

  // ── Brooke Bond Supreme Tea — update base + variants ────────
  const bb = await Product.findOne({ name: /Brooke Bond Supreme Tea/i });
  if (bb) {
    bb.price = 360; bb.discountPrice = 0; bb.costPrice = 340; // 170g base
    const existingImages = {};
    (bb.weightOptions || []).forEach((w) => { existingImages[w.weight] = w.image || ''; });
    bb.weightOptions = [
      { weight: '170g', price: 360, salePrice: 0,    image: existingImages['170g'] || existingImages['160g'] || '' },
      { weight: '430g', price: 850, salePrice: 820,  image: existingImages['430g'] || '' },
      { weight: '900g', price: 1700, salePrice: 1650, image: existingImages['900g'] || '' },
    ];
    await bb.save();
    console.log(`✅  Brooke Bond Supreme Tea (variants: 170g / 430g / 900g)`);
    updated++;
  } else {
    console.log(`❌ Not found: Brooke Bond Supreme Tea`);
    notFound++;
  }

  // ── Desi Gur (Jaggery) — update/add 1kg variant ─────────────
  const gur = await Product.findOne({ name: /Desi Gur/i });
  if (gur) {
    const opts = (gur.weightOptions || []).map((w) => w.toObject());
    const idx1kg = opts.findIndex((w) => w.weight === '1kg');
    const entry = { weight: '1kg', price: 230, salePrice: 220, image: idx1kg >= 0 ? opts[idx1kg].image || '' : '' };
    if (idx1kg >= 0) opts[idx1kg] = entry; else opts.push(entry);
    gur.weightOptions = opts;
    await gur.save();
    console.log(`✅  Desi Gur (Jaggery) — 1kg variant S=230 D=220`);
    updated++;
  } else {
    console.log(`❌ Not found: Desi Gur (Jaggery)`);
    notFound++;
  }

  console.log(`\n🎉 Done — ${updated} updated, ${notFound} not found`);
  process.exit(0);
}

run().catch(console.error);
