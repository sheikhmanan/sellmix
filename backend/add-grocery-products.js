const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

// Category IDs
const CAT = {
  ATTA:    '69da35fa8ab28bb1568c7615',
  OIL:     '69da35fa8ab28bb1568c7616',
  GHEE:    '69da35fa8ab28bb1568c7617',
  PULSE:   '69da35fa8ab28bb1568c7618',
  RICE:    '69da35fa8ab28bb1568c7619',
  SPICES:  '69da35fa8ab28bb1568c761b',
};

// Products to upsert
const PRODUCTS = [

  // ── Atta & Flours ────────────────────────────────────────────────────────
  {
    name: 'Sugar (Cheeni)', category: CAT.ATTA,
    price: 145, discountPrice: 143, costPrice: 140, unit: 'kg', stock: 200,
    tags: ['sugar', 'cheeni'],
  },
  {
    name: 'Baisin (Gram Flour)', category: CAT.ATTA,
    price: 240, discountPrice: 230, costPrice: 210, unit: 'kg', stock: 150,
    tags: ['baisin', 'gram flour', 'besan'],
  },
  {
    name: 'Desi Gur (Jaggery)', category: CAT.ATTA,
    price: 120, discountPrice: 110, costPrice: 100, unit: 'kg', stock: 100,
    tags: ['gur', 'jaggery', 'desi gur'],
  },

  // ── Spices ───────────────────────────────────────────────────────────────
  {
    name: 'Jalwatri (Mace)', category: CAT.SPICES,
    price: 220, discountPrice: 200, costPrice: 175, unit: 'g', stock: 80,
    tags: ['jalwatri', 'mace', 'spice'],
  },
  {
    name: 'Anaar Dana (Pomegranate Seeds)', category: CAT.SPICES,
    price: 100, discountPrice: 90, costPrice: 75, unit: 'g', stock: 80,
    tags: ['anaar dana', 'pomegranate seeds'],
  },
  {
    name: 'Black Pepper (Kali Mirch)', category: CAT.SPICES,
    price: 165, discountPrice: 150, costPrice: 130, unit: 'g', stock: 150,
    weightOptions: [
      { weight: '50g',  price: 165, discountPrice: 150, costPrice: 130 },
      { weight: '100g', price: 330, discountPrice: 300, costPrice: 260 },
    ],
    tags: ['black pepper', 'kali mirch'],
  },
  {
    name: 'White Pepper Whole (Safaid Mirch Sabit)', category: CAT.SPICES,
    price: 160, discountPrice: 150, costPrice: 125, unit: 'g', stock: 100,
    weightOptions: [
      { weight: '50g',  price: 160, discountPrice: 150, costPrice: 125 },
      { weight: '100g', price: 320, discountPrice: 300, costPrice: 250 },
    ],
    tags: ['white pepper', 'safaid mirch'],
  },
  {
    name: 'White Pepper Powder (Safaid Mirch Powder)', category: CAT.SPICES,
    price: 170, discountPrice: 160, costPrice: 135, unit: 'g', stock: 100,
    weightOptions: [
      { weight: '50g',  price: 170, discountPrice: 160, costPrice: 135 },
      { weight: '100g', price: 340, discountPrice: 320, costPrice: 280 },
    ],
    tags: ['white pepper powder', 'safaid mirch powder'],
  },
  {
    name: 'Saunf (Fennel Seeds)', category: CAT.SPICES,
    price: 60, discountPrice: 50, costPrice: 40, unit: 'g', stock: 120,
    weightOptions: [
      { weight: '50g',  price: 60,  discountPrice: 50,  costPrice: 40 },
      { weight: '100g', price: 120, discountPrice: 100, costPrice: 80 },
    ],
    tags: ['saunf', 'fennel seeds'],
  },
  {
    name: 'Choti Elaichi (Green Cardamom)', category: CAT.SPICES,
    price: 450, discountPrice: 430, costPrice: 350, unit: 'g', stock: 80,
    weightOptions: [
      { weight: '25g', price: 450, discountPrice: 430, costPrice: 350 },
      { weight: '50g', price: 900, discountPrice: 860, costPrice: 700 },
    ],
    tags: ['choti elaichi', 'green cardamom', 'elaichi'],
  },
  {
    name: 'Imli (Tamarind)', category: CAT.SPICES,
    price: 70, discountPrice: 65, costPrice: 60, unit: 'g', stock: 150,
    weightOptions: [
      { weight: '100g', price: 70,  discountPrice: 65,  costPrice: 60 },
      { weight: '200g', price: 140, discountPrice: 130, costPrice: 120 },
    ],
    tags: ['imli', 'tamarind'],
  },
  {
    name: 'Loong (Cloves)', category: CAT.SPICES,
    price: 180, discountPrice: 160, costPrice: 150, unit: 'g', stock: 80,
    tags: ['loong', 'cloves'],
  },
  {
    name: 'Dar Chini (Cinnamon)', category: CAT.SPICES,
    price: 60, discountPrice: 55, costPrice: 45, unit: 'g', stock: 100,
    tags: ['dar chini', 'cinnamon'],
  },
  {
    name: 'Badi Elaichi (Black Cardamom)', category: CAT.SPICES,
    price: 220, discountPrice: 210, costPrice: 180, unit: 'g', stock: 80,
    weightOptions: [
      { weight: '25g', price: 220, discountPrice: 210, costPrice: 180 },
      { weight: '50g', price: 440, discountPrice: 420, costPrice: 360 },
    ],
    tags: ['badi elaichi', 'black cardamom'],
  },
  {
    name: 'Haldi Powder (Turmeric)', category: CAT.SPICES,
    price: 100, discountPrice: 90, costPrice: 80, unit: 'g', stock: 150,
    weightOptions: [
      { weight: '200g', price: 100, discountPrice: 90,  costPrice: 80  },
      { weight: '500g', price: 260, discountPrice: 230, costPrice: 220 },
    ],
    tags: ['haldi', 'turmeric', 'haldi powder'],
  },
  {
    name: 'Red Chili Flakes', category: CAT.SPICES,
    price: 230, discountPrice: 210, costPrice: 200, unit: 'g', stock: 120,
    weightOptions: [
      { weight: '250g', price: 230, discountPrice: 210, costPrice: 200 },
    ],
    tags: ['red chili flakes', 'chili flakes'],
  },
  {
    name: 'Red Chili Powder', category: CAT.SPICES,
    price: 90, discountPrice: 80, costPrice: 70, unit: 'g', stock: 150,
    weightOptions: [
      { weight: '100g', price: 90,  discountPrice: 80,  costPrice: 70  },
      { weight: '200g', price: 180, discountPrice: 160, costPrice: 140 },
    ],
    tags: ['red chili powder', 'lal mirch powder'],
  },
  // National Masalas
  { name: 'National Chicken Tandoori Mix – 45g',    category: CAT.SPICES, price: 150, discountPrice: 145, costPrice: 125, unit: 'pcs', stock: 100, tags: ['national', 'tandoori', 'masala'] },
  { name: 'National Seekh Kabab Mix',               category: CAT.SPICES, price: 150, discountPrice: 145, costPrice: 125, unit: 'pcs', stock: 100, tags: ['national', 'seekh kabab', 'masala'] },
  { name: 'National Malai Boti Mix',                category: CAT.SPICES, price: 150, discountPrice: 145, costPrice: 125, unit: 'pcs', stock: 100, tags: ['national', 'malai boti', 'masala'] },
  { name: 'National Qeema Masala – 50g',            category: CAT.SPICES, price: 150, discountPrice: 145, costPrice: 125, unit: 'pcs', stock: 100, tags: ['national', 'qeema', 'masala'] },
  { name: 'National Kaleji Masala – 45g',           category: CAT.SPICES, price: 150, discountPrice: 145, costPrice: 125, unit: 'pcs', stock: 100, tags: ['national', 'kaleji', 'masala'] },
  { name: 'National Paya Masala – 39g',             category: CAT.SPICES, price: 150, discountPrice: 145, costPrice: 125, unit: 'pcs', stock: 100, tags: ['national', 'paya', 'masala'] },
  { name: 'National Pulao Masala – 70g',            category: CAT.SPICES, price: 150, discountPrice: 145, costPrice: 125, unit: 'pcs', stock: 100, tags: ['national', 'pulao', 'masala'] },
  { name: 'National Murghi Masala – 43g',           category: CAT.SPICES, price: 150, discountPrice: 145, costPrice: 125, unit: 'pcs', stock: 100, tags: ['national', 'murghi', 'masala'] },
  { name: 'National Tikka Boti Mix – 44g',          category: CAT.SPICES, price: 150, discountPrice: 145, costPrice: 125, unit: 'pcs', stock: 100, tags: ['national', 'tikka boti', 'masala'] },
  { name: 'National Garam Masala – 50g',            category: CAT.SPICES, price: 150, discountPrice: 145, costPrice: 125, unit: 'pcs', stock: 100, tags: ['national', 'garam masala'] },
  { name: 'National Garam Masala – 100g',           category: CAT.SPICES, price: 150, discountPrice: 145, costPrice: 125, unit: 'pcs', stock: 100, tags: ['national', 'garam masala'] },
  { name: 'National Biryani Masala – 78g',          category: CAT.SPICES, price: 150, discountPrice: 145, costPrice: 125, unit: 'pcs', stock: 100, tags: ['national', 'biryani', 'masala'] },

  // ── Pulse ────────────────────────────────────────────────────────────────
  {
    name: 'Red Lobia (Surkh Lobia)', category: CAT.PULSE,
    price: 240, discountPrice: 220, costPrice: 210, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 240, discountPrice: 220, costPrice: 210 },
      { weight: '1kg',  price: 480, discountPrice: 440, costPrice: 420 },
    ],
    tags: ['red lobia', 'lobia', 'surkh lobia'],
  },
  {
    name: 'Masoor Whole Bold (Masoor Sabit Mota)', category: CAT.PULSE,
    price: 130, discountPrice: 115, costPrice: 110, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 130, discountPrice: 115, costPrice: 110 },
      { weight: '1kg',  price: 260, discountPrice: 230, costPrice: 220 },
    ],
    tags: ['masoor', 'masoor sabit', 'whole lentil'],
  },
  {
    name: 'Mash Whole (Mash Sabit)', category: CAT.PULSE,
    price: 240, discountPrice: 220, costPrice: 210, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 240, discountPrice: 220, costPrice: 210 },
      { weight: '1kg',  price: 480, discountPrice: 440, costPrice: 420 },
    ],
    tags: ['mash', 'mash sabit', 'urad dal'],
  },
  {
    name: 'Mong Whole (Mong Sabit)', category: CAT.PULSE,
    price: 240, discountPrice: 230, costPrice: 210, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 240, discountPrice: 230, costPrice: 210 },
      { weight: '1kg',  price: 480, discountPrice: 460, costPrice: 420 },
    ],
    tags: ['mong', 'mong sabit', 'moong whole'],
  },
  {
    name: 'White Lobia (Safaid Lobia)', category: CAT.PULSE,
    price: 180, discountPrice: 160, costPrice: 150, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 180, discountPrice: 160, costPrice: 150 },
      { weight: '1kg',  price: 360, discountPrice: 320, costPrice: 300 },
    ],
    tags: ['white lobia', 'safaid lobia'],
  },
  {
    name: 'Dal Mash Shelled (Daal Maash Chilka)', category: CAT.PULSE,
    price: 240, discountPrice: 230, costPrice: 200, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 240, discountPrice: 230, costPrice: 200 },
      { weight: '1kg',  price: 480, discountPrice: 460, costPrice: 400 },
    ],
    tags: ['dal mash', 'maash chilka', 'urad dal'],
  },
  {
    name: 'Dal Mash Washed (Daal Maash Dhuli)', category: CAT.PULSE,
    price: 280, discountPrice: 270, costPrice: 260, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 280, discountPrice: 270, costPrice: 260 },
      { weight: '1kg',  price: 560, discountPrice: 540, costPrice: 520 },
    ],
    tags: ['dal mash washed', 'maash dhuli'],
  },
  {
    name: 'Black Chana (Kala Chana)', category: CAT.PULSE,
    price: 120, discountPrice: 115, costPrice: 110, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 120, discountPrice: 115, costPrice: 110 },
      { weight: '1kg',  price: 240, discountPrice: 230, costPrice: 220 },
    ],
    tags: ['kala chana', 'black chana', 'black chickpea'],
  },
  {
    name: 'White Chana Bold (Safaid Chana Mota)', category: CAT.PULSE,
    price: 180, discountPrice: 175, costPrice: 160, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 180, discountPrice: 175, costPrice: 160 },
      { weight: '1kg',  price: 360, discountPrice: 350, costPrice: 320 },
    ],
    tags: ['safaid chana', 'white chana bold', 'chickpea'],
  },
  {
    name: 'White Chana Fine (Safaid Chana Barik)', category: CAT.PULSE,
    price: 150, discountPrice: 140, costPrice: 130, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 150, discountPrice: 140, costPrice: 130 },
      { weight: '1kg',  price: 300, discountPrice: 280, costPrice: 260 },
    ],
    tags: ['safaid chana barik', 'white chana fine'],
  },
  {
    name: 'Moong Dal Chilka', category: CAT.PULSE,
    price: 240, discountPrice: 215, costPrice: 205, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 240, discountPrice: 215, costPrice: 205 },
      { weight: '1kg',  price: 440, discountPrice: 430, costPrice: 410 },
    ],
    tags: ['moong dal chilka', 'moong dal'],
  },
  {
    name: 'Moong Dal Washed', category: CAT.PULSE,
    price: 210, discountPrice: 190, costPrice: 180, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g',  price: 210, discountPrice: 190, costPrice: 180 },
      { weight: '1000g', price: 420, discountPrice: 380, costPrice: 360 },
    ],
    tags: ['moong dal washed', 'moong dal dhuli'],
  },
  {
    name: 'Chana Dal (Chick Pea)', category: CAT.PULSE,
    price: 125, discountPrice: 115, costPrice: 105, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 125, discountPrice: 115, costPrice: 105 },
      { weight: '1kg',  price: 250, discountPrice: 230, costPrice: 210 },
    ],
    tags: ['chana dal', 'chick pea', 'dal'],
  },
  {
    name: 'Masoor Dal (Red Lentils)', category: CAT.PULSE,
    price: 125, discountPrice: 120, costPrice: 110, unit: 'kg', stock: 150,
    weightOptions: [
      { weight: '500g', price: 125, discountPrice: 120, costPrice: 110 },
      { weight: '1kg',  price: 250, discountPrice: 240, costPrice: 220 },
    ],
    tags: ['masoor dal', 'red lentils'],
  },

  // ── Rice ─────────────────────────────────────────────────────────────────
  {
    name: 'Adhwar Rice', category: CAT.RICE,
    price: 280, discountPrice: 270, costPrice: 250, unit: 'kg', stock: 200,
    weightOptions: [
      { weight: '1kg', price: 280,  discountPrice: 270,  costPrice: 250  },
      { weight: '5kg', price: 1400, discountPrice: 1350, costPrice: 1250 },
    ],
    tags: ['adhwar rice', 'rice'],
  },
  {
    name: 'Double Steam 1121 Kainat Rice', category: CAT.RICE,
    price: 450, discountPrice: 420, costPrice: 400, unit: 'kg', stock: 300,
    weightOptions: [
      { weight: '1kg', price: 450,  discountPrice: 420,  costPrice: 400  },
      { weight: '5kg', price: 4950, discountPrice: 0,    costPrice: 2000 },
    ],
    tags: ['kainat rice', '1121 rice', 'steam rice'],
  },
  {
    name: 'Sella Rice', category: CAT.RICE,
    price: 400, discountPrice: 380, costPrice: 360, unit: 'kg', stock: 200,
    weightOptions: [
      { weight: '3kg', price: 400,  discountPrice: 380,  costPrice: 360  },
      { weight: '5kg', price: 2000, discountPrice: 1900, costPrice: 1800 },
    ],
    tags: ['sella rice', 'rice'],
  },

  // ── Ghee (Banaspati) ─────────────────────────────────────────────────────
  {
    name: 'Salva Banaspati', category: CAT.GHEE,
    price: 555, discountPrice: 550, costPrice: 550, unit: 'kg', stock: 100,
    weightOptions: [
      { weight: '1kg', price: 555,  discountPrice: 550,  costPrice: 550  },
      { weight: '5kg', price: 2850, discountPrice: 2820, costPrice: 2820 },
    ],
    tags: ['salva', 'banaspati', 'ghee'],
  },
  {
    name: 'Mezan Banaspati Select', category: CAT.GHEE,
    price: 550, discountPrice: 545, costPrice: 545, unit: 'kg', stock: 100,
    weightOptions: [
      { weight: '1kg', price: 550,  discountPrice: 545,  costPrice: 545  },
      { weight: '5kg', price: 2750, discountPrice: 2730, costPrice: 2730 },
    ],
    tags: ['mezan', 'banaspati'],
  },
  {
    name: 'Nemat Banaspati', category: CAT.GHEE,
    price: 555, discountPrice: 552, costPrice: 552, unit: 'kg', stock: 100,
    weightOptions: [
      { weight: '1kg', price: 555,  discountPrice: 552,  costPrice: 552  },
      { weight: '5kg', price: 2900, discountPrice: 2880, costPrice: 2880 },
    ],
    tags: ['nemat', 'banaspati'],
  },
  {
    name: 'Sufi Special Banaspati', category: CAT.GHEE,
    price: 596, discountPrice: 595, costPrice: 595, unit: 'kg', stock: 100,
    weightOptions: [
      { weight: '1kg', price: 596,  discountPrice: 595,  costPrice: 595  },
      { weight: '5kg', price: 2975, discountPrice: 2950, costPrice: 2940 },
    ],
    tags: ['sufi', 'banaspati'],
  },
  {
    name: 'Kisan Banaspati', category: CAT.GHEE,
    price: 540, discountPrice: 530, costPrice: 530, unit: 'kg', stock: 100,
    weightOptions: [
      { weight: '1kg', price: 540,  discountPrice: 530,  costPrice: 530  },
      { weight: '5kg', price: 2700, discountPrice: 2650, costPrice: 2650 },
    ],
    tags: ['kisan', 'banaspati'],
  },
  {
    name: 'Dalda VTF Banaspati', category: CAT.GHEE,
    price: 592, discountPrice: 0, costPrice: 590, unit: 'kg', stock: 100,
    weightOptions: [
      { weight: '1kg', price: 592,  discountPrice: 0,    costPrice: 590  },
      { weight: '5kg', price: 2990, discountPrice: 0,    costPrice: 2960 },
    ],
    tags: ['dalda', 'banaspati', 'vtf'],
  },

  // ── Edible Oil ────────────────────────────────────────────────────────────
  {
    name: 'Dalda Fortified Cooking Oil', category: CAT.OIL,
    price: 590, discountPrice: 585, costPrice: 585, unit: 'litre', stock: 100,
    weightOptions: [
      { weight: '1L', price: 590,  discountPrice: 585,  costPrice: 585  },
      { weight: '5L', price: 2950, discountPrice: 2900, costPrice: 2900 },
    ],
    tags: ['dalda', 'cooking oil'],
  },
  {
    name: 'Seasons Canola Oil', category: CAT.OIL,
    price: 580, discountPrice: 575, costPrice: 575, unit: 'litre', stock: 100,
    weightOptions: [
      { weight: '1L', price: 580,  discountPrice: 575,  costPrice: 575  },
      { weight: '5L', price: 2900, discountPrice: 2870, costPrice: 2870 },
    ],
    tags: ['seasons', 'canola oil', 'cooking oil'],
  },
  {
    name: 'Sufi Canola Cooking Oil', category: CAT.OIL,
    price: 592, discountPrice: 590, costPrice: 590, unit: 'litre', stock: 100,
    weightOptions: [
      { weight: '1L', price: 592,  discountPrice: 590,  costPrice: 590  },
      { weight: '5L', price: 2960, discountPrice: 0,    costPrice: 2950 },
    ],
    tags: ['sufi', 'canola oil'],
  },
  {
    name: 'Salva Cooking Oil', category: CAT.OIL,
    price: 560, discountPrice: 0, costPrice: 550, unit: 'litre', stock: 100,
    weightOptions: [
      { weight: '1L', price: 560, discountPrice: 0, costPrice: 550 },
    ],
    tags: ['salva', 'cooking oil'],
  },
  {
    name: 'Saba Cooking Oil', category: CAT.OIL,
    price: 2800, discountPrice: 0, costPrice: 2770, unit: 'litre', stock: 50,
    weightOptions: [
      { weight: '5L', price: 2800, discountPrice: 0, costPrice: 2770 },
    ],
    tags: ['saba', 'cooking oil'],
  },
  {
    name: 'Nemat Cooking Oil', category: CAT.OIL,
    price: 570, discountPrice: 0, costPrice: 565, unit: 'litre', stock: 100,
    weightOptions: [
      { weight: '1L', price: 570,  discountPrice: 0, costPrice: 565  },
      { weight: '5L', price: 2850, discountPrice: 0, costPrice: 2830 },
    ],
    tags: ['nemat', 'cooking oil'],
  },
  {
    name: 'Kashmir Premium Gold Cooking Oil', category: CAT.OIL,
    price: 590, discountPrice: 0, costPrice: 585, unit: 'litre', stock: 120,
    weightOptions: [
      { weight: '1L', price: 590,  discountPrice: 0, costPrice: 585  },
      { weight: '5L', price: 2950, discountPrice: 0, costPrice: 2900 },
    ],
    tags: ['kashmir', 'cooking oil'],
  },
];

const run = async () => {
  await connectDB();
  let added = 0, updated = 0;

  for (const p of PRODUCTS) {
    const existing = await Product.findOne({ name: p.name });
    if (existing) {
      await Product.updateOne({ _id: existing._id }, { $set: {
        price: p.price,
        discountPrice: p.discountPrice || 0,
        costPrice: p.costPrice,
        ...(p.weightOptions && { weightOptions: p.weightOptions }),
        stock: p.stock,
      }});
      console.log(`  ✏️  Updated: ${p.name}`);
      updated++;
    } else {
      await Product.create({
        ...p,
        discountPrice: p.discountPrice || 0,
        images: [],
        isActive: true,
        isFeatured: false,
      });
      console.log(`  ✅  Added:   ${p.name}`);
      added++;
    }
  }

  console.log(`\n🎉 Done — ${added} added, ${updated} updated`);
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
