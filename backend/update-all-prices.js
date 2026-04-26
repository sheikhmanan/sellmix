const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

// Format: { name, price (S), discountPrice (D), costPrice (C), weightOptions?: [{weight, price}] }
// For multi-variant products: base price = smallest/first variant's S
// weightOptions only supports: weight + price (no D/C per variant in schema)

const UPDATES = [

  // ── Grocery: Already correct, but re-confirming ──────────────────────────
  { name: 'Desi Gur (Jaggery)',                price: 120,  discountPrice: 110,  costPrice: 100 },
  { name: 'Sugar (Cheeni)',                     price: 145,  discountPrice: 143,  costPrice: 140 },
  { name: 'Baisin (Gram Flour)',                price: 240,  discountPrice: 230,  costPrice: 210 },
  { name: 'Jalwatri (Mace)',                    price: 220,  discountPrice: 200,  costPrice: 175 },
  { name: 'Anaar Dana (Pomegranate Seeds)',      price: 100,  discountPrice: 90,   costPrice: 75  },
  { name: 'Loong (Cloves)',                     price: 180,  discountPrice: 160,  costPrice: 150 },
  { name: 'Dar Chini (Cinnamon)',               price: 60,   discountPrice: 55,   costPrice: 45  },

  { name: 'Black Pepper (Kali Mirch)',          price: 165,  discountPrice: 150,  costPrice: 130,
    weightOptions: [{ weight: '50g', price: 165 }, { weight: '100g', price: 330 }] },

  { name: 'White Pepper Whole (Safaid Mirch Sabit)', price: 160, discountPrice: 150, costPrice: 125,
    weightOptions: [{ weight: '50g', price: 160 }, { weight: '100g', price: 320 }] },

  { name: 'White Pepper Powder (Safaid Mirch Powder)', price: 170, discountPrice: 160, costPrice: 135,
    weightOptions: [{ weight: '50g', price: 170 }, { weight: '100g', price: 340 }] },

  { name: 'Saunf (Fennel Seeds)',               price: 60,   discountPrice: 50,   costPrice: 40,
    weightOptions: [{ weight: '50g', price: 60 }, { weight: '100g', price: 120 }] },

  { name: 'Choti Elaichi (Green Cardamom)',      price: 450,  discountPrice: 430,  costPrice: 350,
    weightOptions: [{ weight: '25g', price: 450 }, { weight: '50g', price: 900 }] },

  { name: 'Imli (Tamarind)',                    price: 70,   discountPrice: 65,   costPrice: 60,
    weightOptions: [{ weight: '100g', price: 70 }, { weight: '200g', price: 140 }] },

  { name: 'Badi Elaichi (Black Cardamom)',       price: 220,  discountPrice: 210,  costPrice: 180,
    weightOptions: [{ weight: '25g', price: 220 }, { weight: '50g', price: 440 }] },

  { name: 'Haldi Powder (Turmeric)',             price: 100,  discountPrice: 90,   costPrice: 80,
    weightOptions: [{ weight: '200g', price: 100 }, { weight: '500g', price: 260 }] },

  { name: 'Red Chili Flakes',                   price: 230,  discountPrice: 210,  costPrice: 200,
    weightOptions: [{ weight: '250g', price: 230 }] },

  { name: 'Red Chili Powder',                   price: 90,   discountPrice: 80,   costPrice: 70,
    weightOptions: [{ weight: '100g', price: 90 }, { weight: '200g', price: 180 }] },

  // Pulse
  { name: 'Red Lobia (Surkh Lobia)',            price: 240,  discountPrice: 220,  costPrice: 210,
    weightOptions: [{ weight: '500g', price: 240 }, { weight: '1kg', price: 480 }] },

  { name: 'Masoor Whole Bold (Masoor Sabit Mota)', price: 130, discountPrice: 115, costPrice: 110,
    weightOptions: [{ weight: '500g', price: 130 }, { weight: '1kg', price: 260 }] },

  { name: 'Mash Whole (Mash Sabit)',             price: 240,  discountPrice: 220,  costPrice: 210,
    weightOptions: [{ weight: '500g', price: 240 }, { weight: '1kg', price: 480 }] },

  { name: 'Mong Whole (Mong Sabit)',             price: 240,  discountPrice: 230,  costPrice: 210,
    weightOptions: [{ weight: '500g', price: 240 }, { weight: '1kg', price: 480 }] },

  { name: 'White Lobia (Safaid Lobia)',          price: 180,  discountPrice: 160,  costPrice: 150,
    weightOptions: [{ weight: '500g', price: 180 }, { weight: '1kg', price: 360 }] },

  { name: 'Dal Mash Shelled (Daal Maash Chilka)', price: 240, discountPrice: 230,  costPrice: 200,
    weightOptions: [{ weight: '500g', price: 240 }, { weight: '1kg', price: 480 }] },

  { name: 'Dal Mash Washed (Daal Maash Dhuli)',  price: 280,  discountPrice: 270,  costPrice: 260,
    weightOptions: [{ weight: '500g', price: 280 }, { weight: '1kg', price: 560 }] },

  { name: 'Black Chana (Kala Chana)',            price: 120,  discountPrice: 115,  costPrice: 110,
    weightOptions: [{ weight: '500g', price: 120 }, { weight: '1kg', price: 240 }] },

  { name: 'White Chana Bold (Safaid Chana Mota)', price: 180, discountPrice: 175,  costPrice: 160,
    weightOptions: [{ weight: '500g', price: 180 }, { weight: '1kg', price: 360 }] },

  { name: 'White Chana Fine (Safaid Chana Barik)', price: 150, discountPrice: 140, costPrice: 130,
    weightOptions: [{ weight: '500g', price: 150 }, { weight: '1kg', price: 300 }] },

  { name: 'Moong Dal Chilka',                   price: 240,  discountPrice: 215,  costPrice: 205,
    weightOptions: [{ weight: '500g', price: 240 }, { weight: '1kg', price: 440 }] },

  { name: 'Moong Dal Washed',                   price: 210,  discountPrice: 190,  costPrice: 180,
    weightOptions: [{ weight: '500g', price: 210 }, { weight: '1000g', price: 420 }] },

  { name: 'Chana Dal (Chick Pea)',               price: 125,  discountPrice: 115,  costPrice: 105,
    weightOptions: [{ weight: '500g', price: 125 }, { weight: '1kg', price: 250 }] },

  { name: 'Masoor Dal (Red Lentils)',            price: 125,  discountPrice: 120,  costPrice: 110,
    weightOptions: [{ weight: '500g', price: 125 }, { weight: '1kg', price: 250 }] },

  // Rice
  { name: 'Adhwar Rice',                        price: 280,  discountPrice: 270,  costPrice: 250,
    weightOptions: [{ weight: '1kg', price: 280 }, { weight: '5kg', price: 1400 }] },

  { name: 'Double Steam 1121 Kainat Rice',       price: 450,  discountPrice: 420,  costPrice: 400,
    weightOptions: [{ weight: '1kg', price: 450 }, { weight: '5kg', price: 4950 }] },

  { name: 'Sella Rice',                         price: 400,  discountPrice: 380,  costPrice: 360,
    weightOptions: [{ weight: '3kg', price: 400 }, { weight: '5kg', price: 2000 }] },

  // Ghee / Banaspati
  { name: 'Salva Banaspati',                    price: 555,  discountPrice: 550,  costPrice: 550,
    weightOptions: [{ weight: '1kg', price: 555 }, { weight: '5kg', price: 2850 }] },

  { name: 'Mezan Banaspati Select',              price: 550,  discountPrice: 545,  costPrice: 545,
    weightOptions: [{ weight: '1kg', price: 550 }, { weight: '5kg', price: 2750 }] },

  { name: 'Nemat Banaspati',                    price: 555,  discountPrice: 552,  costPrice: 552,
    weightOptions: [{ weight: '1kg', price: 555 }, { weight: '5kg', price: 2900 }] },

  { name: 'Sufi Special Banaspati',              price: 596,  discountPrice: 595,  costPrice: 595,
    weightOptions: [{ weight: '1kg', price: 596 }, { weight: '5kg', price: 2975 }] },

  { name: 'Kisan Banaspati',                    price: 540,  discountPrice: 530,  costPrice: 530,
    weightOptions: [{ weight: '1kg', price: 540 }, { weight: '5kg', price: 2700 }] },

  { name: 'Dalda VTF Banaspati',                price: 592,  discountPrice: 0,    costPrice: 590,
    weightOptions: [{ weight: '1kg', price: 592 }, { weight: '5kg', price: 2990 }] },

  // Edible Oil
  { name: 'Dalda Fortified Cooking Oil',         price: 590,  discountPrice: 585,  costPrice: 585,
    weightOptions: [{ weight: '1L', price: 590 }, { weight: '5L', price: 2950 }] },

  { name: 'Seasons Canola Oil',                 price: 580,  discountPrice: 575,  costPrice: 575,
    weightOptions: [{ weight: '1L', price: 580 }, { weight: '5L', price: 2900 }] },

  { name: 'Sufi Canola Cooking Oil',             price: 592,  discountPrice: 590,  costPrice: 590,
    weightOptions: [{ weight: '1L', price: 592 }, { weight: '5L', price: 2960 }] },

  { name: 'Salva Cooking Oil',                  price: 560,  discountPrice: 0,    costPrice: 550,
    weightOptions: [{ weight: '1L', price: 560 }] },

  { name: 'Saba Cooking Oil',                   price: 2800, discountPrice: 0,    costPrice: 2770,
    weightOptions: [{ weight: '5L', price: 2800 }] },

  { name: 'Nemat Cooking Oil',                  price: 570,  discountPrice: 0,    costPrice: 565,
    weightOptions: [{ weight: '1L', price: 570 }, { weight: '5L', price: 2850 }] },

  { name: 'Kashmir Premium Gold Cooking Oil',   price: 590,  discountPrice: 0,    costPrice: 585,
    weightOptions: [{ weight: '1L', price: 590 }, { weight: '5L', price: 2950 }] },

  // National Masalas (already updated, re-confirming)
  { name: 'National Biryani Masala',            price: 150,  discountPrice: 145,  costPrice: 125 },
  { name: 'National Chicken Tandoori Mix',       price: 150,  discountPrice: 145,  costPrice: 125 },
  { name: 'National Garam Masala',              price: 150,  discountPrice: 145,  costPrice: 125 },
  { name: 'National Kaleji Masala',             price: 150,  discountPrice: 145,  costPrice: 125 },
  { name: 'National Malai Boti Mix',            price: 150,  discountPrice: 145,  costPrice: 125 },
  { name: 'National Murghi Masala',             price: 150,  discountPrice: 145,  costPrice: 125 },
  { name: 'National Paya Masala',               price: 150,  discountPrice: 145,  costPrice: 125 },
  { name: 'National Pulao Masala',              price: 150,  discountPrice: 145,  costPrice: 125 },
  { name: 'National Qeema Masala',              price: 150,  discountPrice: 145,  costPrice: 125 },
  { name: 'National Seekh Kabab Mix',           price: 150,  discountPrice: 145,  costPrice: 125 },
  { name: 'National Tikka Boti Mix',            price: 150,  discountPrice: 145,  costPrice: 125 },

  // ── Drinks ───────────────────────────────────────────────────────────────

  // Tang
  { name: 'Tang Pineapple',                     price: 100,  discountPrice: 98,   costPrice: 95,
    weightOptions: [{ weight: '125g', price: 100 }, { weight: '375g', price: 350 }] },

  { name: 'Tang Lemon Pepper',                  price: 100,  discountPrice: 98,   costPrice: 95,
    weightOptions: [{ weight: '130g', price: 100 }, { weight: '375g', price: 350 }] },

  { name: 'Tang Mango',                         price: 350,  discountPrice: 345,  costPrice: 340,
    weightOptions: [{ weight: '375g', price: 350 }, { weight: '750g', price: 830 }] },

  { name: 'Tang Orange',                        price: 100,  discountPrice: 98,   costPrice: 95,
    weightOptions: [{ weight: '130g', price: 100 }, { weight: '375g', price: 350 }] },

  // Sharbat
  { name: 'Qarshi Sharbat Ilacheen',            price: 500,  discountPrice: 490,  costPrice: 480,
    weightOptions: [{ weight: '800ml', price: 500 }] },

  { name: 'Mitchells Lemon Squash',             price: 400,  discountPrice: 390,  costPrice: 380,
    weightOptions: [{ weight: '800ml', price: 400 }] },

  { name: 'Mitchells Orange Squash',            price: 400,  discountPrice: 390,  costPrice: 380,
    weightOptions: [{ weight: '800ml', price: 400 }] },

  { name: 'Qarshi Jam-e-Shirin',                price: 550,  discountPrice: 498,  costPrice: 490,
    weightOptions: [{ weight: '800ml', price: 550 }, { weight: '1500ml', price: 925 }] },

  { name: 'Qarshi Jam-e-Shirin Sugar Free',     price: 500,  discountPrice: 495,  costPrice: 480,
    weightOptions: [{ weight: '800ml', price: 500 }] },

  { name: 'Qarshi Sarbat Bazooreen',            price: 500,  discountPrice: 490,  costPrice: 480,
    weightOptions: [{ weight: '800ml', price: 500 }] },

  { name: 'Qarshi Sharbat Sandaleen',           price: 500,  discountPrice: 490,  costPrice: 480,
    weightOptions: [{ weight: '800ml', price: 500 }] },

  // Nestle Milo Active Go
  { name: 'Nestle Milo Active Go',              price: 60,   discountPrice: 0,    costPrice: 56,
    weightOptions: [
      { weight: '15g sachet', price: 60 },
      { weight: '150g', price: 460 },
      { weight: '500g', price: 1580 },
    ] },

  // Nestle Milo (regular)
  { name: 'Nestle Milo',                        price: 460,  discountPrice: 460,  costPrice: 450,
    weightOptions: [{ weight: '150g', price: 460 }, { weight: '300g', price: 1070 }] },

  // Olpers
  { name: 'Olpers Chaunsa Mango',               price: 95,   discountPrice: 95,   costPrice: 90,
    weightOptions: [{ weight: '180ml', price: 95 }] },

  { name: 'Olpers Strawberry',                  price: 95,   discountPrice: 95,   costPrice: 90,
    weightOptions: [{ weight: '180ml', price: 95 }] },

  { name: 'Olpers Badam Zafran',                price: 95,   discountPrice: 95,   costPrice: 90,
    weightOptions: [{ weight: '180ml', price: 95 }] },

  // Hamdard
  { name: 'Hamdard Rooh Afza',                  price: 525,  discountPrice: 520,  costPrice: 500,
    weightOptions: [{ weight: '800ml', price: 525 }] },

  // Lipton
  { name: 'Lipton Danedar Strong Tea',          price: 200,  discountPrice: 200,  costPrice: 180,
    weightOptions: [{ weight: '70g', price: 200 }, { weight: '475g', price: 1500 }] },

  { name: 'Lipton Green Tea',                   price: 300,  discountPrice: 290,  costPrice: 260,
    weightOptions: [{ weight: '25 bags', price: 300 }] },

  { name: 'Lipton Yellow Label Tea',            price: 200,  discountPrice: 200,  costPrice: 180,
    weightOptions: [
      { weight: '70g',  price: 200  },
      { weight: '430g', price: 1050 },
      { weight: '900g', price: 1990 },
    ] },

  // Vital Premium Black Tea
  { name: 'Vital Premium Black Tea',            price: 190,  discountPrice: 190,  costPrice: 170,
    weightOptions: [
      { weight: '85g',  price: 190  },
      { weight: '170g', price: 380  },
      { weight: '430g', price: 900  },
      { weight: '900g', price: 1800 },
    ] },

  // Nescafe
  { name: 'Nescafe Classic Coffee',             price: 2120, discountPrice: 2100, costPrice: 2080,
    weightOptions: [{ weight: '100g', price: 2120 }] },

  { name: 'Nescafe Gold Blend Coffee',          price: 2700, discountPrice: 2700, costPrice: 2650,
    weightOptions: [{ weight: '200g', price: 2700 }] },

  { name: 'Nescafe Chilled Latte',              price: 170,  discountPrice: 170,  costPrice: 160,
    weightOptions: [{ weight: '220ml', price: 170 }] },

  { name: 'Nescafe Chilled Mocha',              price: 170,  discountPrice: 170,  costPrice: 160,
    weightOptions: [{ weight: '220ml', price: 170 }] },

  { name: 'Nescafe Chilled Hazelnut',           price: 170,  discountPrice: 170,  costPrice: 160,
    weightOptions: [{ weight: '220ml', price: 170 }] },

  { name: 'Nescafe Chilled White Choc Mocha',   price: 170,  discountPrice: 170,  costPrice: 160,
    weightOptions: [{ weight: '220ml', price: 170 }] },

  // Nestle Everyday Tea Whitener
  { name: 'Nestle Everyday Tea Whitener',       price: 30,   discountPrice: 30,   costPrice: 28 },

  // Tapal
  { name: 'Tapal Green Tea Jasmine',            price: 250,  discountPrice: 245,  costPrice: 230,
    weightOptions: [{ weight: '30 bags', price: 250 }] },

  { name: 'Tapal Green Tea Selection Pack',     price: 260,  discountPrice: 260,  costPrice: 250,
    weightOptions: [{ weight: '32 bags', price: 260 }] },

  { name: 'Tapal Green Tea Tropical Peach',     price: 250,  discountPrice: 250,  costPrice: 230,
    weightOptions: [{ weight: '30 bags', price: 250 }] },

  { name: 'Tapal Green Tea Strawberry',         price: 250,  discountPrice: 250,  costPrice: 235,
    weightOptions: [{ weight: '30 bags', price: 250 }] },

  { name: 'Tapal Green Tea Elaichi',            price: 250,  discountPrice: 245,  costPrice: 235,
    weightOptions: [{ weight: '30 bags', price: 250 }] },

  { name: 'Tapal Green Tea Lemon',              price: 250,  discountPrice: 245,  costPrice: 235,
    weightOptions: [{ weight: '30 bags', price: 250 }] },

  { name: 'Tapal Danedar Elaichi Tea',          price: 220,  discountPrice: 220,  costPrice: 200,
    weightOptions: [{ weight: '170g', price: 220 }] },

  { name: 'Tapal Family Mixture Tea',           price: 190,  discountPrice: 190,  costPrice: 180,
    weightOptions: [
      { weight: '85g',  price: 190  },
      { weight: '170g', price: 380  },
      { weight: '430g', price: 900  },
      { weight: '900g', price: 1800 },
    ] },

  { name: 'Tapal Tezdum Tea',                   price: 190,  discountPrice: 190,  costPrice: 180,
    weightOptions: [
      { weight: '85g',  price: 190  },
      { weight: '170g', price: 380  },
      { weight: '430g', price: 900  },
      { weight: '900g', price: 1800 },
    ] },

  { name: 'Tapal Danedar Tea Bags',             price: 250,  discountPrice: 240,  costPrice: 235,
    weightOptions: [
      { weight: '25 bags',  price: 250  },
      { weight: '50 bags',  price: 500  },
      { weight: '100 bags', price: 1000 },
    ] },

  { name: 'Tapal Danedar Tea',                  price: 190,  discountPrice: 190,  costPrice: 180,
    weightOptions: [
      { weight: '85g',  price: 190  },
      { weight: '170g', price: 380  },
      { weight: '350g', price: 720  },
      { weight: '430g', price: 830  },
      { weight: '900g', price: 1800 },
    ] },

  { name: 'Tapal Danedar Value Pack',           price: 830,  discountPrice: 810,  costPrice: 750,
    weightOptions: [{ weight: '430g', price: 830 }, { weight: '900g', price: 1800 }] },

  // Brooke Bond (only 160g price provided; 430g and 900g no price given so keep existing)
  { name: 'Brooke Bond Supreme Tea',            price: 380,  discountPrice: 370,  costPrice: 350,
    updateWeightOptions: [{ weight: '160g', price: 380 }] }, // partial update

  // Nestle Nido
  { name: 'Nestle Nido Milk Powder',            price: 1100, discountPrice: 1090, costPrice: 1050,
    weightOptions: [{ weight: '400g', price: 1100 }, { weight: '900g', price: 2500 }] },

  // Soft Drinks
  { name: 'Mountain Dew',                       price: 100,  discountPrice: 100,  costPrice: 90,
    weightOptions: [{ weight: '500ml', price: 100 }, { weight: '1L', price: 155 }, { weight: '1.5L', price: 175 }] },

  { name: 'Mirinda Orange',                     price: 100,  discountPrice: 0,    costPrice: 90,
    weightOptions: [{ weight: '500ml', price: 100 }, { weight: '1L', price: 155 }, { weight: '1.5L', price: 190 }] },

  { name: 'Fanta Orange',                       price: 105,  discountPrice: 100,  costPrice: 90,
    weightOptions: [{ weight: '250ml', price: 105 }] },

  { name: 'Coca-Cola',                          price: 115,  discountPrice: 115,  costPrice: 110,
    weightOptions: [
      { weight: '250ml', price: 115 },
      { weight: '500ml', price: 105 },
      { weight: '1L',    price: 170 },
      { weight: '1.5L',  price: 210 },
    ] },

  { name: 'Sprite',                             price: 115,  discountPrice: 115,  costPrice: 100,
    weightOptions: [
      { weight: '250ml', price: 115 },
      { weight: '350ml', price: 120 },
      { weight: '500ml', price: 105 },
      { weight: '1L',    price: 170 },
      { weight: '1.5L',  price: 210 },
    ] },

  { name: '7UP',                                price: 75,   discountPrice: 70,   costPrice: 60,
    weightOptions: [
      { weight: '345ml', price: 75  },
      { weight: '500ml', price: 105 },
      { weight: '1L',    price: 155 },
      { weight: '1.5L',  price: 150 },
    ] },

  { name: 'Pepsi',                              price: 105,  discountPrice: 100,  costPrice: 95,
    weightOptions: [{ weight: '250ml', price: 105 }, { weight: '250ml Diet', price: 105 }] },

  // Juice
  { name: 'Nestle Nesfruita Apple',             price: 55,   discountPrice: 55,   costPrice: 50,
    weightOptions: [{ weight: '200ml', price: 55 }, { weight: '1L', price: 160 }] },

  { name: 'Nestle Nesfruita Mango',             price: 55,   discountPrice: 55,   costPrice: 50,
    weightOptions: [{ weight: '200ml', price: 55 }, { weight: '1L', price: 160 }] },

  { name: 'Fresher Mango Nectar',               price: 90,   discountPrice: 85,   costPrice: 75,
    weightOptions: [
      { weight: '350ml', price: 90  },
      { weight: '500ml', price: 120 },
      { weight: '1L',    price: 220 },
    ] },

  { name: 'Fresher Strawberry Fruit Drink',     price: 120,  discountPrice: 120,  costPrice: 100,
    weightOptions: [{ weight: '500ml', price: 120 }] },

  { name: 'Fruita Vital Sparkling Apple',       price: 150,  discountPrice: 150,  costPrice: 140,
    weightOptions: [{ weight: '250ml', price: 150 }] },

  { name: 'Nestle Fruita Vitals Orange',        price: 390,  discountPrice: 390,  costPrice: 380,
    weightOptions: [{ weight: '1L', price: 390 }] },

  { name: 'Nestle Fruita Vitals Red Grapes',    price: 500,  discountPrice: 500,  costPrice: 470,
    weightOptions: [{ weight: '1L', price: 500 }] },

  { name: 'Nestle Fruita Vitals Pineapple',     price: 475,  discountPrice: 475,  costPrice: 460,
    weightOptions: [{ weight: '1L', price: 475 }] },

  { name: 'Nestle Fruita Vitals Guava',         price: 340,  discountPrice: 340,  costPrice: 330,
    weightOptions: [{ weight: '1L', price: 340 }] },

  { name: 'Nestle Fruita Vitals Chaunsa',       price: 70,   discountPrice: 70,   costPrice: 60,
    weightOptions: [{ weight: '200ml', price: 70 }, { weight: '1L', price: 390 }] },

  { name: 'Nestle Fruita Vitals Apple',         price: 75,   discountPrice: 75,   costPrice: 70,
    weightOptions: [{ weight: '200ml', price: 75 }, { weight: '1L', price: 340 }] },

  { name: 'Nestle Fruita Vitals Peach',         price: 75,   discountPrice: 75,   costPrice: 70,
    weightOptions: [{ weight: '200ml', price: 75 }, { weight: '1L', price: 390 }] },

  { name: 'Nestle Fruita Vitals Mango',         price: 75,   discountPrice: 75,   costPrice: 70,
    weightOptions: [{ weight: '200ml', price: 75 }, { weight: '1L', price: 390 }] },

  // Energy Drinks
  { name: 'Red Bull Energy Drink',              price: 500,  discountPrice: 500,  costPrice: 480,
    weightOptions: [{ weight: '250ml', price: 500 }] },

  { name: 'Sting Energy Drink',                 price: 85,   discountPrice: 65,   costPrice: 75,
    weightOptions: [{ weight: '250ml', price: 85 }] },
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

    const setData = {
      price:         p.price,
      discountPrice: p.discountPrice,
      costPrice:     p.costPrice,
    };

    if (p.weightOptions) {
      // Full replace of weightOptions array
      setData.weightOptions = p.weightOptions.map(w => ({
        weight: w.weight,
        price:  w.price,
        image:  existing.weightOptions?.find(e => e.weight === w.weight)?.image || '',
      }));
    } else if (p.updateWeightOptions) {
      // Partial update: only update price for specified weights, keep others
      const merged = (existing.weightOptions || []).map(ew => {
        const upd = p.updateWeightOptions.find(u => u.weight === ew.weight);
        return upd ? { ...ew.toObject(), price: upd.price } : ew.toObject();
      });
      setData.weightOptions = merged;
    }

    await Product.updateOne({ _id: existing._id }, { $set: setData });
    console.log(`  ✅  ${p.name}`);
    updated++;
  }

  console.log(`\n🎉 Done — ${updated} updated, ${notFound} not found`);
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
