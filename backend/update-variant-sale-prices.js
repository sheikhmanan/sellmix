const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

// Format: { name, price (S base), discountPrice (D base), costPrice,
//           weightOptions: [{ weight, price (S/MRP), salePrice (D/actual) }] }
// salePrice = 0 means no discount for that variant (just show price)

const UPDATES = [

  // ── Nestle Milo Active Go ────────────────────────────────────────────────
  { name: 'Nestle Milo Active Go', price: 60, discountPrice: 0, costPrice: 56,
    weightOptions: [
      { weight: '15g sachet', price: 60,   salePrice: 0    },
      { weight: '150g',       price: 460,  salePrice: 455  },
      { weight: '500g',       price: 1580, salePrice: 1570 },
    ] },

  // ── Nestle Milo ──────────────────────────────────────────────────────────
  { name: 'Nestle Milo', price: 460, discountPrice: 460, costPrice: 450,
    weightOptions: [
      { weight: '150g', price: 460,  salePrice: 0    },
      { weight: '300g', price: 1070, salePrice: 1060 },
    ] },

  // ── Olpers ───────────────────────────────────────────────────────────────
  { name: 'Olpers Chaunsa Mango', price: 95, discountPrice: 0, costPrice: 90,
    weightOptions: [{ weight: '180ml', price: 95, salePrice: 0 }] },

  { name: 'Olpers Strawberry', price: 95, discountPrice: 0, costPrice: 90,
    weightOptions: [{ weight: '180ml', price: 95, salePrice: 0 }] },

  { name: 'Olpers Badam Zafran', price: 95, discountPrice: 0, costPrice: 90,
    weightOptions: [{ weight: '180ml', price: 95, salePrice: 0 }] },

  // ── Hamdard ──────────────────────────────────────────────────────────────
  { name: 'Hamdard Rooh Afza', price: 525, discountPrice: 520, costPrice: 500,
    weightOptions: [{ weight: '800ml', price: 525, salePrice: 520 }] },

  // ── Lipton ───────────────────────────────────────────────────────────────
  { name: 'Lipton Danedar Strong Tea', price: 200, discountPrice: 0, costPrice: 180,
    weightOptions: [
      { weight: '70g',  price: 200,  salePrice: 0    },
      { weight: '475g', price: 1500, salePrice: 1480 },
    ] },

  { name: 'Lipton Green Tea', price: 300, discountPrice: 290, costPrice: 260,
    weightOptions: [{ weight: '25 bags', price: 300, salePrice: 290 }] },

  { name: 'Lipton Yellow Label Tea', price: 200, discountPrice: 0, costPrice: 180,
    weightOptions: [
      { weight: '70g',  price: 200,  salePrice: 0    },
      { weight: '430g', price: 1050, salePrice: 1030 },
      { weight: '900g', price: 1990, salePrice: 1950 },
    ] },

  // ── Vital Premium Black Tea ───────────────────────────────────────────────
  { name: 'Vital Premium Black Tea', price: 190, discountPrice: 0, costPrice: 170,
    weightOptions: [
      { weight: '85g',  price: 190,  salePrice: 0    },
      { weight: '170g', price: 380,  salePrice: 375  },
      { weight: '430g', price: 900,  salePrice: 880  },
      { weight: '900g', price: 1800, salePrice: 1760 },
    ] },

  // ── Nescafe ───────────────────────────────────────────────────────────────
  { name: 'Nescafe Classic Coffee', price: 2120, discountPrice: 2100, costPrice: 2080,
    weightOptions: [{ weight: '100g', price: 2120, salePrice: 2100 }] },

  { name: 'Nescafe Gold Blend Coffee', price: 2700, discountPrice: 0, costPrice: 2650,
    weightOptions: [{ weight: '200g', price: 2700, salePrice: 0 }] },

  { name: 'Nescafe Chilled Latte',          price: 170, discountPrice: 0, costPrice: 160,
    weightOptions: [{ weight: '220ml', price: 170, salePrice: 0 }] },

  { name: 'Nescafe Chilled Mocha',          price: 170, discountPrice: 0, costPrice: 160,
    weightOptions: [{ weight: '220ml', price: 170, salePrice: 0 }] },

  { name: 'Nescafe Chilled Hazelnut',       price: 170, discountPrice: 0, costPrice: 160,
    weightOptions: [{ weight: '220ml', price: 170, salePrice: 0 }] },

  { name: 'Nescafe Chilled White Choc Mocha', price: 170, discountPrice: 0, costPrice: 160,
    weightOptions: [{ weight: '220ml', price: 170, salePrice: 0 }] },

  // ── Nestle Everyday Tea Whitener (fix variant: 15g sachet → 250g) ────────
  { name: 'Nestle Everyday Tea Whitener', price: 30, discountPrice: 0, costPrice: 28,
    weightOptions: [{ weight: '250g', price: 30, salePrice: 0 }] },

  // ── Tapal Green Teas ──────────────────────────────────────────────────────
  { name: 'Tapal Green Tea Jasmine',        price: 250, discountPrice: 245, costPrice: 230,
    weightOptions: [{ weight: '30 bags', price: 250, salePrice: 245 }] },

  { name: 'Tapal Green Tea Selection Pack', price: 260, discountPrice: 0, costPrice: 250,
    weightOptions: [{ weight: '32 bags', price: 260, salePrice: 0 }] },

  { name: 'Tapal Green Tea Tropical Peach', price: 250, discountPrice: 0, costPrice: 230,
    weightOptions: [{ weight: '30 bags', price: 250, salePrice: 0 }] },

  { name: 'Tapal Green Tea Strawberry',     price: 250, discountPrice: 0, costPrice: 235,
    weightOptions: [{ weight: '30 bags', price: 250, salePrice: 0 }] },

  { name: 'Tapal Green Tea Elaichi',        price: 250, discountPrice: 245, costPrice: 235,
    weightOptions: [{ weight: '30 bags', price: 250, salePrice: 245 }] },

  { name: 'Tapal Green Tea Lemon',          price: 250, discountPrice: 245, costPrice: 235,
    weightOptions: [{ weight: '30 bags', price: 250, salePrice: 245 }] },

  // ── Tapal Danedar Elaichi ─────────────────────────────────────────────────
  { name: 'Tapal Danedar Elaichi Tea', price: 220, discountPrice: 0, costPrice: 200,
    weightOptions: [{ weight: '170g', price: 220, salePrice: 0 }] },

  // ── Tapal Family Mixture Tea ──────────────────────────────────────────────
  { name: 'Tapal Family Mixture Tea', price: 190, discountPrice: 0, costPrice: 180,
    weightOptions: [
      { weight: '85g',  price: 190,  salePrice: 0    },
      { weight: '170g', price: 380,  salePrice: 0    },
      { weight: '430g', price: 900,  salePrice: 890  },
      { weight: '900g', price: 1800, salePrice: 1780 },
    ] },

  // ── Tapal Tezdum Tea ──────────────────────────────────────────────────────
  { name: 'Tapal Tezdum Tea', price: 190, discountPrice: 0, costPrice: 180,
    weightOptions: [
      { weight: '85g',  price: 190,  salePrice: 0    },
      { weight: '170g', price: 380,  salePrice: 0    },
      { weight: '430g', price: 900,  salePrice: 890  },
      { weight: '900g', price: 1800, salePrice: 1780 },
    ] },

  // ── Tapal Danedar Tea Bags ────────────────────────────────────────────────
  { name: 'Tapal Danedar Tea Bags', price: 250, discountPrice: 240, costPrice: 235,
    weightOptions: [
      { weight: '25 bags',  price: 250,  salePrice: 240 },
      { weight: '50 bags',  price: 500,  salePrice: 495 },
      { weight: '100 bags', price: 1000, salePrice: 980 },
    ] },

  // ── Tapal Danedar Tea ─────────────────────────────────────────────────────
  { name: 'Tapal Danedar Tea', price: 190, discountPrice: 0, costPrice: 180,
    weightOptions: [
      { weight: '85g',  price: 190,  salePrice: 0    },
      { weight: '170g', price: 380,  salePrice: 375  },
      { weight: '350g', price: 720,  salePrice: 700  },
      { weight: '430g', price: 830,  salePrice: 810  },
      { weight: '900g', price: 1800, salePrice: 1790 },
    ] },

  // ── Tapal Danedar Value Pack ──────────────────────────────────────────────
  { name: 'Tapal Danedar Value Pack', price: 830, discountPrice: 810, costPrice: 750,
    weightOptions: [
      { weight: '430g', price: 830,  salePrice: 810  },
      { weight: '900g', price: 1800, salePrice: 1790 },
    ] },

  // ── Brooke Bond Supreme Tea (partial — only 160g has price) ──────────────
  { name: 'Brooke Bond Supreme Tea', price: 380, discountPrice: 370, costPrice: 350,
    weightOptions: [
      { weight: '160g', price: 380,  salePrice: 370  },
      { weight: '430g', price: 1350, salePrice: 0    },
      { weight: '900g', price: 2750, salePrice: 0    },
    ] },

  // ── Nestle Nido ───────────────────────────────────────────────────────────
  { name: 'Nestle Nido Milk Powder', price: 1100, discountPrice: 1090, costPrice: 1050,
    weightOptions: [
      { weight: '400g', price: 1100, salePrice: 1090 },
      { weight: '900g', price: 2500, salePrice: 2480 },
    ] },

  // ── Soft Drinks ───────────────────────────────────────────────────────────
  { name: 'Mountain Dew', price: 100, discountPrice: 0, costPrice: 90,
    weightOptions: [
      { weight: '500ml', price: 100, salePrice: 0   },
      { weight: '1L',    price: 155, salePrice: 150 },
      { weight: '1.5L',  price: 175, salePrice: 170 },
    ] },

  { name: 'Mirinda Orange', price: 100, discountPrice: 0, costPrice: 90,
    weightOptions: [
      { weight: '500ml', price: 100, salePrice: 0   },
      { weight: '1L',    price: 155, salePrice: 150 },
      { weight: '1.5L',  price: 190, salePrice: 180 },
    ] },

  { name: 'Fanta Orange', price: 105, discountPrice: 100, costPrice: 90,
    weightOptions: [{ weight: '250ml', price: 105, salePrice: 100 }] },

  { name: 'Coca-Cola', price: 115, discountPrice: 0, costPrice: 110,
    weightOptions: [
      { weight: '250ml', price: 115, salePrice: 0   },
      { weight: '500ml', price: 105, salePrice: 100 },
      { weight: '1L',    price: 170, salePrice: 165 },
      { weight: '1.5L',  price: 210, salePrice: 190 },
    ] },

  { name: 'Sprite', price: 115, discountPrice: 0, costPrice: 100,
    weightOptions: [
      { weight: '250ml', price: 115, salePrice: 0   },
      { weight: '350ml', price: 120, salePrice: 115 },
      { weight: '500ml', price: 105, salePrice: 0   },
      { weight: '1L',    price: 170, salePrice: 160 },
      { weight: '1.5L',  price: 210, salePrice: 190 },
    ] },

  { name: '7UP', price: 75, discountPrice: 70, costPrice: 60,
    weightOptions: [
      { weight: '345ml', price: 75,  salePrice: 70  },
      { weight: '500ml', price: 105, salePrice: 100 },
      { weight: '1L',    price: 155, salePrice: 145 },
      { weight: '1.5L',  price: 150, salePrice: 0   },
    ] },

  { name: 'Pepsi', price: 105, discountPrice: 100, costPrice: 95,
    weightOptions: [
      { weight: '250ml',      price: 105, salePrice: 100 },
      { weight: '250ml Diet', price: 105, salePrice: 100 },
    ] },

  // ── Juices ────────────────────────────────────────────────────────────────
  { name: 'Nestle Nesfruita Apple', price: 55, discountPrice: 0, costPrice: 50,
    weightOptions: [
      { weight: '200ml', price: 55,  salePrice: 0   },
      { weight: '1L',    price: 160, salePrice: 150 },
    ] },

  { name: 'Nestle Nesfruita Mango', price: 55, discountPrice: 0, costPrice: 50,
    weightOptions: [
      { weight: '200ml', price: 55,  salePrice: 0   },
      { weight: '1L',    price: 160, salePrice: 150 },
    ] },

  { name: 'Fresher Mango Nectar', price: 90, discountPrice: 0, costPrice: 75,
    weightOptions: [
      { weight: '350ml', price: 90,  salePrice: 0   },
      { weight: '500ml', price: 120, salePrice: 0   },
      { weight: '1L',    price: 220, salePrice: 0   },
    ] },

  { name: 'Fresher Strawberry Fruit Drink', price: 120, discountPrice: 0, costPrice: 100,
    weightOptions: [{ weight: '500ml', price: 120, salePrice: 0 }] },

  { name: 'Fruita Vital Sparkling Apple', price: 150, discountPrice: 0, costPrice: 140,
    weightOptions: [{ weight: '250ml', price: 150, salePrice: 0 }] },

  { name: 'Nestle Fruita Vitals Orange',    price: 390, discountPrice: 0, costPrice: 380,
    weightOptions: [{ weight: '1L', price: 390, salePrice: 0 }] },

  { name: 'Nestle Fruita Vitals Red Grapes', price: 500, discountPrice: 0, costPrice: 470,
    weightOptions: [{ weight: '1L', price: 500, salePrice: 0 }] },

  { name: 'Nestle Fruita Vitals Pineapple', price: 475, discountPrice: 0, costPrice: 460,
    weightOptions: [{ weight: '1L', price: 475, salePrice: 0 }] },

  { name: 'Nestle Fruita Vitals Guava',     price: 340, discountPrice: 0, costPrice: 330,
    weightOptions: [{ weight: '1L', price: 340, salePrice: 0 }] },

  { name: 'Nestle Fruita Vitals Chaunsa',   price: 70,  discountPrice: 0, costPrice: 60,
    weightOptions: [
      { weight: '200ml', price: 70,  salePrice: 0 },
      { weight: '1L',    price: 390, salePrice: 0 },
    ] },

  { name: 'Nestle Fruita Vitals Apple',     price: 75,  discountPrice: 0, costPrice: 70,
    weightOptions: [
      { weight: '200ml', price: 75,  salePrice: 0 },
      { weight: '1L',    price: 340, salePrice: 0 },
    ] },

  { name: 'Nestle Fruita Vitals Peach',     price: 75,  discountPrice: 0, costPrice: 70,
    weightOptions: [
      { weight: '200ml', price: 75,  salePrice: 0 },
      { weight: '1L',    price: 390, salePrice: 0 },
    ] },

  { name: 'Nestle Fruita Vitals Mango',     price: 75,  discountPrice: 0, costPrice: 70,
    weightOptions: [
      { weight: '200ml', price: 75,  salePrice: 0 },
      { weight: '1L',    price: 390, salePrice: 0 },
    ] },

  // ── Energy Drinks ─────────────────────────────────────────────────────────
  { name: 'Red Bull Energy Drink', price: 500, discountPrice: 0, costPrice: 480,
    weightOptions: [{ weight: '250ml', price: 500, salePrice: 0 }] },

  { name: 'Sting Energy Drink', price: 85, discountPrice: 65, costPrice: 75,
    weightOptions: [{ weight: '250ml', price: 85, salePrice: 65 }] },

  // ── Sharbat ───────────────────────────────────────────────────────────────
  { name: 'Qarshi Sharbat Sandaleen', price: 500, discountPrice: 490, costPrice: 480,
    weightOptions: [{ weight: '800ml', price: 500, salePrice: 490 }] },

  { name: 'Qarshi Sharbat Ilacheen', price: 500, discountPrice: 490, costPrice: 480,
    weightOptions: [{ weight: '800ml', price: 500, salePrice: 490 }] },

  { name: 'Mitchells Lemon Squash', price: 400, discountPrice: 390, costPrice: 380,
    weightOptions: [{ weight: '800ml', price: 400, salePrice: 390 }] },

  { name: 'Mitchells Orange Squash', price: 400, discountPrice: 390, costPrice: 380,
    weightOptions: [{ weight: '800ml', price: 400, salePrice: 390 }] },

  { name: 'Qarshi Jam-e-Shirin', price: 550, discountPrice: 498, costPrice: 490,
    weightOptions: [
      { weight: '800ml',  price: 550, salePrice: 498 },
      { weight: '1500ml', price: 925, salePrice: 895 },
    ] },

  { name: 'Qarshi Jam-e-Shirin Sugar Free', price: 500, discountPrice: 495, costPrice: 480,
    weightOptions: [{ weight: '800ml', price: 500, salePrice: 495 }] },

  { name: 'Qarshi Sarbat Bazooreen', price: 500, discountPrice: 490, costPrice: 480,
    weightOptions: [{ weight: '800ml', price: 500, salePrice: 490 }] },
];


const run = async () => {
  await connectDB();
  let updated = 0, notFound = 0;

  for (const p of UPDATES) {
    const existing = await Product.findOne({ name: p.name });
    if (!existing) {
      console.log(`  ⚠️   Not found: ${p.name}`);
      notFound++;
      continue;
    }

    await Product.updateOne({ _id: existing._id }, {
      $set: {
        price:         p.price,
        discountPrice: p.discountPrice,
        costPrice:     p.costPrice,
        weightOptions: p.weightOptions.map(w => ({
          weight:    w.weight,
          price:     w.price,
          salePrice: w.salePrice || 0,
          image:     existing.weightOptions?.find(e => e.weight === w.weight)?.image || '',
        })),
      }
    });
    console.log(`  ✅  ${p.name}`);
    updated++;
  }

  console.log(`\n🎉 Done — ${updated} updated, ${notFound} not found`);
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
