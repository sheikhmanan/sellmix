const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Category = require('./models/Category');

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const RIMG = (id) => `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_400,c_limit/${id}`;
const IMG  = (f)  => `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_400,c_limit/sellmix/products/${f}`;

// Map: category name → image URL
const CATEGORY_IMAGES = {
  // ── Level 1 ──────────────────────────────────────────────────────────────
  'Grocery & Staples':            'https://res.cloudinary.com/dnhuilgay/image/upload/v1776240115/Grocery_Staples_icon_xzfqh3.png',
  'Drinks':                       'https://res.cloudinary.com/dnhuilgay/image/upload/v1776239888/Drinks_icon_x3ntfz.png',
  'Health & Beauty':              'https://res.cloudinary.com/dnhuilgay/image/upload/v1776240109/Health_Beauty_icon_snkczn.png',
  'Laundry & Household':          'https://res.cloudinary.com/dnhuilgay/image/upload/v1776240111/Laundry_Household_icon_bdsw4z.png',
  'Biscuits, Snacks & Chocolate': 'https://res.cloudinary.com/dnhuilgay/image/upload/v1776240113/Biscuits_Snacks_Chocolate_icon_cwvyvo.png',

  // ── Grocery & Staples ─────────────────────────────────────────────────────
  'Atta & Flours': RIMG('Baisin_1kg_jim6or'),
  'Edible Oil':    IMG('kashmir-cooking-oil-pouch'),
  'Ghee':          IMG('dalda-banaspati-box'),
  'Pulse':         RIMG('Dal_Chanay_دال_چنا_1kg_sc0tbj'),
  'Rice':          RIMG('double_steam1121_kainat_1kg_fddwne'),
  'Spices':        RIMG('Garam_Masalah_Powder_100mg_گرم_مصالہ_پاؤڈر_uqwa5s'),

  // ── Drinks ────────────────────────────────────────────────────────────────
  'Coffee & Tea':  RIMG('tapal-danedar-jar-440-gm_nxzdyk'),
  'Energy Drinks': RIMG('Sting_250ml_bxpyru'),
  'Flavored Milk': RIMG('milo_febkzd'),
  'Juice':         RIMG('nestle-fruita-vitals-apple-nectar-1-ltr_ye3z3c'),
  'Powder Milk':   RIMG('nido_elrqt2'),
  'Soft Drinks':   RIMG('coca-cola-bottle-500-ml_iqn0up'),
  'Sharbat':       RIMG('hamdard-rooh-afza-800-ml_borbms'),

  // ── Health & Beauty ───────────────────────────────────────────────────────
  'Bath Soap':         RIMG('lux-fresh-glow-soap-130-gm_kiltd8'),
  'Dental Care':       IMG('sensodyne-complete-protection'),
  'Hair Care':         RIMG('pantene-pro-v-smooth-and-strong-185-ml_lql98b'),
  'Face & Body Care':  RIMG('dove-intense-repair-shampoo-175-ml_mxseuv'),
  "Men's Toiletries":  IMG('colgate-maxfresh-125g'),
  'Women Toiletries':  RIMG('lux-velvet-glow-soap-jasmine-vitamin-e-128-gm_gnw8mk'),
  'Perfume':           RIMG('lux-soap-purple-lotus-128-gm_wa06za'),
  'Make Up':           RIMG('lux-fresh-glow-soap-130-gm_kiltd8'),

  // ── Laundry & Household ───────────────────────────────────────────────────
  'Cleaning Cupboard':    RIMG('dettol_djdbxw'),
  'Laundry':              IMG('dalda-banaspati-pouch'),
  'Household Essentials': RIMG('dettol_djdbxw'),
  'Kitchen':              RIMG('cornflor_v0bbym'),
  'Baby Products':        RIMG('nestle-everyday-tea-powder-15-gm_qdexfo'),
  'Toilet Rolls':         RIMG('Sugar_2kg_d59ixm'),

  // ── Biscuits, Snacks & Chocolate ─────────────────────────────────────────
  'Biscuits & Cookies':   RIMG('Oreo-4x_b7y51h'),
  'Chocolates & Candies': RIMG('Dairy_Milk_Bubbly_Milk_Chocolate_40g_oxycbl'),
  'Chips & Popcorns':     RIMG('Oreo-4x_b7y51h'),
  'Dry Fruits & Nuts':    RIMG('American_Badam_200gm_امریکن_بادام_pioibg'),
  'Nimco Snacks':         RIMG('zeeraplus_half_roll_yaeeth'),
};

const run = async () => {
  await connectDB();
  let updated = 0, skipped = 0;

  for (const [name, imageUrl] of Object.entries(CATEGORY_IMAGES)) {
    const result = await Category.updateOne({ name }, { $set: { image: imageUrl } });
    if (result.matchedCount === 0) {
      console.log(`  ⚠️  Not found: "${name}"`);
      skipped++;
    } else {
      console.log(`  ✅  ${name}`);
      updated++;
    }
  }

  console.log(`\n🎉 Done — ${updated} updated, ${skipped} not found`);
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
