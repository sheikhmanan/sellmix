const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

// Base URL for product images — served from Cloudinary
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const IMG = (f) => `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_800,c_limit/sellmix/products/${f.replace(/\.[^.]+$/, '')}`;

const categories = [
  { name: 'Spices & Masala',    icon: '🌶️' },
  { name: 'Tea & Beverages',    icon: '🍵' },
  { name: 'Rice & Grains',      icon: '🌾' },
  { name: 'Flour & Atta',       icon: '🌾' },
  { name: 'Cooking Oil & Ghee', icon: '🫙' },
  { name: 'Dairy & Eggs',       icon: '🥛' },
  { name: 'Pulses & Lentils',   icon: '🫘' },
  { name: 'Chicken & Meat',     icon: '🍗' },
  { name: 'Vegetables',         icon: '🥦' },
  { name: 'Household',          icon: '🧴' },
];

const seed = async () => {
  await connectDB();
  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});

  // ── Admin ──────────────────────────────────────────────────────────────────
  await User.create({
    name: 'SellMix Admin',
    mobile: '03001234567',
    password: 'admin123',
    role: 'admin',
    address: 'Chichawatni, Punjab',
  });
  console.log('✅ Admin user created  (03001234567 / admin123)');

  // ── Categories ─────────────────────────────────────────────────────────────
  const cats = await Category.insertMany(categories);
  const C = (name) => cats.find((c) => c.name === name)._id;
  console.log(`✅ ${cats.length} categories created`);

  // ── Products ───────────────────────────────────────────────────────────────
  const products = [

    // SPICES & MASALA — National Recipe Mixes
    {
      name: 'National Biryani Masala',
      description: 'Authentic Biryani spice mix with 2 extra value packets. The classic Pakistani Biryani flavour your family loves.',
      category: C('Spices & Masala'),
      price: 130, discountPrice: 115, costPrice: 75,
      images: [IMG('biryani.jpeg')],
      stock: 200, isFeatured: true, unit: 'pack',
      weightOptions: [{ weight: '78g', price: 115 }],
      tags: ['national', 'biryani'],
      cookingInstructions: 'Marinate chicken with masala & yogurt, cook on medium heat 20 mins, layer with soaked rice and steam 15 mins.',
    },
    {
      name: 'National Chicken Tandoori Mix',
      description: 'New & Improved. Authentic tandoori flavour at home. Perfect with naan or paratha.',
      category: C('Spices & Masala'),
      price: 110, discountPrice: 95, costPrice: 60,
      images: [IMG('chicken-tandoori.jpeg')],
      stock: 180, isFeatured: true, unit: 'pack',
      weightOptions: [{ weight: '45g', price: 95 }],
      tags: ['national', 'chicken', 'tandoori'],
      cookingInstructions: 'Mix with yogurt, marinate chicken 2 hours, grill or bake at 200°C for 25 mins.',
    },
    {
      name: 'National Kaleji Masala',
      description: 'Limited Edition. Perfectly balanced spices for kaleji. Rich & aromatic.',
      category: C('Spices & Masala'),
      price: 110, discountPrice: 95, costPrice: 60,
      images: [IMG('kaleji.jpeg')],
      stock: 150, unit: 'pack',
      weightOptions: [{ weight: '45g', price: 95 }],
      tags: ['national', 'kaleji'],
      cookingInstructions: 'Fry onions golden, add kaleji and masala, cook on high heat 10 mins.',
    },
    {
      name: 'National Seekh Kabab Mix',
      description: 'Authentic seekh kabab spice mix. Juicy, flavourful kababs every single time.',
      category: C('Spices & Masala'),
      price: 110, discountPrice: 95, costPrice: 60,
      images: [IMG('seekh-kabab.jpeg')],
      stock: 170, isFeatured: true, unit: 'pack',
      weightOptions: [{ weight: '46g', price: 95 }],
      tags: ['national', 'kabab', 'bbq'],
      cookingInstructions: 'Mix with minced meat, shape on skewers, grill or pan-fry until golden.',
    },
    {
      name: 'National Paya Masala',
      description: 'Classic paya recipe mix. Rich, slow-cooked trotters flavour in every bite.',
      category: C('Spices & Masala'),
      price: 100, discountPrice: 85, costPrice: 55,
      images: [IMG('paya.jpeg')],
      stock: 120, unit: 'pack',
      weightOptions: [{ weight: '39g', price: 85 }],
      tags: ['national', 'paya'],
      cookingInstructions: 'Pressure cook trotters 30 mins, add masala, simmer 1 hour until tender.',
    },
    {
      name: 'National Pulao Masala',
      description: 'Aromatic pulao spice mix. Makes perfectly flavoured, fragrant rice every time.',
      category: C('Spices & Masala'),
      price: 120, discountPrice: 105, costPrice: 68,
      images: [IMG('pulao.jpeg')],
      stock: 200, unit: 'pack',
      weightOptions: [{ weight: '70g', price: 105 }],
      tags: ['national', 'pulao'],
      cookingInstructions: 'Fry meat with masala, add 2x water, bring to boil, add washed rice and cover 20 mins.',
    },
    {
      name: 'National Murghi Masala',
      description: 'Classic Pakistani chicken curry spice mix. Rich red gravy, restaurant taste at home.',
      category: C('Spices & Masala'),
      price: 110, discountPrice: 95, costPrice: 62,
      images: [IMG('murghi.jpeg')],
      stock: 190, unit: 'pack',
      weightOptions: [{ weight: '43g', price: 95 }],
      tags: ['national', 'chicken', 'curry'],
      cookingInstructions: 'Fry onions, add chicken and masala, cook medium heat 25 mins until oil separates.',
    },
    {
      name: 'National Malai Boti Mix',
      description: 'Limited Edition. Creamy, tender malai boti. Restaurant quality in your own kitchen.',
      category: C('Spices & Masala'),
      price: 120, discountPrice: 105, costPrice: 70,
      images: [IMG('malai-boti.jpeg')],
      stock: 140, isFeatured: true, unit: 'pack',
      weightOptions: [{ weight: '50g', price: 105 }],
      tags: ['national', 'malai', 'boti', 'bbq'],
      cookingInstructions: 'Mix masala with cream and chicken, marinate 1 hour, grill until golden.',
    },
    {
      name: 'National Qeema Masala',
      description: 'New formula. Perfectly spiced qeema masala. Great with naan, paratha or rice.',
      category: C('Spices & Masala'),
      price: 125, discountPrice: 110, costPrice: 72,
      images: [IMG('qeema.jpeg')],
      stock: 160, unit: 'pack',
      weightOptions: [{ weight: '50g', price: 110 }],
      tags: ['national', 'qeema'],
      cookingInstructions: 'Fry onions golden, add mince and masala, cook 15 mins until dry.',
    },
    {
      name: 'National Tikka Boti Mix',
      description: 'New & Improved. Authentic tikka boti flavour. Perfect for BBQ and grill nights.',
      category: C('Spices & Masala'),
      price: 115, discountPrice: 100, costPrice: 65,
      images: [IMG('tikka-boti.jpeg')],
      stock: 155, unit: 'pack',
      weightOptions: [{ weight: '44g', price: 100 }],
      tags: ['national', 'tikka', 'bbq'],
      cookingInstructions: 'Marinate meat with masala and yogurt 2 hours, grill on high heat until charred.',
    },

    // TEA & BEVERAGES
    {
      name: 'Lipton Yellow Label Tea',
      description: "The World's No.1 Tea Brand. New & Stronger Blend. Perfect for Pakistani doodh pati chai.",
      category: C('Tea & Beverages'),
      price: 1450, discountPrice: 1350, costPrice: 1050,
      images: [IMG('lipton-tea-box.jpeg'), IMG('lipton-tea-bag.jpeg'), IMG('lipton-tea-large.jpeg')],
      stock: 80, isFeatured: true, unit: 'g',
      weightOptions: [
        { weight: '190g Box',  price: 850  },
        { weight: '430g Bag',  price: 1350 },
        { weight: '900g Large',price: 2600 },
      ],
      tags: ['lipton', 'tea', 'danedar'],
      nutritionalInfo: 'Energy: 2 kcal per cup. Contains natural antioxidants.',
    },
    {
      name: 'Vital Tea (Eastern)',
      description: "Pakistan's favourite danedar tea. Strong, rich flavour. Win Big promo packs available.",
      category: C('Tea & Beverages'),
      price: 1200, discountPrice: 1100, costPrice: 850,
      images: [IMG('vital-tea-box.jpeg'), IMG('vital-tea-bag.jpeg'), IMG('vital-tea-small.jpeg')],
      stock: 90, isFeatured: true, unit: 'g',
      weightOptions: [
        { weight: '85g Box',  price: 320  },
        { weight: '450g Bag', price: 1100 },
        { weight: '900g Box', price: 2100 },
      ],
      tags: ['vital', 'eastern', 'tea', 'danedar'],
      nutritionalInfo: 'Rich in natural antioxidants. Naturally processed tea leaves from top gardens.',
    },

    // RICE & GRAINS
    {
      name: 'Premium Basmati Rice',
      description: 'Extra long grain, aged 2 years. Perfect for Biryani and Pulao. Non-sticky, naturally aromatic.',
      category: C('Rice & Grains'),
      price: 520, discountPrice: 450, costPrice: 360,
      images: [IMG('basmati-rice.jpg')],
      stock: 200, isFeatured: true, unit: 'kg',
      weightOptions: [{ weight: '1KG', price: 450 }, { weight: '5KG', price: 2100 }, { weight: '10KG', price: 4000 }],
      tags: ['basmati', 'rice'],
      nutritionalInfo: 'Carbohydrates: 78g per 100g. Protein: 7g. Low fat.',
      cookingInstructions: 'Rinse 3 times, soak 30 mins, boil with 1.5x water for 15 mins on low heat.',
    },
    {
      name: 'Sela Rice',
      description: 'Parboiled sela rice. Non-sticky, aromatic. Perfect for daily cooking.',
      category: C('Rice & Grains'),
      price: 300, discountPrice: 280, costPrice: 220,
      images: [IMG('sela-rice.jpg')],
      stock: 150, unit: 'kg',
      weightOptions: [{ weight: '1KG', price: 280 }, { weight: '5KG', price: 1350 }, { weight: '10KG', price: 2600 }],
      tags: ['sela', 'rice'],
    },

    // FLOUR & ATTA
    {
      name: 'Chakki Fresh Atta',
      description: 'Fresh-ground whole wheat flour. 100% natural, no additives. Best for soft rotis and parathas.',
      category: C('Flour & Atta'),
      price: 120, discountPrice: 110, costPrice: 82,
      images: [IMG('chakki-atta.jpg')],
      stock: 300, unit: 'kg',
      weightOptions: [{ weight: '5KG', price: 550 }, { weight: '10KG', price: 1050 }, { weight: '20KG', price: 2000 }],
      tags: ['atta', 'flour', 'chakki'],
      nutritionalInfo: 'Carbohydrates: 72g per 100g. Fibre: 10g. Protein: 13g.',
    },

    // COOKING OIL & GHEE
    {
      name: 'Kashmir Premium Gold Cooking Oil',
      description: 'Premium quality refined cooking oil. Light on stomach, high smoke point. Ideal for everyday frying and cooking.',
      category: C('Cooking Oil & Ghee'),
      price: 570, discountPrice: 540, costPrice: 470,
      images: [IMG('kashmir-cooking-oil-pouch.jpeg'), IMG('kashmir-cooking-oil-box.jpeg'), IMG('kashmir-cooking-oil-red.jpg')],
      stock: 120, isFeatured: true, unit: 'litre',
      weightOptions: [{ weight: '1L Pouch', price: 540 }, { weight: '5L Box', price: 2600 }],
      tags: ['kashmir', 'cooking oil', 'premium'],
    },
    {
      name: 'Lagan Cooking Oil',
      description: 'Pure refined cooking oil. Cholesterol free, rich in Omega-3. Great for daily cooking.',
      category: C('Cooking Oil & Ghee'),
      price: 550, discountPrice: 520, costPrice: 450,
      images: [IMG('lagan-cooking-oil-box.jpeg'), IMG('lagan-cooking-oil-pouch.jpeg')],
      stock: 100, unit: 'litre',
      weightOptions: [{ weight: '1L Pouch', price: 520 }, { weight: '5L Box', price: 2500 }],
      tags: ['lagan', 'cooking oil'],
    },
    {
      name: 'Dalda Fortified Cooking Oil',
      description: 'Dalda fortified cooking oil enriched with vitamins A, D & E. Trusted brand for healthy cooking.',
      category: C('Cooking Oil & Ghee'),
      price: 560, discountPrice: 530, costPrice: 460,
      images: [IMG('dalda-cooking-oil-box.jpeg'), IMG('dalda-cooking-oil-pouch.jpg')],
      stock: 80, unit: 'litre',
      weightOptions: [{ weight: '1L', price: 530 }, { weight: '5L', price: 2550 }],
      tags: ['dalda', 'cooking oil', 'fortified'],
    },
    {
      name: 'Seasons Canola Oil',
      description: "The Original Seasons Canola Oil. Naturally rich in Omega-3. Seasons for all the right reasons.",
      category: C('Cooking Oil & Ghee'),
      price: 590, discountPrice: 560, costPrice: 490,
      images: [IMG('seasons-canola-oil-pack.jpeg'), IMG('seasons-canola-oil-pouch.jpeg'), IMG('seasons-canola-oil-box2.jpg')],
      stock: 90, isFeatured: true, unit: 'litre',
      weightOptions: [{ weight: '1L Pouch', price: 560 }, { weight: '5L Pack', price: 2700 }],
      tags: ['seasons', 'canola', 'oil', 'omega3'],
    },
    {
      name: 'Sufi Canola Cooking Oil',
      description: 'Sufi canola oil — pure, light and heart-healthy. Rich in Omega-3 fatty acids.',
      category: C('Cooking Oil & Ghee'),
      price: 590, discountPrice: 560, costPrice: 490,
      images: [IMG('sufi-canola-oil.jpeg'), IMG('sufi-canola-oil-pouch.jpg')],
      stock: 85, unit: 'litre',
      weightOptions: [{ weight: '1L', price: 560 }, { weight: '5L', price: 2700 }],
      tags: ['sufi', 'canola', 'oil'],
    },
    {
      name: 'Kisan Banaspati',
      description: 'Kisan VTF Banaspati — smooth texture, rich flavour. Perfect for parathas, halwa and baking.',
      category: C('Cooking Oil & Ghee'),
      price: 460, discountPrice: 440, costPrice: 380,
      images: [IMG('kisan-banaspati-box.jpeg'), IMG('kisan-banaspati-pouch.jpeg'), IMG('kisan-banaspati-pouch2.jpg')],
      stock: 110, unit: 'kg',
      weightOptions: [{ weight: '1KG', price: 440 }, { weight: '2.5KG', price: 1080 }],
      tags: ['kisan', 'banaspati', 'ghee'],
    },
    {
      name: 'Sufi Special Banaspati',
      description: 'Sufi Special Banaspati Ghee — premium quality, smooth and creamy. Ideal for traditional cooking.',
      category: C('Cooking Oil & Ghee'),
      price: 470, discountPrice: 450, costPrice: 385,
      images: [IMG('sufi-banaspati.jpeg'), IMG('sufi-banaspati-box.jpg')],
      stock: 95, unit: 'kg',
      weightOptions: [{ weight: '1KG', price: 450 }, { weight: '2.5KG', price: 1100 }],
      tags: ['sufi', 'banaspati', 'ghee'],
    },
    {
      name: 'Dalda VTF Banaspati',
      description: "Pakistan's most trusted banaspati. Dalda VTF — fortified with vitamins for healthier cooking.",
      category: C('Cooking Oil & Ghee'),
      price: 470, discountPrice: 450, costPrice: 385,
      images: [IMG('dalda-banaspati-pouch.jpeg'), IMG('dalda-banaspati-box.jpeg'), IMG('dalda-banaspati-5pack.jpg')],
      stock: 100, isFeatured: true, unit: 'kg',
      weightOptions: [{ weight: '1KG', price: 450 }, { weight: '2.5KG', price: 1100 }],
      tags: ['dalda', 'banaspati', 'vtf'],
    },

    {
      name: 'Salva Banaspati',
      description: 'Salva Banaspati — blended with 100% vegetable oils. Contains Vitamin A & D. Premium quality, smooth texture.',
      category: C('Cooking Oil & Ghee'),
      price: 450, discountPrice: 430, costPrice: 370,
      images: [IMG('salva-banaspati.jpg')],
      stock: 90, unit: 'kg',
      weightOptions: [{ weight: '1KG', price: 430 }, { weight: '2.5KG', price: 1050 }],
      tags: ['salva', 'banaspati', 'ghee'],
    },
    {
      name: 'Salva Cooking Oil',
      description: 'Salva Cooking Oil — fortified with Vitamins A & D. Rich in Omega-3 & Omega-6. Light, pure and healthy.',
      category: C('Cooking Oil & Ghee'),
      price: 540, discountPrice: 510, costPrice: 440,
      images: [IMG('salva-cooking-oil.jpg')],
      stock: 90, unit: 'litre',
      weightOptions: [{ weight: '1L', price: 510 }, { weight: '5L', price: 2450 }],
      tags: ['salva', 'cooking oil'],
    },
    {
      name: 'Mezan Banaspati Select',
      description: 'Mezan Banaspati Select — balanced diet, balanced life. Immunity boosters added. Trusted quality.',
      category: C('Cooking Oil & Ghee'),
      price: 450, discountPrice: 430, costPrice: 370,
      images: [IMG('mezan-banaspati.jpg')],
      stock: 85, unit: 'kg',
      weightOptions: [{ weight: '1KG', price: 430 }, { weight: '2.5KG', price: 1050 }],
      tags: ['mezan', 'banaspati', 'ghee'],
    },
    {
      name: 'Lagan Banaspati',
      description: 'Lagan Banaspati — a symbol of quality. Made from vegetable oils. Perfect for everyday cooking and baking.',
      category: C('Cooking Oil & Ghee'),
      price: 440, discountPrice: 420, costPrice: 360,
      images: [IMG('lagan-banaspati.jpg')],
      stock: 90, unit: 'kg',
      weightOptions: [{ weight: '1KG', price: 420 }, { weight: '2.5KG', price: 1020 }],
      tags: ['lagan', 'banaspati', 'ghee'],
    },

    // DAIRY & EGGS
    {
      name: 'Nestle Milkpak Full Cream',
      description: 'Full cream UHT milk. Pasteurized, homogenized. No preservatives. Long shelf life.',
      category: C('Dairy & Eggs'),
      price: 295, discountPrice: 280, costPrice: 240,
      images: [IMG('milkpak.jpg')],
      stock: 200, isFeatured: true, unit: 'litre',
      weightOptions: [{ weight: '0.5L', price: 145 }, { weight: '1L', price: 280 }],
      tags: ['milk', 'nestle', 'dairy', 'uht'],
      nutritionalInfo: 'Calcium: 280mg per glass. Protein: 8g. Vitamin D fortified.',
    },

    // PULSES & LENTILS
    {
      name: 'Dal Chana (Chick Pea)',
      description: 'High protein chick pea lentil. Locally sourced from Punjab farms. Clean and sorted.',
      category: C('Pulses & Lentils'),
      price: 300, discountPrice: 280, costPrice: 220,
      images: [IMG('dal-chana.jpg')],
      stock: 180, unit: 'kg',
      weightOptions: [{ weight: '1KG', price: 280 }, { weight: '5KG', price: 1350 }],
      tags: ['dal', 'chana', 'pulses'],
      nutritionalInfo: 'Protein: 19g per 100g. Fibre: 8g. Iron: 4.3mg.',
      cookingInstructions: 'Soak overnight, boil 30 mins, temper with fried onions and spices.',
    },
    {
      name: 'Masoor Dal (Red Lentils)',
      description: 'Quick-cooking red lentils. Nutritious, no soaking needed. A Pakistani household staple.',
      category: C('Pulses & Lentils'),
      price: 280, discountPrice: 260, costPrice: 200,
      images: [IMG('masoor-dal.jpg')],
      stock: 200, unit: 'kg',
      weightOptions: [{ weight: '1KG', price: 260 }, { weight: '5KG', price: 1250 }],
      tags: ['dal', 'masoor', 'pulses'],
      nutritionalInfo: 'Protein: 26g per 100g. Fibre: 11g. Rich in iron and folate.',
      cookingInstructions: 'Rinse, boil with turmeric 15 mins, add tarka of onions, cumin and tomatoes.',
    },

    // HOUSEHOLD
    {
      name: 'Colgate Herbal Toothpaste',
      description: 'Colgate Herbal — with natural herbal ingredients. Provides strong teeth, healthy gums and fresh breath.',
      category: C('Household'),
      price: 220, discountPrice: 200, costPrice: 160,
      images: [IMG('colgate-herbal-200g.jpeg'), IMG('colgate-herbal-150g.jpeg')],
      stock: 150, isFeatured: true, unit: 'tube',
      weightOptions: [{ weight: '150g', price: 180 }, { weight: '200g', price: 220 }],
      tags: ['colgate', 'herbal', 'toothpaste'],
    },
    {
      name: 'Colgate MaxFresh Toothpaste',
      description: 'Colgate MaxFresh with mini breath strips. Extra strong cooling sensation for long-lasting freshness.',
      category: C('Household'),
      price: 180, discountPrice: 165, costPrice: 130,
      images: [IMG('colgate-maxfresh-125g.jpeg'), IMG('colgate-maxfresh-75g.jpeg')],
      stock: 150, unit: 'tube',
      weightOptions: [{ weight: '75g', price: 120 }, { weight: '125g', price: 180 }],
      tags: ['colgate', 'maxfresh', 'toothpaste'],
    },
    {
      name: "Forhan's Toothpaste",
      description: "Forhan's — the gum specialist. Strengthens gums and prevents bleeding. Trusted formula since decades.",
      category: C('Household'),
      price: 180, discountPrice: 165, costPrice: 130,
      images: [IMG('forhans-toothpaste-180g.jpeg'), IMG('forhans-toothpaste-40g.jpeg')],
      stock: 120, unit: 'tube',
      weightOptions: [{ weight: '40g', price: 90 }, { weight: '180g', price: 280 }],
      tags: ['forhans', 'toothpaste', 'gums'],
    },
    {
      name: 'Medicam Dental Cream',
      description: 'Medicam Dental Cream — fights cavities, whitens teeth and freshens breath. Value for money.',
      category: C('Household'),
      price: 130, discountPrice: 115, costPrice: 90,
      images: [IMG('medicam-dental-cream.jpeg')],
      stock: 180, unit: 'tube',
      weightOptions: [{ weight: '120g', price: 115 }],
      tags: ['medicam', 'dental', 'toothpaste'],
    },
  ];

  await Product.insertMany(products);
  console.log(`✅ ${products.length} products seeded with real product images`);

  console.log('\n🎉 SellMix seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin  →  03001234567  /  admin123');
  console.log('API    →  http://localhost:5000');
  console.log('Admin  →  http://localhost:3001');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
