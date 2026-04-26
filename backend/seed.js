const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const IMG  = (f)  => `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_800,c_limit/sellmix/products/${f.replace(/\.[^.]+$/, '')}`;
const RIMG = (id) => `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_800,c_limit/${id}`;

// ── Level 1: Main Categories ───────────────────────────────────────────────
const LEVEL1 = [
  { name: 'Grocery & Staples',          icon: '🥦', level: 1 },
  { name: 'Drinks',                     icon: '🥤', level: 1 },
  { name: 'Health & Beauty',            icon: '🧴', level: 1 },
  { name: 'Laundry & Household',        icon: '🧼', level: 1 },
  { name: 'Biscuits, Snacks & Chocolate', icon: '🍪', level: 1 },
];

// ── Level 2: Subcategories (parent name used, resolved to _id in seed) ─────
const LEVEL2 = [
  // Grocery & Staples
  { name: 'Atta & Flours', icon: '🌾', parent: 'Grocery & Staples' },
  { name: 'Edible Oil',    icon: '🫙', parent: 'Grocery & Staples' },
  { name: 'Ghee',          icon: '🧈', parent: 'Grocery & Staples' },
  { name: 'Pulse',         icon: '🫘', parent: 'Grocery & Staples' },
  { name: 'Rice',          icon: '🌾', parent: 'Grocery & Staples' },
  { name: 'Salt',          icon: '🧂', parent: 'Grocery & Staples' },
  { name: 'Spices',        icon: '🌶️', parent: 'Grocery & Staples' },
  // Drinks
  { name: 'Coffee & Tea',  icon: '☕', parent: 'Drinks' },
  { name: 'Energy Drinks', icon: '⚡', parent: 'Drinks' },
  { name: 'Flavored Milk', icon: '🍫', parent: 'Drinks' },
  { name: 'Juice',         icon: '🧃', parent: 'Drinks' },
  { name: 'Powder Milk',   icon: '🥛', parent: 'Drinks' },
  { name: 'Soft Drinks',   icon: '🥤', parent: 'Drinks' },
  { name: 'Sharbat',       icon: '🍹', parent: 'Drinks' },
  // Health & Beauty
  { name: 'Bath Soap',         icon: '🧼', parent: 'Health & Beauty' },
  { name: 'Dental Care',       icon: '🦷', parent: 'Health & Beauty' },
  { name: 'Face & Body Care',  icon: '🧴', parent: 'Health & Beauty' },
  { name: 'Hair Care',         icon: '💆', parent: 'Health & Beauty' },
  { name: 'Make Up',           icon: '💄', parent: 'Health & Beauty' },
  { name: "Men's Toiletries",  icon: '🪒', parent: 'Health & Beauty' },
  { name: 'Perfume',           icon: '🌸', parent: 'Health & Beauty' },
  { name: 'Women Toiletries',  icon: '🌺', parent: 'Health & Beauty' },
  // Laundry & Household
  { name: 'Baby Products',       icon: '👶', parent: 'Laundry & Household' },
  { name: 'Cleaning Cupboard',   icon: '🧹', parent: 'Laundry & Household' },
  { name: 'Household Essentials',icon: '🏠', parent: 'Laundry & Household' },
  { name: 'Kitchen',             icon: '🍳', parent: 'Laundry & Household' },
  { name: 'Laundry',             icon: '👕', parent: 'Laundry & Household' },
  { name: 'Toilet Rolls',        icon: '🧻', parent: 'Laundry & Household' },
  // Biscuits, Snacks & Chocolate
  { name: 'Biscuits & Cookies',    icon: '🍪', parent: 'Biscuits, Snacks & Chocolate' },
  { name: 'Chocolates & Candies',  icon: '🍫', parent: 'Biscuits, Snacks & Chocolate' },
  { name: 'Chips & Popcorns',      icon: '🍿', parent: 'Biscuits, Snacks & Chocolate' },
  { name: 'Dry Fruits & Nuts',     icon: '🥜', parent: 'Biscuits, Snacks & Chocolate' },
  { name: 'Nimco Snacks',          icon: '🫘', parent: 'Biscuits, Snacks & Chocolate' },
];

const seed = async () => {
  await connectDB();
  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});

  // ── Admin ────────────────────────────────────────────────────────────────
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@' + Math.random().toString(36).slice(2, 10);
  await User.create({
    name: 'SellMix Admin', mobile: process.env.SEED_ADMIN_MOBILE || '03178384342',
    password: adminPassword, role: 'admin', address: 'Chichawatni, Punjab',
  });
  console.log(`✅ Admin user created  (mobile: ${process.env.SEED_ADMIN_MOBILE || '03178384342'} / password: [set via SEED_ADMIN_PASSWORD env var or check output above])`);

  // ── Level 1 Categories ───────────────────────────────────────────────────
  const l1Docs = await Category.insertMany(LEVEL1);
  const L1 = (name) => l1Docs.find((c) => c.name === name);

  // ── Level 2 Subcategories ────────────────────────────────────────────────
  const l2Docs = await Category.insertMany(
    LEVEL2.map((c) => ({ ...c, parent: L1(c.parent)._id, level: 2 }))
  );
  const C = (name) => l2Docs.find((c) => c.name === name)._id;

  console.log(`✅ ${l1Docs.length} main categories + ${l2Docs.length} subcategories created`);

  // ── Products ─────────────────────────────────────────────────────────────
  const products = [

    {
      name: 'National Biryani Masala',
      description: 'Authentic Biryani spice mix with 2 extra value packets. The classic Pakistani Biryani flavour your family loves.',
      category: C('Spices'), price: 130, discountPrice: 115, costPrice: 75,
      images: [IMG('biryani.jpeg')], stock: 200, isFeatured: true, unit: 'pack',
      weightOptions: [{ weight: '78g', price: 115 }], tags: ['national', 'biryani', 'masala'],
      cookingInstructions: 'Marinate chicken with masala & yogurt, cook on medium heat 20 mins, layer with soaked rice and steam 15 mins.',
    },

    {
      name: 'National Chicken Tandoori Mix',
      description: 'New & Improved. Authentic tandoori flavour at home. Perfect with naan or paratha.',
      category: C('Spices'), price: 110, discountPrice: 95, costPrice: 60,
      images: [IMG('chicken-tandoori.jpeg')], stock: 180, isFeatured: true, unit: 'pack',
      weightOptions: [{ weight: '45g', price: 95 }], tags: ['national', 'chicken', 'tandoori'],
      cookingInstructions: 'Mix with yogurt, marinate chicken 2 hours, grill or bake at 200°C for 25 mins.',
    },

    {
      name: 'National Seekh Kabab Mix',
      description: 'Authentic seekh kabab spice mix. Juicy, flavourful kababs every single time.',
      category: C('Spices'), price: 110, discountPrice: 95, costPrice: 60,
      images: [IMG('seekh-kabab.jpeg')], stock: 170, isFeatured: true, unit: 'pack',
      weightOptions: [{ weight: '46g', price: 95 }], tags: ['national', 'kabab', 'bbq'],
    },

    {
      name: 'National Malai Boti Mix',
      description: 'Limited Edition. Creamy, tender malai boti. Restaurant quality in your own kitchen.',
      category: C('Spices'), price: 120, discountPrice: 105, costPrice: 70,
      images: [IMG('malai-boti.jpeg')], stock: 140, isFeatured: true, unit: 'pack',
      weightOptions: [{ weight: '50g', price: 105 }], tags: ['national', 'malai', 'bbq'],
    },

    {
      name: 'National Qeema Masala',
      description: 'New formula. Perfectly spiced qeema masala. Great with naan, paratha or rice.',
      category: C('Spices'), price: 125, discountPrice: 110, costPrice: 72,
      images: [IMG('qeema.jpeg')], stock: 160, unit: 'pack',
      weightOptions: [{ weight: '50g', price: 110 }], tags: ['national', 'qeema'],
    },

    {
      name: 'National Kaleji Masala',
      description: 'Limited Edition. Perfectly balanced spices for kaleji. Rich & aromatic.',
      category: C('Spices'), price: 110, discountPrice: 95, costPrice: 60,
      images: [IMG('kaleji.jpeg')], stock: 150, unit: 'pack',
      weightOptions: [{ weight: '45g', price: 95 }], tags: ['national', 'kaleji'],
    },

    {
      name: 'National Paya Masala',
      description: 'Classic paya recipe mix. Rich, slow-cooked trotters flavour in every bite.',
      category: C('Spices'), price: 100, discountPrice: 85, costPrice: 55,
      images: [IMG('paya.jpeg')], stock: 120, unit: 'pack',
      weightOptions: [{ weight: '39g', price: 85 }], tags: ['national', 'paya'],
    },

    {
      name: 'National Pulao Masala',
      description: 'Aromatic pulao spice mix. Makes perfectly flavoured, fragrant rice every time.',
      category: C('Spices'), price: 120, discountPrice: 105, costPrice: 68,
      images: [IMG('pulao.jpeg')], stock: 200, unit: 'pack',
      weightOptions: [{ weight: '70g', price: 105 }], tags: ['national', 'pulao'],
    },

    {
      name: 'National Murghi Masala',
      description: 'Classic Pakistani chicken curry spice mix. Rich red gravy, restaurant taste at home.',
      category: C('Spices'), price: 110, discountPrice: 95, costPrice: 62,
      images: [IMG('murghi.jpeg')], stock: 190, unit: 'pack',
      weightOptions: [{ weight: '43g', price: 95 }], tags: ['national', 'chicken'],
    },

    {
      name: 'National Tikka Boti Mix',
      description: 'Authentic tikka boti flavour. Perfect for BBQ and grill nights.',
      category: C('Spices'), price: 115, discountPrice: 100, costPrice: 65,
      images: [IMG('tikka-boti.jpeg')], stock: 155, unit: 'pack',
      weightOptions: [{ weight: '44g', price: 100 }], tags: ['national', 'tikka', 'bbq'],
    },

    {
      name: 'National Garam Masala',
      description: 'Classic blend of aromatic whole spices. Perfect for biryanis, curries and dals.',
      category: C('Spices'), price: 120, discountPrice: 105, costPrice: 70,
      images: [RIMG('Garam_Masalah_Powder_100mg_گرم_مصالہ_پاؤڈر_uqwa5s')], stock: 200, unit: 'pack',
      weightOptions: [{ weight: '50g', price: 75 }, { weight: '100g', price: 140 }],
      tags: ['national', 'garam masala', 'spice'],
    },

    {
      name: 'Red Chili Powder',
      description: 'Pure ground red chili powder. Vibrant colour and bold heat for all your cooking.',
      category: C('Spices'), price: 180, discountPrice: 160, costPrice: 110,
      images: [RIMG('Red_chilli_powder_سرخ_مرچ_پاؤڈر_250mg_m4zz39')], stock: 250, unit: 'pack',
      weightOptions: [{ weight: '100g', price: 90, image: RIMG('Red_chilli_powder_سرخ_مرچ_پاؤڈر_250mg_m4zz39') }, { weight: '200g', price: 170, image: RIMG('Red_chilli_powder_سرخ_مرچ_پاؤڈر_250mg_m4zz39') }],
      tags: ['chili', 'spice', 'powder'],
    },

    {
      name: 'Red Chili Flakes',
      description: 'Crushed red chili flakes (دادڑی مرچ). Bold, fiery heat with texture. Perfect for sprinkling on pizza, pasta or curries.',
      category: C('Spices'), price: 180, discountPrice: 160, costPrice: 110,
      images: [RIMG('Red_chilli_flacks_دادڑی_مرچ_250mg_s90zxv')], stock: 200, unit: 'pack',
      weightOptions: [{ weight: '250g', price: 160, image: RIMG('Red_chilli_flacks_دادڑی_مرچ_250mg_s90zxv') }],
      tags: ['chili flakes', 'spice', 'crushed chili'],
    },
    {
      name: 'Chakki Fresh Atta',
      description: 'Fresh-ground whole wheat flour. 100% natural, no additives. Best for soft rotis and parathas.',
      category: C('Atta & Flours'), price: 120, discountPrice: 110, costPrice: 82,
      images: [IMG('chakki-atta.jpg')], stock: 300, unit: 'kg',
      weightOptions: [{ weight: '5kg', price: 550 }, { weight: '10kg', price: 1050 }],
      tags: ['atta', 'flour', 'chakki'],
      nutritionalInfo: 'Carbohydrates: 72g per 100g. Fibre: 10g. Protein: 13g.',
    },
    {
      name: 'Kashmir Premium Gold Cooking Oil',
      description: 'Premium refined cooking oil. Light on stomach, high smoke point. Ideal for everyday frying.',
      category: C('Edible Oil'), price: 570, discountPrice: 540, costPrice: 470,
      images: [IMG('kashmir-cooking-oil-pouch.jpeg'), IMG('kashmir-cooking-oil-box.jpeg')],
      stock: 120, isFeatured: true, unit: 'litre',
      weightOptions: [{ weight: '1L', price: 540, image: IMG('kashmir-cooking-oil-pouch.jpeg') }, { weight: '5L', price: 2600, image: IMG('kashmir-cooking-oil-box.jpeg') }],
      tags: ['kashmir', 'cooking oil'],
    },

    {
      name: 'Dalda Fortified Cooking Oil',
      description: 'Dalda fortified cooking oil enriched with vitamins A, D & E. Trusted brand for healthy cooking.',
      category: C('Edible Oil'), price: 560, discountPrice: 530, costPrice: 460,
      images: [IMG('dalda-cooking-oil-pouch.jpg'), IMG('dalda-cooking-oil-box.jpeg')],
      stock: 80, unit: 'litre',
      weightOptions: [{ weight: '1L', price: 530, image: IMG('dalda-cooking-oil-pouch.jpg') }, { weight: '5L', price: 2550, image: IMG('dalda-cooking-oil-box.jpeg') }],
      tags: ['dalda', 'cooking oil', 'fortified'],
    },

    {
      name: 'Seasons Canola Oil',
      description: 'The Original Seasons Canola Oil. Naturally rich in Omega-3. Seasons for all the right reasons.',
      category: C('Edible Oil'), price: 590, discountPrice: 560, costPrice: 490,
      images: [IMG('seasons-canola-oil-pouch.jpeg'), IMG('seasons-canola-oil-pack.jpeg')],
      stock: 90, isFeatured: true, unit: 'litre',
      weightOptions: [{ weight: '1L', price: 560, image: IMG('seasons-canola-oil-pouch.jpeg') }, { weight: '5L', price: 2700, image: IMG('seasons-canola-oil-pack.jpeg') }],
      tags: ['seasons', 'canola', 'omega3'],
    },

    {
      name: 'Sufi Canola Cooking Oil',
      description: 'Pure, light and heart-healthy canola oil. Rich in Omega-3 fatty acids.',
      category: C('Edible Oil'), price: 590, discountPrice: 560, costPrice: 490,
      images: [IMG('sufi-canola-oil-pouch.jpg'), IMG('sufi-canola-oil.jpeg')],
      stock: 85, unit: 'litre',
      weightOptions: [{ weight: '1L', price: 560, image: IMG('sufi-canola-oil-pouch.jpg') }, { weight: '5L', price: 2700, image: IMG('sufi-canola-oil.jpeg') }],
      tags: ['sufi', 'canola', 'oil'],
    },

    {
      name: 'Nemat Cooking Oil',
      description: 'Nemat pure refined cooking oil. Cholesterol free, rich in Omega-3. Great for daily cooking.',
      category: C('Edible Oil'), price: 550, discountPrice: 520, costPrice: 450,
      images: [IMG('lagan-cooking-oil-pouch.jpeg'), IMG('lagan-cooking-oil-box.jpeg')],
      stock: 100, unit: 'litre',
      weightOptions: [{ weight: '1L', price: 520, image: IMG('lagan-cooking-oil-pouch.jpeg') }, { weight: '5L', price: 2500, image: IMG('lagan-cooking-oil-box.jpeg') }],
      tags: ['nemat', 'cooking oil'],
    },

    {
      name: 'Salva Cooking Oil',
      description: 'Salva Cooking Oil — fortified with Vitamins A & D. Rich in Omega-3 & Omega-6.',
      category: C('Edible Oil'), price: 540, discountPrice: 510, costPrice: 440,
      images: [IMG('salva-cooking-oil.jpg')], stock: 90, unit: 'litre',
      weightOptions: [{ weight: '1L', price: 510, image: IMG('salva-cooking-oil.jpg') }, { weight: '5L', price: 2450, image: IMG('salva-cooking-oil.jpg') }],
      tags: ['salva', 'cooking oil'],
    },
    {
      name: 'Dalda VTF Banaspati',
      description: 'Pakistan\'s most trusted banaspati. Dalda VTF — fortified with vitamins for healthier cooking.',
      category: C('Ghee'), price: 470, discountPrice: 450, costPrice: 385,
      images: [IMG('dalda-banaspati-pouch.jpeg'), IMG('dalda-banaspati-box.jpeg')],
      stock: 100, isFeatured: true, unit: 'kg',
      weightOptions: [{ weight: '1kg', price: 450, image: IMG('dalda-banaspati-pouch.jpeg') }, { weight: '5kg', price: 2100, image: IMG('dalda-banaspati-box.jpeg') }],
      tags: ['dalda', 'banaspati', 'ghee'],
    },

    {
      name: 'Kisan Banaspati',
      description: 'Kisan VTF Banaspati — smooth texture, rich flavour. Perfect for parathas, halwa and baking.',
      category: C('Ghee'), price: 460, discountPrice: 440, costPrice: 380,
      images: [IMG('kisan-banaspati-pouch.jpeg'), IMG('kisan-banaspati-box.jpeg')],
      stock: 110, unit: 'kg',
      weightOptions: [{ weight: '1kg', price: 440, image: IMG('kisan-banaspati-pouch.jpeg') }, { weight: '5kg', price: 2100, image: IMG('kisan-banaspati-box.jpeg') }],
      tags: ['kisan', 'banaspati', 'ghee'],
    },

    {
      name: 'Sufi Special Banaspati',
      description: 'Sufi Special Banaspati Ghee — premium quality, smooth and creamy.',
      category: C('Ghee'), price: 470, discountPrice: 450, costPrice: 385,
      images: [IMG('sufi-banaspati.jpeg'), IMG('sufi-banaspati-box.jpg')],
      stock: 95, unit: 'kg',
      weightOptions: [{ weight: '1kg', price: 450, image: IMG('sufi-banaspati.jpeg') }, { weight: '5kg', price: 2100, image: IMG('sufi-banaspati-box.jpg') }],
      tags: ['sufi', 'banaspati', 'ghee'],
    },

    {
      name: 'Nemat Banaspati',
      description: 'Nemat Banaspati — a symbol of quality. Made from vegetable oils. Perfect for everyday cooking.',
      category: C('Ghee'), price: 440, discountPrice: 420, costPrice: 360,
      images: [IMG('lagan-banaspati.jpg')], stock: 90, unit: 'kg',
      weightOptions: [{ weight: '1kg', price: 420, image: IMG('lagan-banaspati.jpg') }, { weight: '5kg', price: 2000, image: IMG('lagan-banaspati.jpg') }],
      tags: ['nemat', 'banaspati'],
    },

    {
      name: 'Mezan Banaspati Select',
      description: 'Mezan Banaspati Select — balanced diet, balanced life. Immunity boosters added.',
      category: C('Ghee'), price: 450, discountPrice: 430, costPrice: 370,
      images: [IMG('mezan-banaspati.jpg')], stock: 85, unit: 'kg',
      weightOptions: [{ weight: '1kg', price: 430, image: IMG('mezan-banaspati.jpg') }, { weight: '5kg', price: 2050, image: IMG('mezan-banaspati.jpg') }],
      tags: ['mezan', 'banaspati'],
    },

    {
      name: 'Salva Banaspati',
      description: 'Salva Banaspati — blended with 100% vegetable oils. Contains Vitamin A & D.',
      category: C('Ghee'), price: 450, discountPrice: 430, costPrice: 370,
      images: [IMG('salva-banaspati.jpg')], stock: 90, unit: 'kg',
      weightOptions: [{ weight: '1kg', price: 430, image: IMG('salva-banaspati.jpg') }, { weight: '5kg', price: 2050, image: IMG('salva-banaspati.jpg') }],
      tags: ['salva', 'banaspati'],
    },
    {
      name: 'Masoor Dal (Red Lentils)',
      description: 'Quick-cooking red lentils. Nutritious, no soaking needed. A Pakistani household staple.',
      category: C('Pulse'), price: 280, discountPrice: 260, costPrice: 200,
      images: [RIMG('Dal_Masoor_Washed_دال_مسور_دھلی_ہوئی_1kg_sxnntj')], stock: 200, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 135 }, { weight: '1kg', price: 260 }],
      tags: ['dal', 'masoor', 'lentil'],
      nutritionalInfo: 'Protein: 26g per 100g. Fibre: 11g.',
      cookingInstructions: 'Rinse, boil with turmeric 15 mins, add tarka of onions, cumin and tomatoes.',
    },

    {
      name: 'Chana Dal (Chick Pea)',
      description: 'High protein chick pea lentil. Locally sourced from Punjab farms. Clean and sorted.',
      category: C('Pulse'), price: 300, discountPrice: 280, costPrice: 220,
      images: [RIMG('Dal_Chanay_دال_چنا_1kg_sc0tbj')], stock: 180, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 145 }, { weight: '1kg', price: 280 }],
      tags: ['dal', 'chana', 'pulse'],
      cookingInstructions: 'Soak overnight, boil 30 mins, temper with fried onions and spices.',
    },

    {
      name: 'Moong Dal Washed',
      description: 'Yellow washed moong dal (دال مونگ دھلی ہوئی). Easy to digest, high in protein. Great for soups and dal fry.',
      category: C('Pulse'), price: 320, discountPrice: 300, costPrice: 230,
      images: [RIMG('Dal_Mong_Washed_دال_مونگ_دھلی_ہوئی_1kg_r4amy9')], stock: 160, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 155, image: RIMG('Dal_Mong_Washed_دال_مونگ_دھلی_ہوئی_1kg_r4amy9') }, { weight: '1kg', price: 300, image: RIMG('Dal_Mong_Washed_دال_مونگ_دھلی_ہوئی_1kg_r4amy9') }],
      tags: ['dal', 'moong', 'washed', 'lentil'],
    },

    {
      name: 'Moong Dal Chilka',
      description: 'Green moong dal with skin (دال مونگ چھلکا). Nutritious whole lentil with natural fibre. Great for dal or sprouting.',
      category: C('Pulse'), price: 320, discountPrice: 300, costPrice: 230,
      images: [RIMG('Dal_Mong_shelled_دال_مونگ_چھلکا_1kg_mmrag3')], stock: 140, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 155, image: RIMG('Dal_Mong_shelled_دال_مونگ_چھلکا_1kg_mmrag3') }, { weight: '1kg', price: 300, image: RIMG('Dal_Mong_shelled_دال_مونگ_چھلکا_1kg_mmrag3') }],
      tags: ['dal', 'moong', 'chilka', 'shelled', 'lentil'],
    },
    {
      name: 'Premium Basmati Rice',
      description: 'Extra long grain, aged 2 years. Perfect for Biryani and Pulao. Non-sticky, naturally aromatic.',
      category: C('Rice'), price: 520, discountPrice: 450, costPrice: 360,
      images: [IMG('basmati-rice.jpg')], stock: 200, isFeatured: true, unit: 'kg',
      weightOptions: [{ weight: '1kg', price: 450 }, { weight: '5kg', price: 2100 }],
      tags: ['basmati', 'rice'],
      nutritionalInfo: 'Carbohydrates: 78g per 100g. Protein: 7g.',
      cookingInstructions: 'Rinse 3 times, soak 30 mins, boil with 1.5x water 15 mins.',
    },

    {
      name: 'Sella Rice',
      description: 'Parboiled sela rice. Non-sticky, aromatic. Perfect for daily cooking.',
      category: C('Rice'), price: 300, discountPrice: 280, costPrice: 220,
      images: [RIMG('Sella_rice_1kg_ubtlle')], stock: 150, unit: 'kg',
      weightOptions: [{ weight: '1kg', price: 280 }, { weight: '5kg', price: 1350 }],
      tags: ['sela', 'rice'],
    },
    {
      name: 'Tapal Danedar Value Pack',
      description: 'Tapal Danedar Economy Pack — great value, same bold flavour. Stock up and save.',
      category: C('Coffee & Tea'), price: 2650, discountPrice: 2450, costPrice: 1900,
      images: [RIMG('tapal-danedar-economy-pack-900-gm_nnjbfw'), RIMG('tapal-danedar-value-pack-430-gm_lrx9u6')],
      stock: 60, unit: 'g',
      weightOptions: [{ weight: '430g', price: 1350, image: RIMG('tapal-danedar-value-pack-430-gm_lrx9u6') }, { weight: '900g', price: 2650, image: RIMG('tapal-danedar-economy-pack-900-gm_nnjbfw') }],
      tags: ['tapal', 'danedar', 'economy', 'value pack'],
    },
    {
      name: 'Sting Energy Drink',
      description: 'Sting berry blast energy drink. Energize your day with the power of Sting.',
      category: C('Energy Drinks'), price: 80, discountPrice: 75, costPrice: 50,
      images: [RIMG('Sting_250ml_bxpyru')], stock: 200, isFeatured: true, unit: 'ml',
      weightOptions: [{ weight: '250ml', price: 75 }],
      tags: ['sting', 'energy', 'drink'],
    },

    {
      name: 'Red Bull Energy Drink',
      description: 'Red Bull — gives you wings. The world\'s no.1 energy drink. Caffeine, taurine, B vitamins.',
      category: C('Energy Drinks'), price: 280, discountPrice: 260, costPrice: 195,
      images: [RIMG('red-bull-stimulant-energy-drink-250-ml_fusqcn')], stock: 120, isFeatured: true, unit: 'ml',
      weightOptions: [{ weight: '250ml', price: 260 }],
      tags: ['red bull', 'energy drink', 'caffeine'],
    },

    // ── Juice ────────────────────────────────────────────────────────────────
    {
      name: 'Nestle Fruita Vitals Mango',
      description: 'Nestle Fruita Vitals Royal Mangoes nectar. 100% real fruit. No artificial colours.',
      category: C('Juice'), price: 240, discountPrice: 220, costPrice: 160,
      images: [RIMG('NestleFruitaVitalsRoyalMangoesNectarFruitDrink200m_kgz3sd'), RIMG('nestle-fruita-vital-royal-mangoes-nectar-200-ml_okbun2')],
      stock: 150, isFeatured: true, unit: 'ml',
      weightOptions: [{ weight: '200ml', price: 85, image: RIMG('nestle-fruita-vital-royal-mangoes-nectar-200-ml_okbun2') }, { weight: '1L', price: 230, image: RIMG('NestleFruitaVitalsRoyalMangoesNectarFruitDrink200m_kgz3sd') }],
      tags: ['nestle', 'fruita vitals', 'mango', 'juice'],
    },

    {
      name: 'Nestle Fruita Vitals Peach',
      description: 'Nestle Fruita Vitals Peach fruit drink. Rich in vitamins, no artificial colours.',
      category: C('Juice'), price: 240, discountPrice: 220, costPrice: 160,
      images: [RIMG('nestle-fruite-vital-peach-fruit-drink-200-ml_hyt9jp'), RIMG('nestle-fruita-vitals-peach-fruit-drink-1-ltr_cqeguo')],
      stock: 140, unit: 'ml',
      weightOptions: [{ weight: '200ml', price: 85, image: RIMG('nestle-fruite-vital-peach-fruit-drink-200-ml_hyt9jp') }, { weight: '1L', price: 230, image: RIMG('nestle-fruita-vitals-peach-fruit-drink-1-ltr_cqeguo') }],
      tags: ['nestle', 'fruita vitals', 'peach', 'juice'],
    },

    {
      name: 'Nestle Fruita Vitals Apple',
      description: 'Nestle Fruita Vitals Apple nectar. Crisp, refreshing apple goodness. No added preservatives.',
      category: C('Juice'), price: 240, discountPrice: 220, costPrice: 160,
      images: [RIMG('nestle-fruita-vitals-apple-fruit-nectar-200-ml_gb9jkx'), RIMG('nestle-fruita-vitals-apple-nectar-1-ltr_ye3z3c')],
      stock: 140, unit: 'ml',
      weightOptions: [{ weight: '200ml', price: 85, image: RIMG('nestle-fruita-vitals-apple-fruit-nectar-200-ml_gb9jkx') }, { weight: '1L', price: 230, image: RIMG('nestle-fruita-vitals-apple-nectar-1-ltr_ye3z3c') }],
      tags: ['nestle', 'fruita vitals', 'apple', 'juice'],
    },

    {
      name: 'Nestle Fruita Vitals Chaunsa',
      description: 'Nestle Fruita Vitals Chaunsa Mango nectar. Made from the finest Pakistani Chaunsa mangoes.',
      category: C('Juice'), price: 240, discountPrice: 220, costPrice: 160,
      images: [RIMG('nestle-fruita-vitals-chaunsa-mango-nectar-200-ml_sjwehe'), RIMG('nestle-fruita-vitals-chaunsa-1-ltr_rhfqsw')],
      stock: 130, isFeatured: true, unit: 'ml',
      weightOptions: [{ weight: '200ml', price: 85, image: RIMG('nestle-fruita-vitals-chaunsa-mango-nectar-200-ml_sjwehe') }, { weight: '1L', price: 230, image: RIMG('nestle-fruita-vitals-chaunsa-1-ltr_rhfqsw') }],
      tags: ['nestle', 'fruita vitals', 'chaunsa', 'mango', 'juice'],
    },

    {
      name: 'Nestle Fruita Vitals Guava',
      description: 'Nestle Fruita Vitals Guava nectar. Tropical, tangy and rich in Vitamin C.',
      category: C('Juice'), price: 240, discountPrice: 220, costPrice: 160,
      images: [RIMG('nestle-fruita-vitals-guava-nectar-1-ltr_uzeyz1')],
      stock: 130, unit: 'ml',
      weightOptions: [{ weight: '1L', price: 230, image: RIMG('nestle-fruita-vitals-guava-nectar-1-ltr_uzeyz1') }],
      tags: ['nestle', 'fruita vitals', 'guava', 'juice'],
    },

    {
      name: 'Nestle Fruita Vitals Pineapple',
      description: 'Nestle Fruita Vitals Pineapple nectar. Tropical sweetness packed with natural goodness.',
      category: C('Juice'), price: 240, discountPrice: 220, costPrice: 160,
      images: [RIMG('nestle-fruita-vitals-pineapple-nectar-1-ltr_jhy0zp')],
      stock: 120, unit: 'ml',
      weightOptions: [{ weight: '1L', price: 230, image: RIMG('nestle-fruita-vitals-pineapple-nectar-1-ltr_jhy0zp') }],
      tags: ['nestle', 'fruita vitals', 'pineapple', 'juice'],
    },

    {
      name: 'Nestle Fruita Vitals Red Grapes',
      description: 'Nestle Fruita Vitals Red Grapes nectar. Antioxidant-rich, naturally sweet grape juice.',
      category: C('Juice'), price: 240, discountPrice: 220, costPrice: 160,
      images: [RIMG('nestle-fruita-vitals-red-grapes-1-ltr_o4pipm')],
      stock: 120, unit: 'ml',
      weightOptions: [{ weight: '1L', price: 230, image: RIMG('nestle-fruita-vitals-red-grapes-1-ltr_o4pipm') }],
      tags: ['nestle', 'fruita vitals', 'red grapes', 'juice'],
    },

    {
      name: 'Nestle Fruita Vitals Orange',
      description: 'Nestle Fruita Vitals Orange Pure nectar. Vitamin C packed, no artificial preservatives.',
      category: C('Juice'), price: 240, discountPrice: 220, costPrice: 160,
      images: [RIMG('Nestle-Fruita-Vitals-Orange-Pure-1-Ltr_ck7tmq')],
      stock: 130, unit: 'ml',
      weightOptions: [{ weight: '1L', price: 230, image: RIMG('Nestle-Fruita-Vitals-Orange-Pure-1-Ltr_ck7tmq') }],
      tags: ['nestle', 'fruita vitals', 'orange', 'juice'],
    },

    {
      name: 'Nestle Nesfruita Mango',
      description: 'Nestle Nesfruita Mango juice drink. Pure mango taste with the goodness of real fruit.',
      category: C('Juice'), price: 220, discountPrice: 200, costPrice: 145,
      images: [RIMG('NestleNesfruitaMango200ml_ptrmcw'), RIMG('nestle-nesfruita-mango-1-ltr_fy0kiv')],
      stock: 140, unit: 'ml',
      weightOptions: [{ weight: '200ml', price: 75, image: RIMG('NestleNesfruitaMango200ml_ptrmcw') }, { weight: '1L', price: 205, image: RIMG('nestle-nesfruita-mango-1-ltr_fy0kiv') }],
      tags: ['nestle', 'nesfruita', 'mango', 'juice'],
    },

    {
      name: 'Nestle Nesfruita Apple',
      description: 'Nestle Nesfruita Apple juice drink. Crisp apple flavour your family will love.',
      category: C('Juice'), price: 220, discountPrice: 200, costPrice: 145,
      images: [RIMG('nestle-nesfruita-apple-juice-200-ml_fpqhuv'), RIMG('nestle-nesfruita-apple-1-ltr_bacext')],
      stock: 130, unit: 'ml',
      weightOptions: [{ weight: '200ml', price: 75, image: RIMG('nestle-nesfruita-apple-juice-200-ml_fpqhuv') }, { weight: '1L', price: 205, image: RIMG('nestle-nesfruita-apple-1-ltr_bacext') }],
      tags: ['nestle', 'nesfruita', 'apple', 'juice'],
    },

    {
      name: 'Fresher Mango Nectar',
      description: 'Fresher Mango Nectar — refreshing mango drink made from real fruit pulp. No artificial colours.',
      category: C('Juice'), price: 170, discountPrice: 150, costPrice: 105,
      images: [RIMG('fresher-mango-nectar-350-ml_jrxkm0'), RIMG('fresher-mango-nectar-500-ml-bottle_mhej0p'), RIMG('fresher-mango-nectar-1-ltr_q0mdk0')],
      stock: 160, isFeatured: true, unit: 'ml',
      weightOptions: [{ weight: '350ml', price: 70, image: RIMG('fresher-mango-nectar-350-ml_jrxkm0') }, { weight: '500ml', price: 100, image: RIMG('fresher-mango-nectar-500-ml-bottle_mhej0p') }, { weight: '1L', price: 165, image: RIMG('fresher-mango-nectar-1-ltr_q0mdk0') }],
      tags: ['fresher', 'mango', 'nectar', 'juice'],
    },

    {
      name: 'Fresher Strawberry Fruit Drink',
      description: 'Fresher Strawberry fruit drink. Bursting with real strawberry taste. No artificial colours.',
      category: C('Juice'), price: 100, discountPrice: 90, costPrice: 65,
      images: [RIMG('FresherStrawberryFruitDrink500ml_yknwwc')],
      stock: 150, unit: 'ml',
      weightOptions: [{ weight: '500ml', price: 95 }],
      tags: ['fresher', 'strawberry', 'juice', 'drink'],
    },

    {
      name: 'Fruita Vital Sparkling Apple',
      description: 'Fruita Vital Sparkling Apple juice can. Lightly carbonated, naturally refreshing.',
      category: C('Juice'), price: 110, discountPrice: 100, costPrice: 70,
      images: [RIMG('fruita-vital-sparkling-apple-juice-can-250-ml-_kvxujx')],
      stock: 140, unit: 'ml',
      weightOptions: [{ weight: '250ml', price: 100 }],
      tags: ['fruita vital', 'sparkling', 'apple', 'juice'],
    },
    {
      name: 'Coca-Cola',
      description: 'The original and iconic Coca-Cola. Refreshing, crisp and always delicious.',
      category: C('Soft Drinks'), price: 190, discountPrice: 175, costPrice: 120,
      images: [RIMG('coca-cola-bottle-500-ml_iqn0up')],
      stock: 300, isFeatured: true, unit: 'ml',
      weightOptions: [
        { weight: '250ml', price: 85,  image: RIMG('coca-cola-250-ml-can_l8e4mu') },
        { weight: '500ml', price: 110, image: RIMG('coca-cola-bottle-500-ml_iqn0up') },
        { weight: '1L',    price: 160, image: RIMG('coca-cola-bottle-1-ltr_gcoqmx') },
        { weight: '1.5L',  price: 190, image: RIMG('coca-cola-bottle-15-ltr_uvilkd') },
      ],
      tags: ['coca cola', 'soft drink', 'cola'],
    },

    {
      name: 'Sprite',
      description: 'Sprite lemon-lime soft drink. Clear, crisp and refreshing. Obey your thirst.',
      category: C('Soft Drinks'), price: 175, discountPrice: 160, costPrice: 110,
      images: [RIMG('sprite-bottle-15-ltr_rquwft')],
      stock: 250, unit: 'ml',
      weightOptions: [
        { weight: '250ml', price: 80,  image: RIMG('sprite-can-250-ml_pnjmho') },
        { weight: '350ml', price: 90,  image: RIMG('sprite-350-ml_pdkzvf') },
        { weight: '500ml', price: 100, image: RIMG('sprite-lemon-mint-flavor-bottle-500-ml_lodgiu') },
        { weight: '1L',    price: 150, image: RIMG('sprite_1-ltr_jqh1mc') },
        { weight: '1.5L',  price: 175, image: RIMG('sprite-bottle-15-ltr_rquwft') },
      ],
      tags: ['sprite', 'soft drink', 'lemon lime'],
    },

    {
      name: '7UP',
      description: '7UP — the crisp, clean lemon-lime flavour. Refreshing and caffeine-free. The Uncola.',
      category: C('Soft Drinks'), price: 170, discountPrice: 155, costPrice: 110,
      images: [RIMG('7up-500-ml_owfz99')],
      stock: 250, isFeatured: true, unit: 'ml',
      weightOptions: [
        { weight: '345ml', price: 80,  image: RIMG('7up-345ml_wcscan') },
        { weight: '500ml', price: 95,  image: RIMG('7up-500-ml_owfz99') },
        { weight: '1L',    price: 155, image: RIMG('7up-1-ltr_ozrxrt') },
        { weight: '1.5L',  price: 170, image: RIMG('7up-lemon-lime-taste-15-ltr_nkxl3n') },
      ],
      tags: ['7up', 'soft drink', 'lemon lime', 'fizzy'],
    },

    {
      name: 'Pepsi',
      description: 'Pepsi — the refreshing cola with a bold, sweet taste. Perfect chilled on a hot day.',
      category: C('Soft Drinks'), price: 190, discountPrice: 175, costPrice: 120,
      images: [RIMG('pepsi-can-250-ml_q14rhd')],
      stock: 280, isFeatured: true, unit: 'ml',
      weightOptions: [
        { weight: '250ml', price: 85,  image: RIMG('pepsi-can-250-ml_q14rhd') },
        { weight: '250ml Diet', price: 85, image: RIMG('PepsiDietSoftDrinkCan250ml_zs4i6k') },
      ],
      tags: ['pepsi', 'soft drink', 'cola'],
    },

    {
      name: 'Fanta Orange',
      description: 'Fanta Orange — the iconic fruity fizzy drink. Bursting with orange flavour.',
      category: C('Soft Drinks'), price: 190, discountPrice: 175, costPrice: 120,
      images: [RIMG('fanta-orange-can-250-ml_ycquhq')],
      stock: 200, unit: 'ml',
      weightOptions: [
        { weight: '250ml', price: 85, image: RIMG('fanta-orange-can-250-ml_ycquhq') },
      ],
      tags: ['fanta', 'orange', 'soft drink', 'fizzy'],
    },

    {
      name: 'Mirinda Orange',
      description: 'Mirinda — the fruity, fizzy orange drink. Bold colour, bold taste.',
      category: C('Soft Drinks'), price: 185, discountPrice: 170, costPrice: 115,
      images: [RIMG('mirinda_500-ml_bwbaex')],
      stock: 220, unit: 'ml',
      weightOptions: [
        { weight: '500ml', price: 100, image: RIMG('mirinda_500-ml_bwbaex') },
        { weight: '1L',    price: 165, image: RIMG('mirinda-1-ltr_nvundy') },
        { weight: '1.5L',  price: 185, image: RIMG('mirinda-15-ltr_mmxoff') },
      ],
      tags: ['mirinda', 'orange', 'soft drink', 'fizzy'],
    },

    {
      name: 'Mountain Dew',
      description: 'Mountain Dew — the citrus-charged energy rush. Dew the Dew.',
      category: C('Soft Drinks'), price: 195, discountPrice: 180, costPrice: 125,
      images: [RIMG('mountain-dew--500-ml_rf4be5')],
      stock: 240, isFeatured: true, unit: 'ml',
      weightOptions: [
        { weight: '500ml', price: 110, image: RIMG('mountain-dew--500-ml_rf4be5') },
        { weight: '1L',    price: 165, image: RIMG('mountain-dew-1-ltr_nmqmjj') },
        { weight: '1.5L',  price: 195, image: RIMG('mountain-dew-15-ltr_mgeqxx') },
      ],
      tags: ['mountain dew', 'dew', 'soft drink', 'citrus'],
    },

    {
      name: 'Colgate Herbal Toothpaste',
      description: 'Colgate Herbal — with natural herbal ingredients. Strong teeth, healthy gums and fresh breath.',
      category: C('Dental Care'), price: 440, discountPrice: 360, costPrice: 280,
      images: [IMG('colgate-herbal-150g.jpeg')],
      stock: 150, isFeatured: true, unit: 'tube',
      weightOptions: [{ weight: '150g', price: 360, image: IMG('colgate-herbal-150g.jpeg') }, { weight: '200g', price: 440, image: IMG('colgate-herbal-200g.jpeg') }],
      tags: ['colgate', 'herbal', 'toothpaste'],
    },

    {
      name: 'Colgate MaxFresh Toothpaste',
      description: 'Colgate MaxFresh with mini breath strips. Extra strong cooling for long-lasting freshness.',
      category: C('Dental Care'), price: 230, discountPrice: 200, costPrice: 155,
      images: [IMG('colgate-maxfresh-75g.jpeg')],
      stock: 150, unit: 'tube',
      weightOptions: [{ weight: '75g', price: 125, image: IMG('colgate-maxfresh-75g.jpeg') }, { weight: '125g', price: 200, image: IMG('colgate-maxfresh-125g.jpeg') }],
      tags: ['colgate', 'maxfresh', 'toothpaste'],
    },

    {
      name: "Forhan's Toothpaste",
      description: "Forhan's — the gum specialist. Strengthens gums and prevents bleeding.",
      category: C('Dental Care'), price: 285, discountPrice: 265, costPrice: 200,
      images: [IMG('forhans-toothpaste-40g.jpeg')],
      stock: 120, unit: 'tube',
      weightOptions: [{ weight: '40g', price: 95, image: IMG('forhans-toothpaste-40g.jpeg') }, { weight: '180g', price: 285, image: IMG('forhans-toothpaste-180g.jpeg') }],
      tags: ['forhans', 'toothpaste', 'gums'],
    },

    {
      name: 'Medicam Dental Cream',
      description: 'Medicam Dental Cream — fights cavities, whitens teeth and freshens breath.',
      category: C('Dental Care'), price: 130, discountPrice: 115, costPrice: 90,
      images: [IMG('medicam-dental-cream.jpeg')], stock: 180, unit: 'tube',
      weightOptions: [{ weight: '120g', price: 115 }],
      tags: ['medicam', 'dental', 'toothpaste'],
    },

    {
      name: 'Sensodyne Deep Clean',
      description: 'Daily sensitivity protection with strong teeth & healthy gums. Dentist recommended.',
      category: C('Dental Care'), price: 420, discountPrice: 390, costPrice: 320,
      images: [IMG('sensodyne-deep-clean.jpg')], stock: 100, unit: 'tube',
      weightOptions: [{ weight: '75g', price: 390 }],
      tags: ['sensodyne', 'toothpaste', 'sensitivity'],
    },

    {
      name: 'Sensodyne Extra Whitening',
      description: 'Stain removal, whitens teeth & cavity protection. 24/7 sensitivity protection.',
      category: C('Dental Care'), price: 420, discountPrice: 390, costPrice: 320,
      images: [IMG('sensodyne-extra-whitening.jpg')], stock: 100, unit: 'tube',
      weightOptions: [{ weight: '75g', price: 390 }],
      tags: ['sensodyne', 'whitening', 'sensitivity'],
    },

    {
      name: 'Sensodyne Repair & Protect',
      description: 'Clinically proven sensitivity relief with daily repair. #1 dentist recommended brand.',
      category: C('Dental Care'), price: 450, discountPrice: 420, costPrice: 345,
      images: [IMG('sensodyne-repair-protect.jpg')], stock: 90, isFeatured: true, unit: 'tube',
      weightOptions: [{ weight: '75g', price: 420 }],
      tags: ['sensodyne', 'repair', 'sensitivity'],
    },

    {
      name: 'Sensodyne Complete Protection+',
      description: 'All-in-one daily oral care. Covers sensitivity, cavity, gums, enamel, whitening and more.',
      category: C('Dental Care'), price: 460, discountPrice: 430, costPrice: 355,
      images: [IMG('sensodyne-complete-protection.jpg')], stock: 90, unit: 'tube',
      weightOptions: [{ weight: '75g', price: 430 }],
      tags: ['sensodyne', 'complete', 'sensitivity'],
    },

    {
      name: 'Sensodyne Rapid Relief',
      description: 'Clinically proven fast sensitivity relief with long-lasting daily protection.',
      category: C('Dental Care'), price: 450, discountPrice: 420, costPrice: 345,
      images: [IMG('sensodyne-rapid-relief.jpg')], stock: 95, unit: 'tube',
      weightOptions: [{ weight: '75g', price: 420 }],
      tags: ['sensodyne', 'rapid relief'],
    },

    {
      name: 'Sensodyne Original',
      description: 'The classic Sensodyne formula. 24/7 sensitivity protection and cavity protection.',
      category: C('Dental Care'), price: 400, discountPrice: 370, costPrice: 300,
      images: [IMG('sensodyne-original.jpg')], stock: 110, unit: 'tube',
      weightOptions: [{ weight: '75g', price: 370 }],
      tags: ['sensodyne', 'original', 'sensitivity'],
    },

    {
      name: 'Sensodyne Fluoride',
      description: 'Improved formulation. Fresh taste, triple cleaning & cavity protection.',
      category: C('Dental Care'), price: 420, discountPrice: 390, costPrice: 320,
      images: [IMG('sensodyne-fluoride.jpg')], stock: 100, unit: 'tube',
      weightOptions: [{ weight: '75g', price: 390 }],
      tags: ['sensodyne', 'fluoride'],
    },

    {
      name: 'Parodontax Extra Fresh',
      description: 'Daily fluoride toothpaste for healthy gums. Helps stop and prevent bleeding gums.',
      category: C('Dental Care'), price: 480, discountPrice: 450, costPrice: 370,
      images: [IMG('parodontax-extra-fresh.jpg')], stock: 80, isFeatured: true, unit: 'tube',
      weightOptions: [{ weight: '75g', price: 450 }],
      tags: ['parodontax', 'gums', 'bleeding'],
    },

    {
      name: 'Parodontax Original',
      description: 'Improved taste formula. Daily fluoride toothpaste — helps stop bleeding gums.',
      category: C('Dental Care'), price: 480, discountPrice: 450, costPrice: 370,
      images: [IMG('parodontax-original.jpg')], stock: 80, unit: 'tube',
      weightOptions: [{ weight: '75g', price: 450 }],
      tags: ['parodontax', 'gums'],
    },
    {
      name: 'Premium Almonds (Badam)',
      description: 'Premium quality California almonds. Rich in protein, healthy fats and vitamins.',
      category: C('Dry Fruits & Nuts'), price: 1100, discountPrice: 1000, costPrice: 800,
      images: [RIMG('American_Badam_200gm_امریکن_بادام_pioibg')], stock: 80, isFeatured: true, unit: 'g',
      weightOptions: [{ weight: '100g', price: 460 }, { weight: '250g', price: 1080 }],
      tags: ['almonds', 'badam', 'dry fruits', 'nuts'],
    },
    {
      name: 'White Chana Fine (Safaid Chana Barik)',
      description: 'Premium fine white chickpeas from Punjab. Clean, sorted and packed. Perfect for curries and chaat.',
      category: C('Pulse'), price: 320, discountPrice: 300, costPrice: 230,
      images: [RIMG('White_Chana_سفید_چنا_باریک_1kg_nuss5k')], stock: 150, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 155 }, { weight: '1kg', price: 300 }],
      tags: ['white chana', 'safaid chana', 'chickpea', 'pulse'],
      cookingInstructions: 'Soak overnight, boil 30 mins, temper with fried onions and spices.',
    },

    {
      name: 'White Chana Bold (Safaid Chana Mota)',
      description: 'Large whole white chickpeas. Nutritious, high protein. Great for chole, chaat and stews.',
      category: C('Pulse'), price: 340, discountPrice: 320, costPrice: 240,
      images: [RIMG('White_Chana_Bold_سفید_چنا_موٹا_1kg_ogsd1a')], stock: 140, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 165 }, { weight: '1kg', price: 320 }],
      tags: ['white chana', 'bold', 'chickpea', 'pulse'],
    },

    {
      name: 'Black Chana (Kala Chana)',
      description: 'Desi black chickpeas. Rich in fibre and protein. Traditional Pakistani favourite for breakfast.',
      category: C('Pulse'), price: 300, discountPrice: 280, costPrice: 210,
      images: [RIMG('Black_Chana_کالا_چنا_1kg_ude7ea')], stock: 160, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 145 }, { weight: '1kg', price: 280 }],
      tags: ['kala chana', 'black chickpea', 'desi', 'pulse'],
      cookingInstructions: 'Soak overnight, boil 40 mins. Serve with tarka of onion, tomato and spices.',
    },

    {
      name: 'Dal Mash Washed (Daal Maash Dhuli)',
      description: 'Premium washed split urad dal. Soft, nutritious and quick to cook. Perfect for everyday dal.',
      category: C('Pulse'), price: 360, discountPrice: 340, costPrice: 260,
      images: [RIMG('Dal_Mash_Wash_دال_ماش_دھلی_ہوئی_1kg_tfwd3p')], stock: 130, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 175 }, { weight: '1kg', price: 340 }],
      tags: ['dal mash', 'urad dal', 'washed', 'pulse'],
    },

    {
      name: 'Dal Mash Shelled (Daal Maash Chilka)',
      description: 'Whole urad dal with skin. High in protein and fibre. Great for dal mash and pakoras.',
      category: C('Pulse'), price: 340, discountPrice: 320, costPrice: 245,
      images: [RIMG('Dal_Mash_shelled_دال_ماش_چھلکا_1kg_l1y0ew')], stock: 140, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 165 }, { weight: '1kg', price: 320 }],
      tags: ['dal mash', 'urad', 'chilka', 'pulse'],
    },

    {
      name: 'Masoor Whole Bold (Masoor Sabit Mota)',
      description: 'Whole bold masoor lentils. Rich flavour, hearty texture. Perfect for thick dal and soups.',
      category: C('Pulse'), price: 280, discountPrice: 260, costPrice: 195,
      images: [RIMG('Masoor_Whole_Bold_مسور_ثابت_موٹے_1kg_e2gonp')], stock: 150, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 135 }, { weight: '1kg', price: 260 }],
      tags: ['masoor', 'whole', 'bold', 'lentil', 'pulse'],
    },

    {
      name: 'Mash Whole (Mash Sabit)',
      description: 'Whole urad beans with black skin. High protein. Used in traditional desi dishes.',
      category: C('Pulse'), price: 340, discountPrice: 320, costPrice: 245,
      images: [RIMG('Mash_Whole_ماش_ثابت_1kg_wvlp4z')], stock: 120, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 165 }, { weight: '1kg', price: 320 }],
      tags: ['mash', 'whole', 'urad', 'pulse'],
    },

    {
      name: 'Mong Whole (Mong Sabit)',
      description: 'Whole green mung beans. Nutritious and versatile. Great sprouted or cooked.',
      category: C('Pulse'), price: 340, discountPrice: 320, costPrice: 245,
      images: [RIMG('Mong_Whole_مونگ_ثابت_1kg_zbvxev')], stock: 130, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 165 }, { weight: '1kg', price: 320 }],
      tags: ['mong', 'moong', 'whole', 'green', 'pulse'],
    },

    {
      name: 'Red Lobia (Surkh Lobia)',
      description: 'Red kidney beans. Protein-packed, great for rajma, stews and mixed dals.',
      category: C('Pulse'), price: 260, discountPrice: 240, costPrice: 180,
      images: [RIMG('Red_Lobia_سرخ_لوبیا_1kg_k5odt4')], stock: 140, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 125 }, { weight: '1kg', price: 240 }],
      tags: ['lobia', 'red', 'kidney bean', 'pulse'],
    },

    {
      name: 'White Lobia (Safaid Lobia)',
      description: 'White navy beans. Mild flavour, creamy texture. Perfect for curries and salads.',
      category: C('Pulse'), price: 260, discountPrice: 240, costPrice: 180,
      images: [RIMG('White_Lobia_سفید_لوبیا_1kg_ez5ug5')], stock: 140, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 125 }, { weight: '1kg', price: 240 }],
      tags: ['lobia', 'white', 'navy bean', 'pulse'],
    },
    {
      name: 'Adhwar Rice',
      description: 'Classic Adhwar rice. Short grain, soft and filling. Great for everyday cooking.',
      category: C('Rice'), price: 290, discountPrice: 270, costPrice: 205,
      images: [RIMG('Adhwar_Rice_1kg_nyl0ww')], stock: 180, unit: 'kg',
      weightOptions: [{ weight: '1kg', price: 270 }, { weight: '5kg', price: 1300 }],
      tags: ['adhwar', 'rice', 'short grain'],
    },

    {
      name: 'Double Steam 1121 Kainat Rice',
      description: 'Extra long grain double steam Kainat 1121 basmati. Superior aroma and non-sticky texture.',
      category: C('Rice'), price: 600, discountPrice: 550, costPrice: 430,
      images: [RIMG('double_steam1121_kainat_1kg_fddwne')], stock: 120, isFeatured: true, unit: 'kg',
      weightOptions: [{ weight: '1kg', price: 550 }, { weight: '5kg', price: 2600 }],
      tags: ['1121', 'kainat', 'basmati', 'double steam', 'rice'],
    },
    {
      name: 'Haldi Powder (Turmeric)',
      description: 'Pure ground turmeric powder. Bright golden colour and earthy flavour. Essential Pakistani spice.',
      category: C('Spices'), price: 160, discountPrice: 145, costPrice: 100,
      images: [RIMG('Haldi_powder_ہلدی_پاؤڈر_250gm_mxnln1')], stock: 250, unit: 'g',
      weightOptions: [{ weight: '100g', price: 70 }, { weight: '250g', price: 155 }],
      tags: ['haldi', 'turmeric', 'spice', 'powder'],
      nutritionalInfo: 'Contains curcumin — a powerful antioxidant.',
    },

    {
      name: 'Black Pepper (Kali Mirch)',
      description: 'Whole black peppercorns or powder. Bold, pungent flavour for curries, meat and marinades.',
      category: C('Spices'), price: 270, discountPrice: 250, costPrice: 180,
      images: [RIMG('Black_pepper_کالی_مرچ_100mg_qythan')], stock: 180, unit: 'g',
      weightOptions: [{ weight: '50g', price: 135 }, { weight: '100g', price: 255 }],
      tags: ['black pepper', 'kali mirch', 'spice'],
    },

    {
      name: 'White Pepper Whole (Safaid Mirch Sabit)',
      description: 'Whole white peppercorns. Milder and less pungent than black pepper. Great for light sauces.',
      category: C('Spices'), price: 220, discountPrice: 200, costPrice: 145,
      images: [RIMG('White_Pepper_Whole_50mg_سفید_مرچ_rklshe')], stock: 120, unit: 'g',
      weightOptions: [{ weight: '50g', price: 110 }, { weight: '100g', price: 205 }],
      tags: ['white pepper', 'whole', 'spice'],
    },

    {
      name: 'White Pepper Powder (Safaid Mirch Powder)',
      description: 'Finely ground white pepper. Perfect for white sauces, soups and subtle heat in dishes.',
      category: C('Spices'), price: 220, discountPrice: 200, costPrice: 145,
      images: [RIMG('White_pepper_powder_50gm_سفید_مرچ_پاؤڈر_gdozgw')], stock: 120, unit: 'g',
      weightOptions: [{ weight: '50g', price: 110 }, { weight: '100g', price: 205 }],
      tags: ['white pepper', 'powder', 'spice'],
    },

    {
      name: 'Saunf (Fennel Seeds)',
      description: 'Aromatic fennel seeds. Sweet, liquorice-like flavour. Used in curries, chai and as mouth freshener.',
      category: C('Spices'), price: 130, discountPrice: 115, costPrice: 80,
      images: [RIMG('Saunf_Fennel_Seeds_100mgسونف_bjtaky')], stock: 200, unit: 'g',
      weightOptions: [{ weight: '50g', price: 60 }, { weight: '100g', price: 115 }],
      tags: ['saunf', 'fennel', 'seeds', 'spice'],
    },

    {
      name: 'Choti Elaichi (Green Cardamom)',
      description: 'Fragrant green cardamom pods. Essential for chai, biryanis and Pakistani desserts.',
      category: C('Spices'), price: 450, discountPrice: 420, costPrice: 310,
      images: [RIMG('CHOTI_Elaichi_cardamon_50grm_askylc')], stock: 100, unit: 'g',
      weightOptions: [{ weight: '25g', price: 220 }, { weight: '50g', price: 430 }],
      tags: ['elaichi', 'cardamom', 'green', 'spice'],
    },

    {
      name: 'Badi Elaichi (Black Cardamom)',
      description: 'Smoky black cardamom pods. Adds deep aroma to biryanis, pulao and meat curries.',
      category: C('Spices'), price: 550, discountPrice: 510, costPrice: 380,
      images: [RIMG('Badi_Elaichi_Black_Cardamom_بڑی_الائچی_50mg_yvrqvc')], stock: 80, unit: 'g',
      weightOptions: [{ weight: '25g', price: 265 }, { weight: '50g', price: 520 }],
      tags: ['badi elaichi', 'black cardamom', 'spice'],
    },

    {
      name: 'Imli (Tamarind)',
      description: 'Dried Iranian tamarind. Tangy, rich flavour for chutneys, dals, BBQ marinades and drinks.',
      category: C('Spices'), price: 130, discountPrice: 115, costPrice: 80,
      images: [RIMG('Imli_Tamarind_200mgاملی_ynet1g')], stock: 180, unit: 'g',
      weightOptions: [{ weight: '100g', price: 60 }, { weight: '200g', price: 115 }],
      tags: ['imli', 'tamarind', 'chutney', 'spice'],
    },

    {
      name: 'Loong (Cloves)',
      description: 'Whole dried cloves. Intensely aromatic, used in biryanis, pulaos, garam masala and chai. A key Pakistani spice.',
      category: C('Spices'), price: 150, discountPrice: 135, costPrice: 95,
      images: [RIMG('Loong_50gm_لونگ_ngjb4m')], stock: 120, unit: 'g',
      weightOptions: [{ weight: '50g', price: 135 }],
      tags: ['loong', 'cloves', 'whole spice', 'biryani'],
    },

    {
      name: 'Dar Chini (Cinnamon)',
      description: 'Whole cinnamon sticks. Sweet, warm aroma. Essential for biryani, chai, garam masala and baking.',
      category: C('Spices'), price: 130, discountPrice: 115, costPrice: 80,
      images: [RIMG('Dar_cheni_دارچینی_50gm_cdh2mc')], stock: 150, unit: 'g',
      weightOptions: [{ weight: '50g', price: 115 }],
      tags: ['dar chini', 'cinnamon', 'whole spice', 'chai'],
    },

    {
      name: 'Anaar Dana (Pomegranate Seeds)',
      description: 'Dried pomegranate seeds. Tangy, fruity flavour for chutneys, chaats, curries and marinades.',
      category: C('Spices'), price: 160, discountPrice: 145, costPrice: 100,
      images: [RIMG('Anaar_Dana_100gm_انار_دانہ_xbovpy')], stock: 100, unit: 'g',
      weightOptions: [{ weight: '100g', price: 145 }],
      tags: ['anaar dana', 'pomegranate seeds', 'chutney', 'spice'],
    },

    {
      name: 'Jalwatri (Mace)',
      description: 'Dried mace — the outer coating of nutmeg. Warm, slightly sweet aroma for biryanis and garam masala.',
      category: C('Spices'), price: 250, discountPrice: 225, costPrice: 160,
      images: [RIMG('Jalwatri_25mg_جلوتری_aiwcdk')], stock: 80, unit: 'g',
      weightOptions: [{ weight: '25g', price: 225 }],
      tags: ['jalwatri', 'mace', 'javitri', 'whole spice'],
    },

    {
      name: 'Baisin (Gram Flour)',
      description: 'Fine gram flour made from ground chickpeas. Essential for pakoras, besan halwa and batters.',
      category: C('Atta & Flours'), price: 230, discountPrice: 210, costPrice: 155,
      images: [RIMG('Baisin_1kg_jim6or')], stock: 200, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 110 }, { weight: '1kg', price: 210 }],
      tags: ['baisin', 'gram flour', 'besan', 'pakora'],
    },

    {
      name: 'Sugar (Cheeni)',
      description: 'Refined white sugar. Essential for chai, desserts and everyday cooking. Premium quality.',
      category: C('Atta & Flours'), price: 280, discountPrice: 260, costPrice: 200,
      images: [RIMG('Sugar_2kg_d59ixm')], stock: 300, unit: 'kg',
      weightOptions: [{ weight: '1kg', price: 135 }, { weight: '2kg', price: 265 }],
      tags: ['sugar', 'cheeni', 'sweet', 'grocery'],
    },

    {
      name: 'Desi Gur (Jaggery)',
      description: 'Pure unrefined desi jaggery. Natural sweetener rich in minerals. Perfect for desserts and chai.',
      category: C('Atta & Flours'), price: 270, discountPrice: 250, costPrice: 185,
      images: [RIMG('Desi_Gurr_1kg_500gm_afbjac')], stock: 180, unit: 'kg',
      weightOptions: [{ weight: '500g', price: 130 }, { weight: '1kg', price: 255 }],
      tags: ['gur', 'jaggery', 'desi', 'natural sweetener'],
    },
    {
      name: 'Pistachios Salted (Namkeen Pista)',
      description: 'Lightly salted Iranian pistachios. Crunchy, flavourful and rich in healthy fats.',
      category: C('Dry Fruits & Nuts'), price: 1300, discountPrice: 1200, costPrice: 950,
      images: [RIMG('Pistachio_salted_200mg_نمکین_پستہ_ndznc4')], stock: 60, isFeatured: true, unit: 'g',
      weightOptions: [{ weight: '100g', price: 620 }, { weight: '200g', price: 1220 }],
      tags: ['pistachio', 'pista', 'salted', 'dry fruits', 'nuts'],
    },

    {
      name: 'Aloo Bukhara (Dried Plum)',
      description: 'Iranian dried plums. Sweet-tangy flavour. Great for chutneys, biryanis and as a healthy snack.',
      category: C('Dry Fruits & Nuts'), price: 650, discountPrice: 600, costPrice: 450,
      images: [RIMG('Aloo_Bukhara_plum_200mg_ایرانی_آلو_بخارا_pe6fga')], stock: 80, unit: 'g',
      weightOptions: [{ weight: '100g', price: 310 }, { weight: '200g', price: 610 }],
      tags: ['aloo bukhara', 'dried plum', 'dry fruits'],
    },
    {
      name: 'Corn Flour',
      description: 'Fine white corn flour for thickening gravies, soups, custards and baking. Gluten-free and smooth texture.',
      category: C('Atta & Flours'), price: 180, discountPrice: 160, costPrice: 110,
      images: [RIMG('cornflor_v0bbym')], stock: 150, unit: 'g',
      weightOptions: [{ weight: '200g', price: 160 }, { weight: '500g', price: 350 }],
      tags: ['corn flour', 'cornflour', 'baking', 'atta'],
    },
    {
      name: 'Nestle Milo',
      description: 'Nestle Milo chocolate malt drink. Rich in energy, vitamins and minerals. Loved by kids and adults alike.',
      category: C('Flavored Milk'), price: 350, discountPrice: 320, costPrice: 230,
      images: [RIMG('milo_febkzd')], stock: 120, unit: 'g',
      weightOptions: [{ weight: '200g', price: 320 }, { weight: '400g', price: 600 }],
      tags: ['milo', 'nestle', 'chocolate', 'malt', 'flavored milk'],
    },
    {
      name: 'Nestle Nido Milk Powder',
      description: 'Nestle Nido full cream milk powder. Fortified with vitamins and minerals for the whole family.',
      category: C('Powder Milk'), price: 850, discountPrice: 800, costPrice: 620,
      images: [RIMG('nido_elrqt2')], stock: 100, unit: 'g',
      weightOptions: [{ weight: '400g', price: 800 }, { weight: '900g', price: 1650 }],
      tags: ['nido', 'nestle', 'milk powder', 'powder milk'],
    },
    // ── Biscuits & Cookies ────────────────────────────────────────────────────
    {
      name: 'LU Zeera Plus Half Roll',
      description: 'Classic LU Zeera Plus biscuits with real cumin seeds. Light, crispy and perfect with tea.',
      category: C('Biscuits & Cookies'), price: 120, discountPrice: 110, costPrice: 75,
      images: [RIMG('zeeraplus_half_roll_yaeeth')], stock: 200, unit: 'pcs',
      tags: ['zeera plus', 'lu', 'biscuits', 'cookies', 'cumin'],
    },
    {
      name: 'Chocolicious Biscuits',
      description: 'Delicious chocolate-filled biscuits. A perfect sweet snack for all ages.',
      category: C('Biscuits & Cookies'), price: 80, discountPrice: 70, costPrice: 45,
      images: [RIMG('chocolicious_xt1yxm')], stock: 150, unit: 'pcs',
      tags: ['chocolicious', 'chocolate', 'biscuits', 'snacks'],
    },
    {
      name: 'Candi Candy Pack',
      description: 'Assorted fruit-flavoured hard candies. A colourful mix of sweet treats for kids and adults.',
      category: C('Biscuits & Cookies'), price: 150, discountPrice: 130, costPrice: 85,
      images: [RIMG('Candi-pack_ewqvze')], stock: 200, unit: 'pcs',
      tags: ['candi', 'candy', 'sweets', 'chocolate'],
    },
    {
      name: 'Choco Lava Chocolate',
      description: 'Rich and indulgent choco lava chocolate bar. Smooth, creamy and irresistibly delicious.',
      category: C('Biscuits & Cookies'), price: 180, discountPrice: 160, costPrice: 105,
      images: [RIMG('choco_lava_ohdhie')], stock: 120, unit: 'pcs',
      tags: ['choco lava', 'chocolate', 'bar', 'sweets'],
    },
    {
      name: 'Oreo Biscuits 4x Pack',
      description: 'The classic Oreo chocolate sandwich biscuits. 4-pack value bundle. Twist, lick, dunk!',
      category: C('Biscuits & Cookies'), price: 280, discountPrice: 250, costPrice: 170,
      images: [RIMG('Oreo-4x_b7y51h')], stock: 180, isFeatured: true, unit: 'pcs',
      tags: ['oreo', 'biscuits', 'cookies', 'chocolate', 'snacks'],
    },
    // ── Chocolates & Candies ──────────────────────────────────────────────────
    {
      name: 'Dairy Milk Bubbly Milk Chocolate 40g',
      description: 'Cadbury Dairy Milk Bubbly — airy bubbles of milk chocolate for a lighter, meltier bite.',
      category: C('Chocolates & Candies'), price: 220, discountPrice: 200, costPrice: 140,
      images: [RIMG('Dairy_Milk_Bubbly_Milk_Chocolate_40g_oxycbl')], stock: 150, isFeatured: true, unit: '40g',
      tags: ['dairy milk', 'cadbury', 'bubbly', 'chocolate'],
    },
    {
      name: 'Cadbury Dairy Milk Chocolate 56g',
      description: 'The iconic Cadbury Dairy Milk chocolate bar. Smooth, creamy and full of rich milk chocolate.',
      category: C('Chocolates & Candies'), price: 280, discountPrice: 260, costPrice: 180,
      images: [RIMG('cadbury-dairy-milk-chocolate-56-gm-344319_yaaqyc')], stock: 130, isFeatured: true, unit: '56g',
      tags: ['cadbury', 'dairy milk', 'chocolate', 'bar'],
    },
    {
      name: 'Dettol Antiseptic Liquid',
      description: 'Dettol antiseptic disinfectant liquid. Kills 99.9% of germs. Used for wound care, laundry and surface cleaning.',
      category: C('Cleaning Cupboard'), price: 280, discountPrice: 250, costPrice: 180,
      images: [RIMG('dettol_djdbxw')], stock: 130, unit: 'ml',
      weightOptions: [{ weight: '60ml', price: 130 }],
      tags: ['dettol', 'antiseptic', 'disinfectant', 'cleaning'],
    },

    // ── Bath Soap ─────────────────────────────────────────────────────────────
    {
      name: 'Lux Fresh Glow Soap',
      description: 'Lux Fresh Glow — the beauty bar loved worldwide. Soft, moisturising lather for silky smooth skin.',
      category: C('Bath Soap'), price: 150, discountPrice: 140, costPrice: 100,
      images: [RIMG('lux-fresh-glow-soap-130-gm_kiltd8')],
      stock: 250, isFeatured: true, unit: 'gm',
      weightOptions: [{ weight: '130gm', price: 140, image: RIMG('lux-fresh-glow-soap-130-gm_kiltd8') }],
      tags: ['lux', 'soap', 'bath soap', 'beauty', 'fresh glow'],
    },

    {
      name: 'Lux Purple Lotus Soap',
      description: 'Lux Purple Lotus — indulgent beauty bar with lotus fragrance. Leaves skin silky and smooth.',
      category: C('Bath Soap'), price: 145, discountPrice: 130, costPrice: 95,
      images: [RIMG('lux-soap-purple-lotus-128-gm_wa06za')],
      stock: 220, unit: 'gm',
      weightOptions: [{ weight: '128gm', price: 130, image: RIMG('lux-soap-purple-lotus-128-gm_wa06za') }],
      tags: ['lux', 'soap', 'bath soap', 'beauty', 'purple lotus'],
    },

    {
      name: 'Lux Velvet Glow Soap',
      description: 'Lux Velvet Glow — enriched with jasmine and Vitamin E. Luxuriously soft, glowing skin.',
      category: C('Bath Soap'), price: 145, discountPrice: 130, costPrice: 95,
      images: [RIMG('lux-velvet-glow-soap-jasmine-vitamin-e-128-gm_gnw8mk')],
      stock: 220, unit: 'gm',
      weightOptions: [{ weight: '128gm', price: 130, image: RIMG('lux-velvet-glow-soap-jasmine-vitamin-e-128-gm_gnw8mk') }],
      tags: ['lux', 'soap', 'bath soap', 'beauty', 'velvet glow'],
    },

    {
      name: 'Lux Velvet Touch Soap',
      description: 'Lux Velvet Touch — creamy lather for velvet-smooth skin. Premium fragrance you will love.',
      category: C('Bath Soap'), price: 110, discountPrice: 100, costPrice: 72,
      images: [RIMG('lux-velvet-touch-soap-98-gm_hlubcg')],
      stock: 200, unit: 'gm',
      weightOptions: [{ weight: '98gm', price: 100, image: RIMG('lux-velvet-touch-soap-98-gm_hlubcg') }],
      tags: ['lux', 'soap', 'bath soap', 'beauty', 'velvet touch'],
    },

    {
      name: 'Lifebuoy Herbal Soap',
      description: 'Lifebuoy Herbal — germ protection soap with natural herbal extracts. Kills 99.9% of germs.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('lifebuoy-soap-herbal-128-gm_o9wu4e')],
      stock: 230, isFeatured: true, unit: 'gm',
      weightOptions: [{ weight: '128gm', price: 140, image: RIMG('lifebuoy-soap-herbal-128-gm_o9wu4e') }],
      tags: ['lifebuoy', 'soap', 'herbal', 'germ protection', 'bath soap'],
    },

    {
      name: 'Lifebuoy Care & Protect Soap',
      description: 'Lifebuoy Care & Protect — antibacterial soap with advanced germ protection for the whole family.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('lifebuoy-care-protect-soap-128-gm_z5barp')],
      stock: 210, unit: 'gm',
      weightOptions: [{ weight: '128gm', price: 140, image: RIMG('lifebuoy-care-protect-soap-128-gm_z5barp') }],
      tags: ['lifebuoy', 'soap', 'care protect', 'germ protection', 'bath soap'],
    },

    {
      name: 'Lifebuoy Lemon Fresh Soap',
      description: 'Lifebuoy Lemon Fresh — antibacterial soap with a refreshing lemon fragrance. Kills 99.9% of germs.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('lifebuoy-lemon-fresh-soap-128-gm_otkopf')],
      stock: 210, unit: 'gm',
      weightOptions: [{ weight: '128gm', price: 140, image: RIMG('lifebuoy-lemon-fresh-soap-128-gm_otkopf') }],
      tags: ['lifebuoy', 'soap', 'lemon fresh', 'germ protection', 'bath soap'],
    },

    {
      name: 'Dettol Original Soap',
      description: 'Dettol Original — the antibacterial soap trusted by doctors. Kills 99.9% of germs. Keeps skin clean and fresh.',
      category: C('Bath Soap'), price: 165, discountPrice: 150, costPrice: 110,
      images: [RIMG('dettol-original-anti-bacterial-soap-110-gm_jcofjm')],
      stock: 220, isFeatured: true, unit: 'gm',
      weightOptions: [{ weight: '85gm', price: 120, image: RIMG('dettol-original-soap-85-gm_r1pkcz') }, { weight: '110gm', price: 165, image: RIMG('dettol-original-anti-bacterial-soap-110-gm_jcofjm') }],
      tags: ['dettol', 'soap', 'original', 'antibacterial', 'bath soap'],
    },

    {
      name: 'Dettol Cool Soap',
      description: 'Dettol Cool — antibacterial soap with a refreshing menthol cool sensation. Kills germs, feels great.',
      category: C('Bath Soap'), price: 165, discountPrice: 150, costPrice: 110,
      images: [RIMG('dettol-soap-cool-110-gm_opjepx')],
      stock: 200, unit: 'gm',
      weightOptions: [{ weight: '85gm', price: 120, image: RIMG('dettol-soap-cool-85-gm_fv9nmg') }, { weight: '110gm', price: 165, image: RIMG('dettol-soap-cool-110-gm_opjepx') }],
      tags: ['dettol', 'soap', 'cool', 'antibacterial', 'bath soap'],
    },

    {
      name: 'Dettol Skin Care Soap',
      description: 'Dettol Skin Care — antibacterial soap enriched with moisturising cream. Protects while it nourishes.',
      category: C('Bath Soap'), price: 110, discountPrice: 100, costPrice: 72,
      images: [RIMG('dettol-skin-care-soap-80-gm_emcarx')],
      stock: 180, unit: 'gm',
      weightOptions: [{ weight: '80gm', price: 100, image: RIMG('dettol-skin-care-soap-80-gm_emcarx') }],
      tags: ['dettol', 'soap', 'skin care', 'moisturising', 'bath soap'],
    },

    {
      name: 'Dettol Lemon Fresh Soap',
      description: 'Dettol Lemon Fresh — antibacterial soap with a bright lemon fragrance. Germ protection with citrus freshness.',
      category: C('Bath Soap'), price: 100, discountPrice: 90, costPrice: 65,
      images: [RIMG('dettol-fresh-lemon-anti-bacterial-soap-72-gm_fryy3w')],
      stock: 180, unit: 'gm',
      weightOptions: [{ weight: '72gm', price: 90, image: RIMG('dettol-fresh-lemon-anti-bacterial-soap-72-gm_fryy3w') }],
      tags: ['dettol', 'soap', 'lemon fresh', 'antibacterial', 'bath soap'],
    },

    {
      name: 'Safeguard Pure White Soap',
      description: 'Safeguard Pure White Plus — antibacterial soap with long-lasting germ protection. Keeps skin clean and healthy.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('safeguard-pure-white-plus-soap-125-gm_yzmuwa')],
      stock: 200, unit: 'gm',
      weightOptions: [{ weight: '125gm', price: 140, image: RIMG('safeguard-pure-white-plus-soap-125-gm_yzmuwa') }],
      tags: ['safeguard', 'soap', 'pure white', 'antibacterial', 'bath soap'],
    },

    {
      name: 'Safeguard Lemon Fresh Soap',
      description: 'Safeguard Lemon Fresh — antibacterial soap with a refreshing lemon burst. Long-lasting germ protection.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('safeguard-lemon-fresh-soap-125-gm_wiimnb')],
      stock: 190, unit: 'gm',
      weightOptions: [{ weight: '125gm', price: 140, image: RIMG('safeguard-lemon-fresh-soap-125-gm_wiimnb') }],
      tags: ['safeguard', 'soap', 'lemon fresh', 'antibacterial', 'bath soap'],
    },

    {
      name: 'Safeguard Floral Bloom Soap',
      description: 'Safeguard Floral Bloom — antibacterial soap with a delicate floral fragrance. Protects and refreshes.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('safeguard-floral-bloom-soap-125-gm_woom3w')],
      stock: 180, unit: 'gm',
      weightOptions: [{ weight: '125gm', price: 140, image: RIMG('safeguard-floral-bloom-soap-125-gm_woom3w') }],
      tags: ['safeguard', 'soap', 'floral bloom', 'antibacterial', 'bath soap'],
    },

    {
      name: 'Palmolive Hydrating Glow Soap',
      description: 'Palmolive Natural Hydrating Glow — enriched with natural aloe vera. Moisturising, refreshing and gentle on skin.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('palmolive-natural-hydrating-glow-soap-green-130-gm_elrnnu')],
      stock: 200, unit: 'gm',
      weightOptions: [{ weight: '130gm', price: 140, image: RIMG('palmolive-natural-hydrating-glow-soap-green-130-gm_elrnnu') }],
      tags: ['palmolive', 'natural', 'hydrating glow', 'soap', 'bath soap'],
    },

    {
      name: 'Palmolive Moisturising Glow Soap',
      description: 'Palmolive Natural Moisturising Glow — enriched with honey extracts for soft, glowing skin.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('palmolive-natural-soap-yellow-moisturizing-glow-130-gm_kfholt')],
      stock: 190, unit: 'gm',
      weightOptions: [{ weight: '130gm', price: 140, image: RIMG('palmolive-natural-soap-yellow-moisturizing-glow-130-gm_kfholt') }],
      tags: ['palmolive', 'natural', 'moisturising glow', 'soap', 'bath soap'],
    },

    {
      name: 'Palmolive Radiant Glow Soap',
      description: 'Palmolive Natural Radiant Glow — with rose hip oil for a beautifully radiant and smooth complexion.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('palmolive-radiant-glow-soap-pink-130-gm_zodscv')],
      stock: 190, unit: 'gm',
      weightOptions: [{ weight: '130gm', price: 140, image: RIMG('palmolive-radiant-glow-soap-pink-130-gm_zodscv') }],
      tags: ['palmolive', 'natural', 'radiant glow', 'soap', 'bath soap'],
    },

    {
      name: 'Palmolive Refreshing Glow Soap',
      description: 'Palmolive Natural Refreshing Glow — with orange extract for a refreshing, energising skin experience.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('palmolive-refreshing-glow-soap-orange-130-gm_fmbicr')],
      stock: 185, unit: 'gm',
      weightOptions: [{ weight: '130gm', price: 140, image: RIMG('palmolive-refreshing-glow-soap-orange-130-gm_fmbicr') }],
      tags: ['palmolive', 'natural', 'refreshing glow', 'soap', 'bath soap'],
    },

    {
      name: 'Palmolive Flawless Glow Soap',
      description: 'Palmolive Natural Flawless Glow — with activated charcoal for deep cleansing and flawlessly clear skin.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('palmolive-natural-soap-black-flawless-glow-130-gm_mujxet')],
      stock: 180, unit: 'gm',
      weightOptions: [{ weight: '130gm', price: 140, image: RIMG('palmolive-natural-soap-black-flawless-glow-130-gm_mujxet') }],
      tags: ['palmolive', 'natural', 'flawless glow', 'charcoal', 'soap', 'bath soap'],
    },

    {
      name: 'Capri Aloe Nurture Soap',
      description: 'Capri Aloe Nurture — moisturising beauty soap with aloe vera extracts. Rich lather, gentle on skin.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('capri-moisturising-aloe-nurture-soap-125-gm_alpi4v')],
      stock: 190, unit: 'gm',
      weightOptions: [{ weight: '125gm', price: 140, image: RIMG('capri-moisturising-aloe-nurture-soap-125-gm_alpi4v') }],
      tags: ['capri', 'soap', 'aloe nurture', 'moisturising', 'bath soap'],
    },

    {
      name: 'Capri Nourishing Peach Soap',
      description: 'Capri Nourishing Peach — moisturising beauty soap with a sweet peach fragrance. Soft, smooth skin.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('capri-moisturising-nourishing-peach-soap-125-gm_nljovf')],
      stock: 180, unit: 'gm',
      weightOptions: [{ weight: '125gm', price: 140, image: RIMG('capri-moisturising-nourishing-peach-soap-125-gm_nljovf') }],
      tags: ['capri', 'soap', 'nourishing peach', 'moisturising', 'bath soap'],
    },

    {
      name: 'Capri Velvet Orchid Soap',
      description: 'Capri Velvet Orchid — luxurious beauty soap with exotic orchid fragrance. Velvety smooth skin.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('capri-moisturizing-velvet-orchid-soap-125-gm_h1srhf')],
      stock: 175, unit: 'gm',
      weightOptions: [{ weight: '125gm', price: 140, image: RIMG('capri-moisturizing-velvet-orchid-soap-125-gm_h1srhf') }],
      tags: ['capri', 'soap', 'velvet orchid', 'moisturising', 'bath soap'],
    },

    {
      name: 'Capri Water Lily Soap',
      description: 'Capri Water Lily — refreshing beauty soap with water lily fragrance. Vitalises and hydrates skin.',
      category: C('Bath Soap'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('capri-refreshing-vitalizing-water-lily-soap-125-gm_mpy2xr')],
      stock: 175, unit: 'gm',
      weightOptions: [{ weight: '125gm', price: 140, image: RIMG('capri-refreshing-vitalizing-water-lily-soap-125-gm_mpy2xr') }],
      tags: ['capri', 'soap', 'water lily', 'moisturising', 'bath soap'],
    },

    {
      name: 'Dove Beauty Bar',
      description: 'Dove Original Beauty Bar — not just soap. With ¼ moisturising cream for visibly softer, smoother skin.',
      category: C('Bath Soap'), price: 220, discountPrice: 200, costPrice: 148,
      images: [RIMG('dove-original-beauty-bar-soap-106-gm-canada_mun66m')],
      stock: 150, isFeatured: true, unit: 'gm',
      weightOptions: [{ weight: '106gm', price: 200 }],
      tags: ['dove', 'beauty bar', 'moisturising', 'soap'],
    },

    {
      name: 'Tibet Deluxe Beauty Soap',
      description: 'Tibet Deluxe Beauty Soap — trusted Pakistani brand. Rich lather, long-lasting freshness for the whole family.',
      category: C('Bath Soap'), price: 130, discountPrice: 115, costPrice: 82,
      images: [RIMG('tibet-deluxe-beauty-soap-family-size-125-gm_kdebnw')],
      stock: 200, unit: 'gm',
      weightOptions: [{ weight: '125gm', price: 115 }],
      tags: ['tibet', 'deluxe', 'beauty soap', 'bath soap'],
    },

    // ── Coffee & Tea (new additions) ─────────────────────────────────────────
    {
      name: 'Tapal Danedar Tea',
      description: 'Pakistan\'s No.1 tea brand. Tapal Danedar — bold, strong flavour for the perfect doodh pati chai.',
      category: C('Coffee & Tea'), price: 1300, discountPrice: 1200, costPrice: 930,
      images: [RIMG('tapal-danedar-jar-440-gm_nxzdyk'), RIMG('tapal-danedar-pouch-350-gm_idj4k7'), RIMG('tapal-danedar-box-170-gm_obxpux'), RIMG('tapal-danedar-box-85-gm_dwitej'), RIMG('tapal-danedar-box-50-gm_abwvaa'), RIMG('tapal-danedar-box-27-gm_jhrpmm'), RIMG('tapal-danedar-box-14-gm_cxya3l')],
      stock: 100, isFeatured: true, unit: 'g',
      weightOptions: [{ weight: '85g', price: 340, image: RIMG('tapal-danedar-box-85-gm_dwitej') }, { weight: '170g', price: 650, image: RIMG('tapal-danedar-box-170-gm_obxpux') }, { weight: '350g', price: 1200, image: RIMG('tapal-danedar-pouch-350-gm_idj4k7') }, { weight: '430g', price: 1400, image: RIMG('tapal-danedar-value-pack-430-gm_lrx9u6') }, { weight: '900g', price: 2700, image: RIMG('tapal-danedar-economy-pack-900-gm_nnjbfw') }],
      tags: ['tapal', 'danedar', 'tea'],
    },

    {
      name: 'Tapal Danedar Tea Bags',
      description: 'Tapal Danedar tea bags — rich, bold flavour in every cup. Convenient and easy to brew.',
      category: C('Coffee & Tea'), price: 540, discountPrice: 500, costPrice: 380,
      images: [RIMG('tapal-danedar-tea-bag-envelope-100-tea-bags_fdcvbz'), RIMG('tapal-danedar-tea-bag-envelope-50-tea-bags_dfi5to'), RIMG('tapal-danedar-25-tea-bags_svde0h')],
      stock: 90, unit: 'pcs',
      weightOptions: [{ weight: '25 bags', price: 180, image: RIMG('tapal-danedar-25-tea-bags_svde0h') }, { weight: '50 bags', price: 330, image: RIMG('tapal-danedar-tea-bag-envelope-50-tea-bags_dfi5to') }, { weight: '100 bags', price: 610, image: RIMG('tapal-danedar-tea-bag-envelope-100-tea-bags_fdcvbz') }],
      tags: ['tapal', 'danedar', 'tea bags'],
    },

    {
      name: 'Tapal Tezdum Tea',
      description: 'Tapal Tezdum — extra strong, bold blend. For those who like their chai super strong.',
      category: C('Coffee & Tea'), price: 1300, discountPrice: 1200, costPrice: 930,
      images: [RIMG('tapal-tezdum-pouch-430-gm_vxzgnw'), RIMG('tapal-tezdum-box-170-gm_gnzgpo'), RIMG('tapal-tezdum-box-85-gm_cjheln'), RIMG('tapal-tezdum-pouch-900-gm_hd1jv8')],
      stock: 85, unit: 'g',
      weightOptions: [{ weight: '85g', price: 340, image: RIMG('tapal-tezdum-box-85-gm_cjheln') }, { weight: '170g', price: 650, image: RIMG('tapal-tezdum-box-170-gm_gnzgpo') }, { weight: '430g', price: 1300, image: RIMG('tapal-tezdum-pouch-430-gm_vxzgnw') }, { weight: '900g', price: 2650, image: RIMG('tapal-tezdum-pouch-900-gm_hd1jv8') }],
      tags: ['tapal', 'tezdum', 'strong tea'],
    },

    {
      name: 'Tapal Family Mixture Tea',
      description: 'Tapal Family Mixture — a unique blend of leaf and dust teas for the perfect family cup.',
      category: C('Coffee & Tea'), price: 1200, discountPrice: 1100, costPrice: 850,
      images: [RIMG('tapal-family-mixture-430-gm_v1bf9t'), RIMG('tapal-family-mixture-170-gm_rtsumn'), RIMG('tapal-family-mixture-tea-85-gm_zhwwil'), RIMG('tapal-family-mixture-value-pack-900-gm_m3ldq2')],
      stock: 80, unit: 'g',
      weightOptions: [{ weight: '85g', price: 320, image: RIMG('tapal-family-mixture-tea-85-gm_zhwwil') }, { weight: '170g', price: 620, image: RIMG('tapal-family-mixture-170-gm_rtsumn') }, { weight: '430g', price: 1200, image: RIMG('tapal-family-mixture-430-gm_v1bf9t') }, { weight: '900g', price: 2500, image: RIMG('tapal-family-mixture-value-pack-900-gm_m3ldq2') }],
      tags: ['tapal', 'family mixture', 'tea'],
    },

    {
      name: 'Tapal Danedar Elaichi Tea',
      description: 'Tapal Danedar with the warm aroma of real elaichi. A perfectly spiced chai for every mood.',
      category: C('Coffee & Tea'), price: 720, discountPrice: 670, costPrice: 510,
      images: [RIMG('tapal-danedar-elaichi-flavour-tea-170-gm_gkyflq')],
      stock: 75, unit: 'g',
      weightOptions: [{ weight: '170g', price: 670 }],
      tags: ['tapal', 'elaichi', 'cardamom', 'tea'],
    },

    {
      name: 'Tapal Green Tea Lemon',
      description: 'Tapal Green Tea Lemon — refreshing green tea with a natural lemon flavour.',
      category: C('Coffee & Tea'), price: 320, discountPrice: 290, costPrice: 210,
      images: [RIMG('tapal-green-tea-lemon-flavor-30-teabags_bwpuz3')],
      stock: 70, unit: 'pcs',
      weightOptions: [{ weight: '30 bags', price: 290, image: RIMG('tapal-green-tea-lemon-flavor-30-teabags_bwpuz3') }],
      tags: ['tapal', 'green tea', 'lemon', 'herbal'],
    },

    {
      name: 'Tapal Green Tea Elaichi',
      description: 'Tapal Green Tea Elaichi — aromatic green tea with cardamom flavour.',
      category: C('Coffee & Tea'), price: 320, discountPrice: 290, costPrice: 210,
      images: [RIMG('tapal-elaichi-green-tea-30-teabags_cw8e5q')],
      stock: 70, unit: 'pcs',
      weightOptions: [{ weight: '30 bags', price: 290, image: RIMG('tapal-elaichi-green-tea-30-teabags_cw8e5q') }],
      tags: ['tapal', 'green tea', 'elaichi', 'cardamom', 'herbal'],
    },

    {
      name: 'Tapal Green Tea Jasmine',
      description: 'Tapal Green Tea Jasmine — delicate green tea with a soothing jasmine flavour.',
      category: C('Coffee & Tea'), price: 320, discountPrice: 290, costPrice: 210,
      images: [RIMG('tapal-jasmine-green-tea-bag-30-tea-bags_dtit1m')],
      stock: 70, unit: 'pcs',
      weightOptions: [{ weight: '30 bags', price: 290, image: RIMG('tapal-jasmine-green-tea-bag-30-tea-bags_dtit1m') }],
      tags: ['tapal', 'green tea', 'jasmine', 'herbal'],
    },

    {
      name: 'Tapal Green Tea Strawberry',
      description: 'Tapal Green Tea Strawberry — refreshing green tea with a sweet strawberry flavour.',
      category: C('Coffee & Tea'), price: 320, discountPrice: 290, costPrice: 210,
      images: [RIMG('tapal-strawberry-green-tea-bag-30-teabags_jhcynm')],
      stock: 70, unit: 'pcs',
      weightOptions: [{ weight: '30 bags', price: 290, image: RIMG('tapal-strawberry-green-tea-bag-30-teabags_jhcynm') }],
      tags: ['tapal', 'green tea', 'strawberry', 'herbal'],
    },

    {
      name: 'Tapal Green Tea Tropical Peach',
      description: 'Tapal Green Tea Tropical Peach — bright green tea with a tropical peach flavour.',
      category: C('Coffee & Tea'), price: 320, discountPrice: 290, costPrice: 210,
      images: [RIMG('tapal-tropical-peach-green-tea-bag-30-teabags_oluddg')],
      stock: 70, isFeatured: true, unit: 'pcs',
      weightOptions: [{ weight: '30 bags', price: 290, image: RIMG('tapal-tropical-peach-green-tea-bag-30-teabags_oluddg') }],
      tags: ['tapal', 'green tea', 'tropical peach', 'herbal'],
    },

    {
      name: 'Tapal Green Tea Selection Pack',
      description: 'Tapal Green Tea Selection Pack — 32 bags with a mix of premium green tea flavours.',
      category: C('Coffee & Tea'), price: 650, discountPrice: 590, costPrice: 430,
      images: [RIMG('tapal-green-tea-selection-pack-32-flavours_svfjl1')],
      stock: 70, unit: 'pcs',
      weightOptions: [{ weight: '32 bags', price: 590, image: RIMG('tapal-green-tea-selection-pack-32-flavours_svfjl1') }],
      tags: ['tapal', 'green tea', 'selection', 'herbal'],
    },

    {
      name: 'Brooke Bond Supreme Tea',
      description: 'Brooke Bond Supreme — unique blend of fine Kenyan and Pakistani teas. Rich, full-bodied flavour.',
      category: C('Coffee & Tea'), price: 1350, discountPrice: 1250, costPrice: 970,
      images: [RIMG('brooke-bond-supreme-tea-box-160-gm_y4dc2h'), RIMG('brooke-bond-supreme-tea-pouch-430-gm_oewecz'), RIMG('brooke-bond-supreme-tea-pouch-900-gm_we951z')],
      stock: 80, isFeatured: true, unit: 'g',
      weightOptions: [{ weight: '160g', price: 640, image: RIMG('brooke-bond-supreme-tea-box-160-gm_y4dc2h') }, { weight: '430g', price: 1350, image: RIMG('brooke-bond-supreme-tea-pouch-430-gm_oewecz') }, { weight: '900g', price: 2750, image: RIMG('brooke-bond-supreme-tea-pouch-900-gm_we951z') }],
      tags: ['brooke bond', 'supreme', 'tea'],
    },

    {
      name: 'Lipton Yellow Label Tea',
      description: "The World's No.1 Tea Brand. New & Stronger Blend. Perfect for Pakistani doodh pati chai.",
      category: C('Coffee & Tea'), price: 1450, discountPrice: 1350, costPrice: 1050,
      images: [RIMG('lipton-yellow-label-tea-pouch-430-gm_k9aqia'), RIMG('lipton-yellow-label-tea-pouch-900-gm_n9qcrm'), RIMG('lipton-yellow-label-black-tea-50-bags_llaxk0'), RIMG('lipton-black-tea-box-70-gm_ifhatf'), RIMG('lipton-black-tea-yellow-label-25-teabags_jhlimc')],
      stock: 80, isFeatured: true, unit: 'g',
      weightOptions: [{ weight: '70g', price: 330, image: RIMG('lipton-black-tea-box-70-gm_ifhatf') }, { weight: '430g', price: 1350, image: RIMG('lipton-yellow-label-tea-pouch-430-gm_k9aqia') }, { weight: '900g', price: 2750, image: RIMG('lipton-yellow-label-tea-pouch-900-gm_n9qcrm') }],
      tags: ['lipton', 'yellow label', 'tea'],
    },

    {
      name: 'Lipton Danedar Strong Tea',
      description: 'Lipton Danedar — strong, extra-thick granules for a rich, bold Pakistani chai experience.',
      category: C('Coffee & Tea'), price: 780, discountPrice: 720, costPrice: 550,
      images: [RIMG('lipton-danedar-strong-tea-70-gm_rqyk8l'), RIMG('lipton-danedar-strong-tea-jar-475-gm_rvszhd')],
      stock: 75, unit: 'g',
      weightOptions: [{ weight: '70g', price: 330, image: RIMG('lipton-danedar-strong-tea-70-gm_rqyk8l') }, { weight: '475g', price: 1580, image: RIMG('lipton-danedar-strong-tea-jar-475-gm_rvszhd') }],
      tags: ['lipton', 'danedar', 'strong', 'tea'],
    },

    {
      name: 'Lipton Green Tea',
      description: 'Lipton Green Tea — luscious mixed berries. Light, refreshing and antioxidant-rich.',
      category: C('Coffee & Tea'), price: 480, discountPrice: 440, costPrice: 330,
      images: [RIMG('lipton-green-tea-luscious-mixed-berries-tea-bag-25-pcs_pzf3fq')],
      stock: 70, unit: 'pcs',
      weightOptions: [{ weight: '25 bags', price: 440 }],
      tags: ['lipton', 'green tea', 'berries', 'herbal'],
    },

    {
      name: 'Vital Premium Black Tea',
      description: 'Vital Premium Black Tea bags. Rich, full-bodied flavour for a perfect cup every time.',
      category: C('Coffee & Tea'), price: 580, discountPrice: 540, costPrice: 410,
      images: [RIMG('vital-premium-black-tea-50-bags_dsn0ms'), RIMG('vital-tea-box-170-gm_ttvqln'), RIMG('vital-tea-box-85-gm_c1dwgb'), RIMG('vital-tea-box-28-gm_gefezl'), RIMG('vital-tea-pouch-350-gm_l6m1nl'), RIMG('vital-tea-value-pack-430-gm_gwzlrk'), RIMG('vital-tea-economy-pack-900-gm_q4bpzz')],
      stock: 85, unit: 'g',
      weightOptions: [{ weight: '85g', price: 320, image: RIMG('vital-tea-box-85-gm_c1dwgb') }, { weight: '170g', price: 620, image: RIMG('vital-tea-box-170-gm_ttvqln') }, { weight: '430g', price: 1200, image: RIMG('vital-tea-value-pack-430-gm_gwzlrk') }, { weight: '900g', price: 2450, image: RIMG('vital-tea-economy-pack-900-gm_q4bpzz') }],
      tags: ['vital', 'premium', 'black tea', 'tea bags'],
    },

    {
      name: 'Nescafe Classic Coffee',
      description: 'Nescafe Classic — the rich, bold flavour of pure roasted coffee. Simply add hot water.',
      category: C('Coffee & Tea'), price: 950, discountPrice: 880, costPrice: 680,
      images: [RIMG('nescafe-classic-coffee-100-gm_uiah8f')],
      stock: 80, isFeatured: true, unit: 'g',
      weightOptions: [{ weight: '100g', price: 880 }],
      tags: ['nescafe', 'classic', 'coffee', 'instant'],
    },

    {
      name: 'Nescafe Gold Blend Coffee',
      description: 'Nescafe Gold Blend — a smooth, balanced coffee. Sophisticated taste for discerning coffee lovers.',
      category: C('Coffee & Tea'), price: 1600, discountPrice: 1500, costPrice: 1150,
      images: [RIMG('NescafeGoldBlendCoffee100gm_jk4o3u')],
      stock: 60, isFeatured: true, unit: 'g',
      weightOptions: [{ weight: '100g', price: 1500 }],
      tags: ['nescafe', 'gold blend', 'coffee'],
    },

    {
      name: 'Nescafe Chilled Latte',
      description: 'Nescafe Chilled Latte — smooth, creamy ready-to-drink coffee. Perfect on the go.',
      category: C('Coffee & Tea'), price: 180, discountPrice: 165, costPrice: 120,
      images: [RIMG('nescafe-chilled-latte-220-ml_gkifsu')],
      stock: 120, unit: 'ml',
      weightOptions: [{ weight: '220ml', price: 165, image: RIMG('nescafe-chilled-latte-220-ml_gkifsu') }],
      tags: ['nescafe', 'chilled', 'ready to drink', 'coffee', 'latte'],
    },

    {
      name: 'Nescafe Chilled Mocha',
      description: 'Nescafe Chilled Mocha — rich chocolate coffee blend. Ready to drink, chilled and refreshing.',
      category: C('Coffee & Tea'), price: 180, discountPrice: 165, costPrice: 120,
      images: [RIMG('nescafe-chilled-mocha-220-ml_lzzqgu')],
      stock: 120, unit: 'ml',
      weightOptions: [{ weight: '220ml', price: 165, image: RIMG('nescafe-chilled-mocha-220-ml_lzzqgu') }],
      tags: ['nescafe', 'chilled', 'ready to drink', 'coffee', 'mocha'],
    },

    {
      name: 'Nescafe Chilled Hazelnut',
      description: 'Nescafe Chilled Hazelnut — nutty, aromatic hazelnut coffee. Smooth and indulgent.',
      category: C('Coffee & Tea'), price: 180, discountPrice: 165, costPrice: 120,
      images: [RIMG('nescafe-chilled-hazelnut-220-ml_wbb7ge')],
      stock: 120, unit: 'ml',
      weightOptions: [{ weight: '220ml', price: 165, image: RIMG('nescafe-chilled-hazelnut-220-ml_wbb7ge') }],
      tags: ['nescafe', 'chilled', 'ready to drink', 'coffee', 'hazelnut'],
    },

    {
      name: 'Nescafe Chilled White Choc Mocha',
      description: 'Nescafe Chilled White Chocolate Mocha — sweet, creamy and indulgent ready-to-drink coffee.',
      category: C('Coffee & Tea'), price: 180, discountPrice: 165, costPrice: 120,
      images: [RIMG('nescafe-white-chocolate-mocha-220-ml_e50n40')],
      stock: 120, unit: 'ml',
      weightOptions: [{ weight: '220ml', price: 165, image: RIMG('nescafe-white-chocolate-mocha-220-ml_e50n40') }],
      tags: ['nescafe', 'chilled', 'ready to drink', 'coffee', 'white chocolate mocha'],
    },

    {
      name: 'Nestle Everyday Tea Whitener',
      description: 'Nestle Everyday tea whitener powder. Smooth, creamy taste for the perfect doodh pati chai.',
      category: C('Coffee & Tea'), price: 60, discountPrice: 55, costPrice: 40,
      images: [RIMG('nestle-everyday-tea-powder-15-gm_qdexfo')],
      stock: 200, unit: 'g',
      weightOptions: [{ weight: '15g sachet', price: 55 }],
      tags: ['nestle', 'everyday', 'tea whitener', 'milk powder'],
    },

    // ── Sharbat ──────────────────────────────────────────────────────────────
    {
      name: 'Hamdard Rooh Afza',
      description: 'Hamdard Rooh Afza — the iconic rose sharbat. Refreshing, cooling and a Pakistani Ramadan tradition.',
      category: C('Sharbat'), price: 780, discountPrice: 720, costPrice: 550,
      images: [RIMG('hamdard-rooh-afza-800-ml_borbms')],
      stock: 150, isFeatured: true, unit: 'ml',
      weightOptions: [{ weight: '800ml', price: 720 }],
      tags: ['rooh afza', 'hamdard', 'sharbat', 'rose'],
    },

    {
      name: 'Mitchells Lemon Squash',
      description: 'Mitchells Lemon Squash — tangy, refreshing lemon concentrate. Just add water or soda.',
      category: C('Sharbat'), price: 380, discountPrice: 350, costPrice: 265,
      images: [RIMG('mitchells-lemon-squash-800-ml_rl62lt')],
      stock: 120, unit: 'ml',
      weightOptions: [{ weight: '800ml', price: 350 }],
      tags: ['mitchells', 'lemon squash', 'sharbat', 'squash'],
    },

    {
      name: 'Mitchells Orange Squash',
      description: 'Mitchells Orange Squash — fruity, zesty orange concentrate. Dilute and enjoy cold.',
      category: C('Sharbat'), price: 380, discountPrice: 350, costPrice: 265,
      images: [RIMG('mitchells-orange-squash-800-ml_xjww3r')],
      stock: 120, unit: 'ml',
      weightOptions: [{ weight: '800ml', price: 350 }],
      tags: ['mitchells', 'orange squash', 'sharbat', 'squash'],
    },

    {
      name: 'Qarshi Jam-e-Shirin',
      description: 'Qarshi Jam-e-Shirin — the classic herbal sharbat. A blend of natural herbs for a refreshing, healthy drink.',
      category: C('Sharbat'), price: 1350, discountPrice: 1200, costPrice: 920,
      images: [RIMG('qarshi-jam-e-shirin-800-ml_nvsis1')],
      stock: 130, isFeatured: true, unit: 'ml',
      weightOptions: [{ weight: '800ml', price: 760, image: RIMG('qarshi-jam-e-shirin-800-ml_nvsis1') }, { weight: '1500ml', price: 1350, image: RIMG('qarshi-jam-e-shirin-1500-ml_h4e12f') }],
      tags: ['qarshi', 'jam-e-shirin', 'herbal', 'sharbat'],
    },

    {
      name: 'Qarshi Jam-e-Shirin Sugar Free',
      description: 'Qarshi Jam-e-Shirin Sugar Free — the classic herbal sharbat without sugar. Natural herbs, no added sugar.',
      category: C('Sharbat'), price: 820, discountPrice: 760, costPrice: 580,
      images: [RIMG('qarshi-jam-e-shirin-sugar-free-800-ml_cjiwyy')],
      stock: 100, unit: 'ml',
      weightOptions: [{ weight: '800ml', price: 760, image: RIMG('qarshi-jam-e-shirin-sugar-free-800-ml_cjiwyy') }],
      tags: ['qarshi', 'jam-e-shirin', 'sugar free', 'herbal', 'sharbat'],
    },

    {
      name: 'Qarshi Sarbat Bazooreen',
      description: 'Qarshi Sarbat Bazooreen — traditional herbal sharbat with cooling properties. Perfect for summer.',
      category: C('Sharbat'), price: 750, discountPrice: 690, costPrice: 520,
      images: [RIMG('qarshi-sarbat-bazooreen-800-ml_ff5wrg')],
      stock: 100, unit: 'ml',
      weightOptions: [{ weight: '800ml', price: 690 }],
      tags: ['qarshi', 'bazooreen', 'herbal', 'sharbat'],
    },

    {
      name: 'Qarshi Sharbat Ilacheen',
      description: 'Qarshi Sharbat Ilacheen — aromatic cardamom sharbat. Naturally refreshing and fragrant.',
      category: C('Sharbat'), price: 750, discountPrice: 690, costPrice: 520,
      images: [RIMG('qarshi-sharbat-ilacheen-800-ml_qet1lz')],
      stock: 100, unit: 'ml',
      weightOptions: [{ weight: '800ml', price: 690 }],
      tags: ['qarshi', 'ilacheen', 'cardamom', 'sharbat'],
    },

    {
      name: 'Qarshi Sharbat Sandaleen',
      description: 'Qarshi Sharbat Sandaleen — cooling sandalwood sharbat. A refreshing traditional drink.',
      category: C('Sharbat'), price: 750, discountPrice: 690, costPrice: 520,
      images: [RIMG('qarshi-sharbat-sandaleen-800-ml_spoxfg')],
      stock: 100, unit: 'ml',
      weightOptions: [{ weight: '800ml', price: 690 }],
      tags: ['qarshi', 'sandaleen', 'sandalwood', 'sharbat'],
    },

    // ── Flavored Milk (new) ───────────────────────────────────────────────────
    {
      name: 'Nestle Milo Active Go',
      description: 'Nestle Milo Active Go — energizing chocolate malt drink for active kids. Vitamins, minerals and energy.',
      category: C('Flavored Milk'), price: 620, discountPrice: 580, costPrice: 440,
      images: [RIMG('nestle-milo-active-go-sachet-15-gm_gtmvnr')],
      stock: 100, isFeatured: true, unit: 'g',
      weightOptions: [
        { weight: '15g sachet', price: 65, image: RIMG('nestle-milo-active-go-sachet-15-gm_gtmvnr') },
        { weight: '150g', price: 390, image: RIMG('nestle-milo-active-go-all-in-1-150-gm_wiggst') },
        { weight: '500g', price: 620, image: RIMG('nestle-milo-active-go-pouch-500-gm_kqfwle') },
      ],
      tags: ['milo', 'nestle', 'active go', 'chocolate malt', 'energy'],
    },

    {
      name: 'Olpers Chaunsa Mango',
      description: 'Olpers Chaunsa Mango flavoured milk — real chaunsa mango taste in a chilled milk drink. Perfect for kids and adults.',
      category: C('Flavored Milk'), price: 90, discountPrice: 82, costPrice: 60,
      images: [RIMG('olpers-chaunsa-mango-flavoured-milk-180-ml_rw1p0w')],
      stock: 180, isFeatured: true, unit: 'ml',
      weightOptions: [{ weight: '180ml', price: 82, image: RIMG('olpers-chaunsa-mango-flavoured-milk-180-ml_rw1p0w') }],
      tags: ['olpers', 'flavored milk', 'mango', 'chaunsa'],
    },

    {
      name: 'Olpers Strawberry',
      description: 'Olpers Strawberry flavoured milk — sweet, fruity strawberry taste in a chilled milk drink.',
      category: C('Flavored Milk'), price: 90, discountPrice: 82, costPrice: 60,
      images: [RIMG('olpers-strawberry-flavoured-milk-180-ml_xw4uee')],
      stock: 180, unit: 'ml',
      weightOptions: [{ weight: '180ml', price: 82, image: RIMG('olpers-strawberry-flavoured-milk-180-ml_xw4uee') }],
      tags: ['olpers', 'flavored milk', 'strawberry'],
    },

    {
      name: 'Olpers Badam Zafran',
      description: 'Olpers Badam Zafran flavoured milk — rich almond and saffron taste in a chilled milk drink.',
      category: C('Flavored Milk'), price: 90, discountPrice: 82, costPrice: 60,
      images: [RIMG('olpers-badam-zafran-flavored-milk-180-ml_fvh1f9')],
      stock: 180, unit: 'ml',
      weightOptions: [{ weight: '180ml', price: 82, image: RIMG('olpers-badam-zafran-flavored-milk-180-ml_fvh1f9') }],
      tags: ['olpers', 'flavored milk', 'badam', 'zafran'],
    },

    // ── Hair Care ─────────────────────────────────────────────────────────────
    {
      name: 'Pantene Smooth & Strong Shampoo',
      description: 'Pantene Pro-V Smooth & Strong — salon-quality hair care. Up to 100% stronger hair with pro-vitamin formula.',
      category: C('Hair Care'), price: 480, discountPrice: 440, costPrice: 330,
      images: [RIMG('pantene-pro-v-smooth-and-strong-185-ml_lql98b')],
      stock: 150, isFeatured: true, unit: 'ml',
      weightOptions: [{ weight: '185ml', price: 440, image: RIMG('pantene-pro-v-smooth-and-strong-185-ml_lql98b') }],
      tags: ['pantene', 'shampoo', 'smooth strong', 'hair care', 'pro-v'],
    },

    {
      name: 'Pantene Anti-Hairfall Shampoo',
      description: 'Pantene Pro-V Anti-Hairfall — reduces hair fall with pro-vitamin formula. Stronger, fuller-looking hair.',
      category: C('Hair Care'), price: 480, discountPrice: 440, costPrice: 330,
      images: [RIMG('pantene-pro-vitamin-anti-hairfall-185-ml_g5k5x7')],
      stock: 145, unit: 'ml',
      weightOptions: [{ weight: '185ml', price: 440, image: RIMG('pantene-pro-vitamin-anti-hairfall-185-ml_g5k5x7') }],
      tags: ['pantene', 'shampoo', 'anti-hairfall', 'hair care', 'pro-v'],
    },

    {
      name: 'Pantene Deep Black Shampoo',
      description: 'Pantene Pro-V Deep Black — intensifies black hair colour with pro-vitamin formula. Shiny, vibrant black hair.',
      category: C('Hair Care'), price: 480, discountPrice: 440, costPrice: 330,
      images: [RIMG('pantene-pro-vitamin-deep-black-shampoo-185-ml_qcm5if')],
      stock: 140, unit: 'ml',
      weightOptions: [{ weight: '185ml', price: 440, image: RIMG('pantene-pro-vitamin-deep-black-shampoo-185-ml_qcm5if') }],
      tags: ['pantene', 'shampoo', 'deep black', 'hair care', 'pro-v'],
    },

    {
      name: 'Head & Shoulders Classic Clean Shampoo',
      description: "Head & Shoulders Classic Clean — the world's No.1 anti-dandruff shampoo. Clean, healthy scalp with every wash.",
      category: C('Hair Care'), price: 480, discountPrice: 440, costPrice: 330,
      images: [RIMG('head-shoulders-classic-clean-185-ml_hnoxyu')],
      stock: 160, isFeatured: true, unit: 'ml',
      weightOptions: [{ weight: '185ml', price: 440, image: RIMG('head-shoulders-classic-clean-185-ml_hnoxyu') }],
      tags: ['head and shoulders', 'shampoo', 'classic clean', 'anti-dandruff', 'hair care'],
    },

    {
      name: 'Head & Shoulders Smooth & Silky Shampoo',
      description: "Head & Shoulders Smooth & Silky — anti-dandruff shampoo for smooth, silky hair. No flakes, just beautiful hair.",
      category: C('Hair Care'), price: 480, discountPrice: 440, costPrice: 330,
      images: [RIMG('head-shoulders-smooth-silky-185-ml_qci6yu')],
      stock: 155, unit: 'ml',
      weightOptions: [{ weight: '185ml', price: 440, image: RIMG('head-shoulders-smooth-silky-185-ml_qci6yu') }],
      tags: ['head and shoulders', 'shampoo', 'smooth silky', 'anti-dandruff', 'hair care'],
    },

    {
      name: 'Head & Shoulders Silky Black Shampoo',
      description: "Head & Shoulders Silky Black — anti-dandruff shampoo that enhances black hair. Deep black colour, dandruff-free.",
      category: C('Hair Care'), price: 480, discountPrice: 440, costPrice: 330,
      images: [RIMG('head-shoulders-silky-black-185-ml_xe1vem')],
      stock: 150, unit: 'ml',
      weightOptions: [{ weight: '185ml', price: 440, image: RIMG('head-shoulders-silky-black-185-ml_xe1vem') }],
      tags: ['head and shoulders', 'shampoo', 'silky black', 'anti-dandruff', 'hair care'],
    },

    {
      name: 'Head & Shoulders Dry Scalp Care Shampoo',
      description: "Head & Shoulders Dry Scalp Care — specially formulated for dry scalps. Relieves dryness and itchiness.",
      category: C('Hair Care'), price: 480, discountPrice: 440, costPrice: 330,
      images: [RIMG('head-shoulders-dry-scalp-care-185-ml_kgz9pl')],
      stock: 145, unit: 'ml',
      weightOptions: [{ weight: '185ml', price: 440, image: RIMG('head-shoulders-dry-scalp-care-185-ml_kgz9pl') }],
      tags: ['head and shoulders', 'shampoo', 'dry scalp', 'anti-dandruff', 'hair care'],
    },

    {
      name: 'Head & Shoulders Neem Shampoo',
      description: "Head & Shoulders Neem — anti-dandruff shampoo with natural neem extract. Scalp protection with a natural touch.",
      category: C('Hair Care'), price: 480, discountPrice: 440, costPrice: 330,
      images: [RIMG('head-shoulders-neem-anti-dandruff-shampoo-185-ml_t4pxby')],
      stock: 145, unit: 'ml',
      weightOptions: [{ weight: '185ml', price: 440, image: RIMG('head-shoulders-neem-anti-dandruff-shampoo-185-ml_t4pxby') }],
      tags: ['head and shoulders', 'shampoo', 'neem', 'anti-dandruff', 'hair care'],
    },

    {
      name: 'Head & Shoulders Silky Black 2-in-1',
      description: "Head & Shoulders Silky Black 2-in-1 — anti-dandruff shampoo and conditioner in one. Black hair, dandruff-free.",
      category: C('Hair Care'), price: 500, discountPrice: 460, costPrice: 345,
      images: [RIMG('head-shoulders-silky-black-2-in-1-anti-dandruff-shampooconditioner-190-ml_yfdnur')],
      stock: 130, unit: 'ml',
      weightOptions: [{ weight: '190ml', price: 460, image: RIMG('head-shoulders-silky-black-2-in-1-anti-dandruff-shampooconditioner-190-ml_yfdnur') }],
      tags: ['head and shoulders', 'shampoo', '2-in-1', 'silky black', 'anti-dandruff', 'hair care'],
    },

    {
      name: 'Head & Shoulders Smooth & Silky 2-in-1',
      description: "Head & Shoulders Smooth & Silky 2-in-1 — anti-dandruff shampoo and conditioner in one. Smooth, beautiful hair.",
      category: C('Hair Care'), price: 500, discountPrice: 460, costPrice: 345,
      images: [RIMG('Head_Shoulders2-In-1SmoothSilkyAnti-DandruffShampoo_Conditioner190ml_cxpxql')],
      stock: 130, unit: 'ml',
      weightOptions: [{ weight: '190ml', price: 460, image: RIMG('Head_Shoulders2-In-1SmoothSilkyAnti-DandruffShampoo_Conditioner190ml_cxpxql') }],
      tags: ['head and shoulders', 'shampoo', '2-in-1', 'smooth silky', 'anti-dandruff', 'hair care'],
    },

    {
      name: 'Sunsilk Black Shine Shampoo',
      description: 'Sunsilk Black Shine — expert shampoo for intensely black, glossy hair. With black seed oil extract.',
      category: C('Hair Care'), price: 460, discountPrice: 425, costPrice: 315,
      images: [RIMG('sunsilk-black-shine-shampoo-185-ml_recull')],
      stock: 150, unit: 'ml',
      weightOptions: [{ weight: '185ml', price: 425, image: RIMG('sunsilk-black-shine-shampoo-185-ml_recull') }],
      tags: ['sunsilk', 'shampoo', 'black shine', 'hair care'],
    },

    {
      name: 'Sunsilk Hair Fall Shampoo',
      description: 'Sunsilk Hair Fall — controls hair fall from root to tip. With arginine and biotin complex.',
      category: C('Hair Care'), price: 460, discountPrice: 425, costPrice: 315,
      images: [RIMG('sunsilk-hair-fall-shampoo-185-ml_cn6rmt')],
      stock: 145, unit: 'ml',
      weightOptions: [{ weight: '185ml', price: 425, image: RIMG('sunsilk-hair-fall-shampoo-185-ml_cn6rmt') }],
      tags: ['sunsilk', 'shampoo', 'hair fall', 'hair care'],
    },

    {
      name: 'Sunsilk Black Shine Conditioner',
      description: 'Sunsilk Black Shine Conditioner — leaves hair intensely black and shiny. With black seed oil extract.',
      category: C('Hair Care'), price: 460, discountPrice: 420, costPrice: 310,
      images: [RIMG('sunsilk-black-shine-conditioner-180-ml_tvgfhr')],
      stock: 130, unit: 'ml',
      weightOptions: [{ weight: '180ml', price: 420, image: RIMG('sunsilk-black-shine-conditioner-180-ml_tvgfhr') }],
      tags: ['sunsilk', 'conditioner', 'black shine', 'hair care'],
    },

    {
      name: 'Sunsilk Thick & Long Conditioner',
      description: 'Sunsilk Thick & Long Conditioner — nourishes for thicker, longer-looking hair. With biotin and castor oil.',
      category: C('Hair Care'), price: 460, discountPrice: 420, costPrice: 310,
      images: [RIMG('sunsilk-thick-and-long-conditioner-180-ml_wbajdc')],
      stock: 125, unit: 'ml',
      weightOptions: [{ weight: '180ml', price: 420, image: RIMG('sunsilk-thick-and-long-conditioner-180-ml_wbajdc') }],
      tags: ['sunsilk', 'conditioner', 'thick long', 'hair care'],
    },

    {
      name: 'Dove Intense Repair Shampoo',
      description: 'Dove Intense Repair — nourishing shampoo that restores damaged hair. Micro-moisture technology for strong, healthy hair.',
      category: C('Hair Care'), price: 520, discountPrice: 480, costPrice: 360,
      images: [RIMG('dove-intense-repair-shampoo-175-ml_mxseuv')],
      stock: 130, isFeatured: true, unit: 'ml',
      weightOptions: [{ weight: '175ml', price: 480, image: RIMG('dove-intense-repair-shampoo-175-ml_mxseuv') }],
      tags: ['dove', 'shampoo', 'intense repair', 'hair care'],
    },

    {
      name: 'Dove Hair Fall Rescue Shampoo',
      description: 'Dove Hair Fall Rescue — reduces hair fall with regular use. Strengthens each strand from root to tip.',
      category: C('Hair Care'), price: 520, discountPrice: 480, costPrice: 360,
      images: [RIMG('dove-hair-fall-rescue-shampoo-175-ml_rg2lwm')],
      stock: 125, unit: 'ml',
      weightOptions: [{ weight: '175ml', price: 480, image: RIMG('dove-hair-fall-rescue-shampoo-175-ml_rg2lwm') }],
      tags: ['dove', 'shampoo', 'hair fall rescue', 'hair care'],
    },

    {
      name: 'Dove Intense Repair Conditioner',
      description: 'Dove Intense Repair Conditioner — deeply nourishes damaged hair. Leaves hair smooth, manageable and shiny.',
      category: C('Hair Care'), price: 520, discountPrice: 490, costPrice: 368,
      images: [RIMG('dove-intense-repair-conditioner-180-ml_muakgq')],
      stock: 120, unit: 'ml',
      weightOptions: [{ weight: '180ml', price: 490, image: RIMG('dove-intense-repair-conditioner-180-ml_muakgq') }],
      tags: ['dove', 'conditioner', 'intense repair', 'hair care'],
    },

    {
      name: 'Palmolive Healthy & Smooth Shampoo',
      description: 'Palmolive Healthy & Smooth — naturally inspired shampoo with bio-keratin. Strong, smooth and shiny hair.',
      category: C('Hair Care'), price: 440, discountPrice: 400, costPrice: 300,
      images: [RIMG('palmolive-healthy-and-smooth-shampoo-180-ml_pm2c3b')],
      stock: 140, unit: 'ml',
      weightOptions: [{ weight: '180ml', price: 400, image: RIMG('palmolive-healthy-and-smooth-shampoo-180-ml_pm2c3b') }],
      tags: ['palmolive', 'shampoo', 'healthy smooth', 'hair care', 'natural'],
    },

    {
      name: 'Palmolive Intensive Moisture Shampoo',
      description: 'Palmolive Intensive Moisture — naturally inspired shampoo with argan oil. Deep moisture for dry, frizzy hair.',
      category: C('Hair Care'), price: 440, discountPrice: 400, costPrice: 300,
      images: [RIMG('palmolive-intensive-moisture-shampoo-180-ml_pauckd')],
      stock: 135, unit: 'ml',
      weightOptions: [{ weight: '180ml', price: 400, image: RIMG('palmolive-intensive-moisture-shampoo-180-ml_pauckd') }],
      tags: ['palmolive', 'shampoo', 'intensive moisture', 'hair care', 'natural'],
    },

    {
      name: 'Lifebuoy Herbal Shampoo',
      description: 'Lifebuoy Herbal Shampoo — germ-fighting shampoo with natural herbal extracts for a clean, healthy scalp.',
      category: C('Hair Care'), price: 380, discountPrice: 350, costPrice: 260,
      images: [RIMG('lifebuoy-herbal-shampoo-175-ml_a7yflr')],
      stock: 140, unit: 'ml',
      weightOptions: [{ weight: '175ml', price: 350, image: RIMG('lifebuoy-herbal-shampoo-175-ml_a7yflr') }],
      tags: ['lifebuoy', 'shampoo', 'herbal', 'hair care'],
    },

    {
      name: 'Lifebuoy Silky Soft Shampoo',
      description: 'Lifebuoy Silky Soft Shampoo — nourishes for silky, soft hair while keeping the scalp healthy and clean.',
      category: C('Hair Care'), price: 380, discountPrice: 350, costPrice: 260,
      images: [RIMG('lifebuoy-silky-soft-shampoo-175-ml_b1l0z7')],
      stock: 135, unit: 'ml',
      weightOptions: [{ weight: '175ml', price: 350, image: RIMG('lifebuoy-silky-soft-shampoo-175-ml_b1l0z7') }],
      tags: ['lifebuoy', 'shampoo', 'silky soft', 'hair care'],
    },

    // ── Tang Powder Drinks ───────────────────────────────────────────────────
    {
      name: 'Tang Orange',
      description: 'Tang Orange — the world famous instant orange drink. Just add water for a burst of fruity refreshment.',
      category: C('Sharbat'), price: 420, discountPrice: 390, costPrice: 300,
      images: [RIMG('tang-orange-pouch-375-gm_sqrxn8'), RIMG('tang-orange-sachet-130-gm_xlflrj')],
      stock: 200, isFeatured: true, unit: 'g',
      weightOptions: [{ weight: '130g', price: 175, image: RIMG('tang-orange-sachet-130-gm_xlflrj') }, { weight: '375g', price: 435, image: RIMG('tang-orange-pouch-375-gm_sqrxn8') }],
      tags: ['tang', 'orange', 'instant drink', 'powder'],
    },

    {
      name: 'Tang Mango',
      description: 'Tang Mango — delicious mango-flavoured instant drink powder. Refreshing taste kids love.',
      category: C('Sharbat'), price: 420, discountPrice: 390, costPrice: 300,
      images: [RIMG('tang-mango-tub-750-gm_otyvg9'), RIMG('tang-mango-pouch-375-gm_griisr')],
      stock: 190, unit: 'g',
      weightOptions: [{ weight: '375g', price: 435, image: RIMG('tang-mango-pouch-375-gm_griisr') }, { weight: '750g', price: 840, image: RIMG('tang-mango-tub-750-gm_otyvg9') }],
      tags: ['tang', 'mango', 'instant drink', 'powder'],
    },

    {
      name: 'Tang Lemon Pepper',
      description: 'Tang Lemon Pepper — a unique zingy twist. Tangy lemon with a hint of pepper for a refreshing kick.',
      category: C('Sharbat'), price: 420, discountPrice: 390, costPrice: 300,
      images: [RIMG('tang-lemon-pepper-pouch-375-gm_uycvr4'), RIMG('tang-lemon-pepper-sachet-130-gm_iqzrjf')],
      stock: 160, unit: 'g',
      weightOptions: [{ weight: '130g', price: 175, image: RIMG('tang-lemon-pepper-sachet-130-gm_iqzrjf') }, { weight: '375g', price: 435, image: RIMG('tang-lemon-pepper-pouch-375-gm_uycvr4') }],
      tags: ['tang', 'lemon pepper', 'instant drink', 'powder'],
    },

    {
      name: 'Tang Pineapple',
      description: 'Tang Pineapple — tropical pineapple instant drink powder. A fruity twist in every sip.',
      category: C('Sharbat'), price: 420, discountPrice: 390, costPrice: 300,
      images: [RIMG('tang-pineapple-pouch-375-gm_dervfm'), RIMG('tang-pineapple-sachet-125-gm_oxllvz')],
      stock: 160, unit: 'g',
      weightOptions: [{ weight: '125g', price: 175, image: RIMG('tang-pineapple-sachet-125-gm_oxllvz') }, { weight: '375g', price: 435, image: RIMG('tang-pineapple-pouch-375-gm_dervfm') }],
      tags: ['tang', 'pineapple', 'instant drink', 'powder'],
    },

    // ── Dry Fruits & Nuts (additional) ───────────────────────────────────────
    {
      name: 'Basil Seeds (Tukmaria)',
      description: 'Basil seeds — rich in omega-3, fibre and antioxidants. Great in drinks and desserts.',
      category: C('Dry Fruits & Nuts'), price: 90, discountPrice: 80, costPrice: 55,
      images: [RIMG('Basil_Seeds_100gm_xcwkpi')], stock: 150, unit: 'g',
      weightOptions: [{ weight: '100g', price: 80, image: RIMG('Basil_Seeds_100gm_xcwkpi') }],
      tags: ['basil seeds', 'tukmaria', 'sabja', 'dry fruits'],
    },
    {
      name: 'Kishmish Premium (Jar)',
      description: 'Premium golden raisins packed in a jar. Sweet, juicy and naturally dried.',
      category: C('Dry Fruits & Nuts'), price: 190, discountPrice: 170, costPrice: 120,
      images: [RIMG('Kishmish_کشمش_شیشہ_100mg_n1dfle')], stock: 150, unit: 'g',
      weightOptions: [{ weight: '100g', price: 170, image: RIMG('Kishmish_کشمش_شیشہ_100mg_n1dfle') }],
      tags: ['kishmish', 'raisins', 'dry fruits'],
    },
    {
      name: 'Desi Kishmish (Raisins)',
      description: 'Desi dried raisins — naturally sweet with a rich flavour. Great for cooking and snacking.',
      category: C('Dry Fruits & Nuts'), price: 140, discountPrice: 120, costPrice: 80,
      images: [RIMG('Kishmish_Desi_کشمش_دیسی_100mg_bcrxwm')], stock: 150, unit: 'g',
      weightOptions: [{ weight: '100g', price: 120, image: RIMG('Kishmish_Desi_کشمش_دیسی_100mg_bcrxwm') }],
      tags: ['kishmish', 'desi raisins', 'dry fruits'],
    },
    {
      name: 'Kaju (Cashews)',
      description: 'Whole white cashew nuts. Rich in healthy fats and protein. Perfect for snacking and cooking.',
      category: C('Dry Fruits & Nuts'), price: 820, discountPrice: 750, costPrice: 560,
      images: [RIMG('White_kajoo_کاجو_200mg_thas8r')], stock: 100, unit: 'g',
      weightOptions: [{ weight: '200g', price: 750, image: RIMG('White_kajoo_کاجو_200mg_thas8r') }],
      tags: ['kaju', 'cashews', 'dry fruits'],
    },
    {
      name: 'Kalwangi (Nigella Seeds)',
      description: 'Kalonji / Nigella seeds — a powerful medicinal spice. Used in curries and naan bread.',
      category: C('Dry Fruits & Nuts'), price: 145, discountPrice: 130, costPrice: 85,
      images: [RIMG('Kalwangi_100mg_کلونجی_qr5lyn')], stock: 150, unit: 'g',
      weightOptions: [{ weight: '100g', price: 130, image: RIMG('Kalwangi_100mg_کلونجی_qr5lyn') }],
      tags: ['kalwangi', 'kalonji', 'nigella', 'dry fruits'],
    },
    {
      name: 'Pumpkin Seeds',
      description: 'Raw pumpkin seeds — packed with zinc, magnesium and protein. Great for snacking.',
      category: C('Dry Fruits & Nuts'), price: 220, discountPrice: 200, costPrice: 140,
      images: [RIMG('Pumpkin_Seeds_100gm_vreoj8')], stock: 120, unit: 'g',
      weightOptions: [{ weight: '100g', price: 200, image: RIMG('Pumpkin_Seeds_100gm_vreoj8') }],
      tags: ['pumpkin seeds', 'dry fruits', 'seeds'],
    },
    {
      name: 'Khashkhash (Poppy Seeds)',
      description: 'Khashkhash — white poppy seeds used in Pakistani desserts and gravies.',
      category: C('Dry Fruits & Nuts'), price: 310, discountPrice: 280, costPrice: 200,
      images: [RIMG('Khashkhaash200mg_خشخاش_j7gsti')], stock: 120, unit: 'g',
      weightOptions: [{ weight: '200g', price: 280, image: RIMG('Khashkhaash200mg_خشخاش_j7gsti') }],
      tags: ['khashkhash', 'poppy seeds', 'dry fruits'],
    },
    {
      name: 'Badam (Whole Almonds)',
      description: 'Whole desi almonds (badam) — rich in Vitamin E and healthy fats. A daily health essential.',
      category: C('Dry Fruits & Nuts'), price: 980, discountPrice: 900, costPrice: 680,
      images: [RIMG('Badam_500gm_ثابت_بادام_tjt5uk')], stock: 100, unit: 'g',
      weightOptions: [{ weight: '500g', price: 900, image: RIMG('Badam_500gm_ثابت_بادام_tjt5uk') }],
      tags: ['badam', 'almonds', 'dry fruits'],
    },
    {
      name: 'Badyan Khatai (Star Anise)',
      description: 'Badyan Khatai (Star Anise) — aromatic whole spice used in biryanis and curries.',
      category: C('Dry Fruits & Nuts'), price: 140, discountPrice: 120, costPrice: 80,
      images: [RIMG('Badyan_khatai_50gm_بادیان_خطائی_fuo2za')], stock: 120, unit: 'g',
      weightOptions: [{ weight: '50g', price: 120, image: RIMG('Badyan_khatai_50gm_بادیان_خطائی_fuo2za') }],
      tags: ['badyan khatai', 'star anise', 'spice'],
    },
    {
      name: 'Bhuna Chana (Roasted Chickpeas)',
      description: 'Crunchy roasted chickpeas — a classic Pakistani snack. High in protein and fibre.',
      category: C('Dry Fruits & Nuts'), price: 140, discountPrice: 120, costPrice: 80,
      images: [RIMG('Roasted_chickpeas_200mg_bhuna_Chana_vuc7en')], stock: 180, unit: 'g',
      weightOptions: [{ weight: '200g', price: 120, image: RIMG('Roasted_chickpeas_200mg_bhuna_Chana_vuc7en') }],
      tags: ['bhuna chana', 'roasted chickpeas', 'snacks'],
    },

    // ── Laundry ───────────────────────────────────────────────────────────────
    {
      name: 'Surf Excel',
      description: 'Surf Excel — Pakistan\'s No.1 detergent. Removes tough stains in one wash.',
      category: C('Laundry'), price: 880, discountPrice: 840, costPrice: 640,
      images: [RIMG('surf-excel-500-gm_pdss7k'), RIMG('surf-excel-1-kg_rqodhy'), RIMG('surf-excel-2-kg_s16m12')],
      stock: 200, isFeatured: true, unit: 'g',
      weightOptions: [
        { weight: '500g', price: 230, image: RIMG('surf-excel-500-gm_pdss7k') },
        { weight: '1kg', price: 450, image: RIMG('surf-excel-1-kg_rqodhy') },
        { weight: '2kg', price: 880, image: RIMG('surf-excel-2-kg_s16m12') },
      ],
      tags: ['surf excel', 'detergent', 'laundry', 'washing powder'],
    },
    {
      name: 'Ariel Original',
      description: 'Ariel Original — advanced cleaning with brilliant stain removal in every wash.',
      category: C('Laundry'), price: 490, discountPrice: 460, costPrice: 360,
      images: [RIMG('ariel-original-500-gm_htvc1i'), RIMG('ariel-original-1-kg_ljm3ab')],
      stock: 180, unit: 'g',
      weightOptions: [
        { weight: '500g', price: 250, image: RIMG('ariel-original-500-gm_htvc1i') },
        { weight: '1kg', price: 490, image: RIMG('ariel-original-1-kg_ljm3ab') },
      ],
      tags: ['ariel', 'detergent', 'laundry', 'washing powder'],
    },
    {
      name: 'Brite Maximum Power',
      description: 'Brite Maximum Power — tough stain removal with a refreshing fragrance.',
      category: C('Laundry'), price: 520, discountPrice: 490, costPrice: 380,
      images: [RIMG('brite-maximum-power-500-gm_owxosi'), RIMG('brite-maximum-power-1000-gm_vtiqf3'), RIMG('brite-maximum-power-2-kg_kd14zd')],
      stock: 180, unit: 'g',
      weightOptions: [
        { weight: '500g', price: 140, image: RIMG('brite-maximum-power-500-gm_owxosi') },
        { weight: '1kg', price: 270, image: RIMG('brite-maximum-power-1000-gm_vtiqf3') },
        { weight: '2kg', price: 520, image: RIMG('brite-maximum-power-2-kg_kd14zd') },
      ],
      tags: ['brite', 'detergent', 'laundry', 'washing powder'],
    },
    {
      name: 'Bonus Active',
      description: 'Bonus Active — effective washing powder for everyday laundry. Fresh and clean results.',
      category: C('Laundry'), price: 360, discountPrice: 340, costPrice: 260,
      images: [RIMG('bonus-active-500-gm_hgwptm'), RIMG('bonus-tristar-1000-gmwebp_fiqajo')],
      stock: 160, unit: 'g',
      weightOptions: [
        { weight: '500g', price: 180, image: RIMG('bonus-active-500-gm_hgwptm') },
        { weight: '1kg', price: 360, image: RIMG('bonus-tristar-1000-gmwebp_fiqajo') },
      ],
      tags: ['bonus', 'detergent', 'laundry'],
    },
    {
      name: 'Express Power',
      description: 'Express Power — fast-acting detergent with deep clean formula.',
      category: C('Laundry'), price: 320, discountPrice: 300, costPrice: 230,
      images: [RIMG('express-power-500-gm_n0lqpq'), RIMG('express-power-1-kg_fy80qn')],
      stock: 150, unit: 'g',
      weightOptions: [
        { weight: '500g', price: 165, image: RIMG('express-power-500-gm_n0lqpq') },
        { weight: '1kg', price: 320, image: RIMG('express-power-1-kg_fy80qn') },
      ],
      tags: ['express power', 'detergent', 'laundry'],
    },

    // ── Kitchen (Dish Wash) ───────────────────────────────────────────────────
    {
      name: 'Lemon Max Dishwash Bar',
      description: 'Lemon Max Dishwash Bar — cuts through grease fast. Long-lasting lemon fresh fragrance.',
      category: C('Kitchen'), price: 40, discountPrice: 35, costPrice: 22,
      images: [RIMG('lemon-max-dishwash-bar-85-gm_g3b0hw'), RIMG('lemon-max-dishwash-bachat-bar-530-gm_a1htas')],
      stock: 300, unit: 'g',
      weightOptions: [
        { weight: '85g', price: 35, image: RIMG('lemon-max-dishwash-bar-85-gm_g3b0hw') },
        { weight: '530g', price: 185, image: RIMG('lemon-max-dishwash-bachat-bar-530-gm_a1htas') },
      ],
      tags: ['lemon max', 'dishwash', 'kitchen', 'dish soap'],
    },
    {
      name: 'Lemon Max Liquid',
      description: 'Lemon Max Dishwash Liquid — removes grease and tough food residue in seconds.',
      category: C('Kitchen'), price: 120, discountPrice: 110, costPrice: 80,
      images: [RIMG('lemon-max-liquid-275-ml_yw0waq'), RIMG('lemon-max-liquid-475-ml_hte1du'), RIMG('lemon-max-dishwash-liquid-lemon-fresh-475-ml-yellow_qtsm3w')],
      stock: 200, unit: 'ml',
      weightOptions: [
        { weight: '275ml', price: 75, image: RIMG('lemon-max-liquid-275-ml_yw0waq') },
        { weight: '475ml Green', price: 120, image: RIMG('lemon-max-liquid-475-ml_hte1du') },
        { weight: '475ml Yellow', price: 125, image: RIMG('lemon-max-dishwash-liquid-lemon-fresh-475-ml-yellow_qtsm3w') },
      ],
      tags: ['lemon max', 'dishwash liquid', 'kitchen'],
    },
    {
      name: 'Lemon Max Paste',
      description: 'Lemon Max Dishwash Paste — thick paste formula for stubborn grease and stains.',
      category: C('Kitchen'), price: 140, discountPrice: 130, costPrice: 90,
      images: [RIMG('lemon-max-paste-400-gm-green_td2h9e'), RIMG('lemon-max-paste-400-gm-yellow_mxlmjq')],
      stock: 200, unit: 'g',
      weightOptions: [
        { weight: '400g Green', price: 130, image: RIMG('lemon-max-paste-400-gm-green_td2h9e') },
        { weight: '400g Yellow', price: 130, image: RIMG('lemon-max-paste-400-gm-yellow_mxlmjq') },
      ],
      tags: ['lemon max', 'dishwash paste', 'kitchen'],
    },
    {
      name: 'Vim Dishwash Bar',
      description: 'Vim 2-in-1 Dishwash Bar Lemon & Pudina — removes tough grease and odors.',
      category: C('Kitchen'), price: 185, discountPrice: 170, costPrice: 120,
      images: [RIMG('vim-2-in-1-dish-wash-long-bar-lemon-pudina-460-gm_nhgemt')], stock: 180, unit: 'g',
      weightOptions: [{ weight: '460g', price: 170, image: RIMG('vim-2-in-1-dish-wash-long-bar-lemon-pudina-460-gm_nhgemt') }],
      tags: ['vim', 'dishwash', 'kitchen'],
    },

    // ── Cleaning Cupboard ─────────────────────────────────────────────────────
    {
      name: 'Harpic Toilet Cleaner Original',
      description: 'Harpic Toilet Cleaner Original — kills 99.9% germs and removes tough stains.',
      category: C('Cleaning Cupboard'), price: 290, discountPrice: 270, costPrice: 200,
      images: [RIMG('harpic-toilet-cleaner-original-125ml_giq1b8'), RIMG('harpic-toilet-cleaner-original-225-ml_wa8aee')],
      stock: 150, isFeatured: false, unit: 'ml',
      weightOptions: [
        { weight: '125ml', price: 95, image: RIMG('harpic-toilet-cleaner-original-125ml_giq1b8') },
        { weight: '225ml', price: 165, image: RIMG('harpic-toilet-cleaner-original-225-ml_wa8aee') },
      ],
      tags: ['harpic', 'toilet cleaner', 'cleaning'],
    },
    {
      name: 'Harpic Toilet Cleaner Citrus',
      description: 'Harpic Citrus Toilet Cleaner — powerful citrus formula kills germs and freshens.',
      category: C('Cleaning Cupboard'), price: 300, discountPrice: 280, costPrice: 210,
      images: [RIMG('harpic-toilet-cleaner-citrus-450-ml_jvipk5')], stock: 130, unit: 'ml',
      weightOptions: [{ weight: '450ml', price: 280, image: RIMG('harpic-toilet-cleaner-citrus-450-ml_jvipk5') }],
      tags: ['harpic', 'citrus', 'toilet cleaner'],
    },
    {
      name: 'Harpic Bathroom Cleaner Floral',
      description: 'Harpic Bathroom Cleaner Floral — cleans tiles, sinks and surfaces with a fresh floral fragrance.',
      category: C('Cleaning Cupboard'), price: 300, discountPrice: 280, costPrice: 210,
      images: [RIMG('harpic-bathroom-cleaner-floral-125-ml_y86v4n'), RIMG('harpic-bathroom-cleaner-floral-225-ml_nuzgf4'), RIMG('harpic-bathroom-cleaner-floral-450-ml_mwoyna')],
      stock: 130, unit: 'ml',
      weightOptions: [
        { weight: '125ml', price: 95, image: RIMG('harpic-bathroom-cleaner-floral-125-ml_y86v4n') },
        { weight: '225ml', price: 165, image: RIMG('harpic-bathroom-cleaner-floral-225-ml_nuzgf4') },
        { weight: '450ml', price: 280, image: RIMG('harpic-bathroom-cleaner-floral-450-ml_mwoyna') },
      ],
      tags: ['harpic', 'bathroom cleaner', 'floral', 'cleaning'],
    },
    {
      name: 'Dettol Surface Cleaner',
      description: 'Dettol Surface Cleaner — kills 99.9% germs on kitchen and bathroom surfaces.',
      category: C('Cleaning Cupboard'), price: 220, discountPrice: 200, costPrice: 148,
      images: [RIMG('dettol-surface-cleaner-floral-500-ml_qfhtqn'), RIMG('dettol-surface-cleaner-citrus-500-ml_i0jijd'), RIMG('dettol-antibacterial-power-surface-cleaner-lavender-500-ml_ntyjfc'), RIMG('dettol-antibacterial-power-surface-cleaner-aqua-500-ml_owkruz')],
      stock: 140, unit: 'ml',
      weightOptions: [
        { weight: '500ml Floral', price: 200, image: RIMG('dettol-surface-cleaner-floral-500-ml_qfhtqn') },
        { weight: '500ml Citrus', price: 200, image: RIMG('dettol-surface-cleaner-citrus-500-ml_i0jijd') },
        { weight: '500ml Lavender', price: 220, image: RIMG('dettol-antibacterial-power-surface-cleaner-lavender-500-ml_ntyjfc') },
        { weight: '500ml Aqua', price: 220, image: RIMG('dettol-antibacterial-power-surface-cleaner-aqua-500-ml_owkruz') },
      ],
      tags: ['dettol', 'surface cleaner', 'antibacterial', 'cleaning'],
    },
    {
      name: 'Robin Liquid Blue',
      description: 'Robin Liquid Blue — the classic fabric whitener. Brightens whites with every wash.',
      category: C('Cleaning Cupboard'), price: 85, discountPrice: 75, costPrice: 52,
      images: [RIMG('robin-liquid-blue-150-ml_xiyi8m')], stock: 200, unit: 'ml',
      weightOptions: [{ weight: '150ml', price: 75, image: RIMG('robin-liquid-blue-150-ml_xiyi8m') }],
      tags: ['robin', 'liquid blue', 'whitener', 'laundry'],
    },
    {
      name: 'Robin Liquid Bleach',
      description: 'Robin Liquid Bleach Original — powerful bleach for disinfecting and whitening surfaces.',
      category: C('Cleaning Cupboard'), price: 135, discountPrice: 120, costPrice: 85,
      images: [RIMG('robin-liquid-bleach-original-500-ml_f1loxd')], stock: 160, unit: 'ml',
      weightOptions: [{ weight: '500ml', price: 120, image: RIMG('robin-liquid-bleach-original-500-ml_f1loxd') }],
      tags: ['robin', 'bleach', 'cleaning'],
    },
    {
      name: 'Finis Daily Mop Phenyl',
      description: 'Finis Daily Mop Phenyl — perfumed white phenyl for floors. Disinfects and freshens.',
      category: C('Cleaning Cupboard'), price: 200, discountPrice: 180, costPrice: 130,
      images: [RIMG('finis-daily-mop-perfumed-white-phenyl_2.5-ltr_pll1mr')], stock: 120, unit: 'litre',
      weightOptions: [{ weight: '2.5L', price: 180, image: RIMG('finis-daily-mop-perfumed-white-phenyl_2.5-ltr_pll1mr') }],
      tags: ['finis', 'phenyl', 'floor cleaner', 'cleaning'],
    },
    {
      name: 'Sun Brite Steel Scrubber',
      description: 'Sun Brite Stainless Steel Scrubber — heavy duty scrubbing for pots and pans.',
      category: C('Kitchen'), price: 90, discountPrice: 80, costPrice: 55,
      images: [RIMG('sun-brite-stainless-steel-1-pcs_q6diuy')], stock: 200, unit: 'piece',
      weightOptions: [{ weight: '1 pc', price: 80, image: RIMG('sun-brite-stainless-steel-1-pcs_q6diuy') }],
      tags: ['sun brite', 'scrubber', 'kitchen'],
    },
    {
      name: 'Max Scrub Scouring Pad',
      description: 'Max Scrub Grease-Cutting Scouring Pad — tough on grease, gentle on surfaces.',
      category: C('Kitchen'), price: 95, discountPrice: 85, costPrice: 58,
      images: [RIMG('max-scrub-grease-cutting-scouring-pad-regular-1-pc_gvrcgk')], stock: 200, unit: 'piece',
      weightOptions: [{ weight: '1 pc', price: 85, image: RIMG('max-scrub-grease-cutting-scouring-pad-regular-1-pc_gvrcgk') }],
      tags: ['max scrub', 'scouring pad', 'kitchen'],
    },

    // ── Toilet Rolls & Tissue ─────────────────────────────────────────────────
    {
      name: 'Rose Petal Kitchen Towel',
      description: 'Rose Petal Zzoop Kitchen Towel — super absorbent, strong and soft. Great for kitchen use.',
      category: C('Toilet Rolls'), price: 155, discountPrice: 140, costPrice: 100,
      images: [RIMG('rose-petal-zzoop-kitchen-towel-absorbs-upto-260-kcal_v2mwxx')], stock: 180, unit: 'piece',
      weightOptions: [{ weight: '1 roll', price: 140, image: RIMG('rose-petal-zzoop-kitchen-towel-absorbs-upto-260-kcal_v2mwxx') }],
      tags: ['rose petal', 'kitchen towel', 'tissue'],
    },
    {
      name: 'Rose Petal Tulip Roll',
      description: 'Rose Petal Tulip Pink — thick and absorbent toilet roll. Soft comfort for everyday use.',
      category: C('Toilet Rolls'), price: 100, discountPrice: 90, costPrice: 65,
      images: [RIMG('rose-petal-tulip-pink-thick-absorbent-roll_h5l9uh')], stock: 200, unit: 'piece',
      weightOptions: [{ weight: '1 roll', price: 90, image: RIMG('rose-petal-tulip-pink-thick-absorbent-roll_h5l9uh') }],
      tags: ['rose petal', 'toilet roll', 'tissue'],
    },
    {
      name: 'Rose Petal Toilet Roll',
      description: 'Rose Petal Maxob Single Toilet Roll — premium soft tissue for everyday bathroom use.',
      category: C('Toilet Rolls'), price: 60, discountPrice: 50, costPrice: 35,
      images: [RIMG('rose-petal-maxob-toilet-roll-single_ghltv7')], stock: 250, unit: 'piece',
      weightOptions: [{ weight: '1 roll', price: 50, image: RIMG('rose-petal-maxob-toilet-roll-single_ghltv7') }],
      tags: ['rose petal', 'toilet roll', 'tissue'],
    },
    {
      name: 'Sateensoft Table Napkins',
      description: 'Sateensoft Festive Table Napkins — elegant and soft. Perfect for dining and occasions.',
      category: C('Toilet Rolls'), price: 135, discountPrice: 120, costPrice: 85,
      images: [RIMG('sateensoft-festive-table-napkins_ltcwsy')], stock: 180, unit: 'piece',
      weightOptions: [{ weight: '1 pack', price: 120, image: RIMG('sateensoft-festive-table-napkins_ltcwsy') }],
      tags: ['sateensoft', 'napkins', 'tissue'],
    },
    {
      name: 'Extra Clean Kitchen Towel',
      description: 'Extra Clean Kitchen Towel Twin 2x — double pack for extra value. Absorbent and strong.',
      category: C('Toilet Rolls'), price: 175, discountPrice: 160, costPrice: 115,
      images: [RIMG('Extra_Clean_Kitchen_Towel_Twin_2X_c0tvgb')], stock: 180, unit: 'piece',
      weightOptions: [{ weight: '2 rolls', price: 160, image: RIMG('Extra_Clean_Kitchen_Towel_Twin_2X_c0tvgb') }],
      tags: ['extra clean', 'kitchen towel', 'tissue'],
    },

    // ── Baby Products ─────────────────────────────────────────────────────────
    {
      name: "Johnson's Baby Shampoo",
      description: "Johnson's Baby Shampoo — No More Tears formula. Gentle on baby's eyes and hair.",
      category: C('Baby Products'), price: 420, discountPrice: 380, costPrice: 280,
      images: [RIMG('Johnsons-Baby-Shampoo-200-ml-_Imported_f1s95r')], stock: 150, isFeatured: true, unit: 'ml',
      weightOptions: [{ weight: '200ml', price: 380, image: RIMG('Johnsons-Baby-Shampoo-200-ml-_Imported_f1s95r') }],
      tags: ['johnsons', 'baby shampoo', 'baby care'],
    },
    {
      name: "Johnson's Baby Soap",
      description: "Johnson's Baby Soap — mild, gentle formula. Clinically tested and pH-balanced for babies.",
      category: C('Baby Products'), price: 150, discountPrice: 135, costPrice: 98,
      images: [RIMG('johnsons-baby-soap-100-gm_guvlva'), RIMG('johnsons-milk-baby-soap-bar-100-gm_swdijd'), RIMG('johnsons-blossoms-baby-soap-bar-100-gm_bdundu')],
      stock: 180, unit: 'g',
      weightOptions: [
        { weight: 'Original 100g', price: 135, image: RIMG('johnsons-baby-soap-100-gm_guvlva') },
        { weight: 'Milk 100g', price: 145, image: RIMG('johnsons-milk-baby-soap-bar-100-gm_swdijd') },
        { weight: 'Blossoms 100g', price: 145, image: RIMG('johnsons-blossoms-baby-soap-bar-100-gm_bdundu') },
      ],
      tags: ['johnsons', 'baby soap', 'baby care'],
    },
    {
      name: "Johnson's Baby Powder",
      description: "Johnson's Baby Powder — keeps baby's skin dry and fresh. Gentle mineral formula.",
      category: C('Baby Products'), price: 560, discountPrice: 520, costPrice: 390,
      images: [RIMG('johnsons-baby-powder-100-gm-imported_xdhhbh'), RIMG('johnsons-baby-powder-blossom-200-gm-imported_ibexkr')],
      stock: 160, unit: 'g',
      weightOptions: [
        { weight: '100g', price: 290, image: RIMG('johnsons-baby-powder-100-gm-imported_xdhhbh') },
        { weight: '200g Blossom', price: 540, image: RIMG('johnsons-baby-powder-blossom-200-gm-imported_ibexkr') },
      ],
      tags: ['johnsons', 'baby powder', 'baby care'],
    },
    {
      name: "Johnson's Baby Lotion",
      description: "Johnson's Baby Moisturising Lotion — keeps baby's skin soft and nourished all day.",
      category: C('Baby Products'), price: 600, discountPrice: 550, costPrice: 410,
      images: [RIMG('johnsons-baby-lotion-moisturising-200-ml-imported_oluqio')], stock: 140, unit: 'ml',
      weightOptions: [{ weight: '200ml', price: 550, image: RIMG('johnsons-baby-lotion-moisturising-200-ml-imported_oluqio') }],
      tags: ['johnsons', 'baby lotion', 'baby care'],
    },
    {
      name: "Johnson's Baby Bath",
      description: "Johnson's Baby Bath — gentle foaming wash for baby's delicate skin. Tear-free.",
      category: C('Baby Products'), price: 520, discountPrice: 470, costPrice: 350,
      images: [RIMG('johnsons-baby-bath-200-ml-imported_g0ayef')], stock: 140, unit: 'ml',
      weightOptions: [{ weight: '200ml', price: 470, image: RIMG('johnsons-baby-bath-200-ml-imported_g0ayef') }],
      tags: ['johnsons', 'baby bath', 'baby care'],
    },
    {
      name: "Johnson's Baby Wipes",
      description: "Johnson's Baby Wipes Gentle — gentle enough for newborns. 84 soft wipes per pack.",
      category: C('Baby Products'), price: 360, discountPrice: 320, costPrice: 238,
      images: [RIMG('johnsons-baby-wipes-gentle-84-pcs-imported_ozpxtq')], stock: 160, unit: 'piece',
      weightOptions: [{ weight: '84 pcs', price: 320, image: RIMG('johnsons-baby-wipes-gentle-84-pcs-imported_ozpxtq') }],
      tags: ['johnsons', 'baby wipes', 'baby care'],
    },
    {
      name: "Johnson's Petroleum Jelly",
      description: "Johnson's Baby Petroleum Jelly — protects and soothes baby's delicate skin.",
      category: C('Baby Products'), price: 295, discountPrice: 270, costPrice: 200,
      images: [RIMG('johnsons-baby-petroleum-jelly-lightly-fragranced-100-ml_k2gokd'), RIMG('johnsons-baby-petroleum-fragrance-free-100-ml_a7gmyo')],
      stock: 150, unit: 'ml',
      weightOptions: [
        { weight: '100ml Fragranced', price: 270, image: RIMG('johnsons-baby-petroleum-jelly-lightly-fragranced-100-ml_k2gokd') },
        { weight: '100ml Fragrance Free', price: 260, image: RIMG('johnsons-baby-petroleum-fragrance-free-100-ml_a7gmyo') },
      ],
      tags: ['johnsons', 'petroleum jelly', 'baby care'],
    },
    {
      name: 'Molfix Baby Diapers',
      description: 'Molfix Baby Diapers — ultra soft with 360° leak protection. Comfortable for all-day wear.',
      category: C('Baby Products'), price: 750, discountPrice: 720, costPrice: 540,
      images: [RIMG('Molfix-Diapers-Size-1-Newborn-78_mdqets'), RIMG('molfix-baby-diaper-5-junior-44-pcs-11-18-kg_v6cu9c'), RIMG('molfix-baby-diaper-6-extra-long-38-pcs-15-kg_ouotjm')],
      stock: 120, isFeatured: true, unit: 'piece',
      weightOptions: [
        { weight: 'Newborn (78 pcs)', price: 700, image: RIMG('Molfix-Diapers-Size-1-Newborn-78_mdqets') },
        { weight: 'Junior Size 5 (44 pcs)', price: 730, image: RIMG('molfix-baby-diaper-5-junior-44-pcs-11-18-kg_v6cu9c') },
        { weight: 'Extra Large Size 6 (38 pcs)', price: 760, image: RIMG('molfix-baby-diaper-6-extra-long-38-pcs-15-kg_ouotjm') },
      ],
      tags: ['molfix', 'diapers', 'baby care', 'nappies'],
    },
    {
      name: 'Nexton Baby Wipes',
      description: 'Nexton Baby Wipes Extra Sensitive — alcohol-free and hypoallergenic. 84 wipes per pack.',
      category: C('Baby Products'), price: 315, discountPrice: 285, costPrice: 210,
      images: [RIMG('nexton-baby-wipes-extra-sensitive-84-pcs_hfc66v')], stock: 150, unit: 'piece',
      weightOptions: [{ weight: '84 pcs', price: 285, image: RIMG('nexton-baby-wipes-extra-sensitive-84-pcs_hfc66v') }],
      tags: ['nexton', 'baby wipes', 'baby care'],
    },

    // ── Men's Grooming ────────────────────────────────────────────────────────
    {
      name: 'Gillette Shaving Foam',
      description: 'Gillette Shaving Foam — smooth, close shave with skin comfort. Sensitive and Regular variants.',
      category: C("Men's Toiletries"), price: 360, discountPrice: 340, costPrice: 250,
      images: [RIMG('gillette-shaving-foam-sensitive-200-ml-imported_l90vzh'), RIMG('gillette-shaving-foam-regular-200-ml_xeiq2s')],
      stock: 130, unit: 'ml',
      weightOptions: [
        { weight: '200ml Sensitive', price: 360, image: RIMG('gillette-shaving-foam-sensitive-200-ml-imported_l90vzh') },
        { weight: '200ml Regular', price: 330, image: RIMG('gillette-shaving-foam-regular-200-ml_xeiq2s') },
      ],
      tags: ['gillette', 'shaving foam', 'men grooming'],
    },
    {
      name: 'Gillette Razor',
      description: 'Gillette Disposable Razor — smooth, comfortable shave with multi-blade technology.',
      category: C("Men's Toiletries"), price: 290, discountPrice: 270, costPrice: 195,
      images: [RIMG('gillette-blue-3-comfort-disposable-razor-_ulbfgi'), RIMG('gillette-blue-2-plus-razor-1-pc_y0vhpz')],
      stock: 150, unit: 'piece',
      weightOptions: [
        { weight: 'Blue 3 Comfort', price: 290, image: RIMG('gillette-blue-3-comfort-disposable-razor-_ulbfgi') },
        { weight: 'Blue 2+', price: 190, image: RIMG('gillette-blue-2-plus-razor-1-pc_y0vhpz') },
      ],
      tags: ['gillette', 'razor', 'men grooming', 'shaving'],
    },
    {
      name: 'Fa Men Roll-On',
      description: 'Fa Men Roll-On Deodorant — 48h protection against sweat and odour. Fresh masculine scent.',
      category: C("Men's Toiletries"), price: 275, discountPrice: 250, costPrice: 180,
      images: [RIMG('fa-men-freshly-free-lime-ginger-roll-on-50-ml_hxzb5b'), RIMG('fa-men-invisible-power-refreshing-roll-on-50-ml_eyoly0')],
      stock: 130, unit: 'ml',
      weightOptions: [
        { weight: '50ml Lime Ginger', price: 250, image: RIMG('fa-men-freshly-free-lime-ginger-roll-on-50-ml_hxzb5b') },
        { weight: '50ml Invisible Power', price: 250, image: RIMG('fa-men-invisible-power-refreshing-roll-on-50-ml_eyoly0') },
      ],
      tags: ['fa men', 'roll-on', 'deodorant', 'men grooming'],
    },
    {
      name: 'Axe Body Spray',
      description: 'Axe Body Spray — long-lasting 48h fragrance for men. Irresistible masculine scent.',
      category: C('Perfume'), price: 350, discountPrice: 320, costPrice: 230,
      images: [RIMG('AxeMuskBodySprayDeodorant150ml_ffusbi'), RIMG('axe-dark-temptation-48h-non-stop-fresh-body-spray-150-ml_dxt1ek')],
      stock: 130, unit: 'ml',
      weightOptions: [
        { weight: '150ml Musk', price: 295, image: RIMG('AxeMuskBodySprayDeodorant150ml_ffusbi') },
        { weight: '150ml Dark Temptation', price: 330, image: RIMG('axe-dark-temptation-48h-non-stop-fresh-body-spray-150-ml_dxt1ek') },
      ],
      tags: ['axe', 'body spray', 'deodorant', 'perfume'],
    },
    {
      name: 'Dove Men Care Soap',
      description: 'Dove Men+Care Body & Face Bar — deep cleaning with moisturising care. Imported.',
      category: C('Bath Soap'), price: 220, discountPrice: 200, costPrice: 148,
      images: [RIMG('DoveMen_CareCleanComfortBody_FaceBarSoap106gm_Canada_wqnd0k'), RIMG('DoveMen_CareDeepCleanBody_FaceBarSoap106gm_Canada_ypj2aw')],
      stock: 120, unit: 'g',
      weightOptions: [
        { weight: '106g Clean Comfort', price: 200, image: RIMG('DoveMen_CareCleanComfortBody_FaceBarSoap106gm_Canada_wqnd0k') },
        { weight: '106g Deep Clean', price: 200, image: RIMG('DoveMen_CareDeepCleanBody_FaceBarSoap106gm_Canada_ypj2aw') },
      ],
      tags: ['dove men', 'soap', 'men grooming', 'bath soap'],
    },
    {
      name: 'Glow & Handsome Face Cream',
      description: 'Glow & Handsome Instant Brightness Face Cream — advanced formula for brighter, fairer skin.',
      category: C('Face & Body Care'), price: 170, discountPrice: 150, costPrice: 108,
      images: [RIMG('fair-lovely-glow-handsome-instant-brightness-face-cream-25-gm_hljucr')], stock: 160, unit: 'g',
      weightOptions: [{ weight: '25g', price: 150, image: RIMG('fair-lovely-glow-handsome-instant-brightness-face-cream-25-gm_hljucr') }],
      tags: ['glow handsome', 'face cream', 'skin care', 'fairness'],
    },
];

  await Product.insertMany(products);
  console.log(`✅ ${products.length} products seeded`);

  console.log('\n🎉 SellMix seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('API    →  http://localhost:5000');
  console.log('⚠️  Change the admin password immediately after first login!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
