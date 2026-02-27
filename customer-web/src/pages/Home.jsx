import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { COLORS } from '../constants/colors';

const HERO_SLIDES = [
  { bg: COLORS.primary, emoji: '🛒', title: 'Freshness Delivered', sub: 'Order groceries online and get delivery in Chichawatni', btn: 'Shop Now', link: '/products' },
  { bg: '#27ae60', emoji: '🌶️', title: 'Premium Recipe Mixes', sub: 'National, Shan & more — authentic flavors for your kitchen', btn: 'View Spices', link: '/products?search=masala' },
  { bg: '#8e44ad', emoji: '🍵', title: 'Best Tea Brands', sub: 'Lipton, Vital Tea & more — start your morning right', btn: 'Shop Tea', link: '/products?search=tea' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    productsAPI.getAll({ limit: 8 }).then((r) => setProducts(r.data.products || [])).catch(() => {});
    productsAPI.getAll({ featured: true, limit: 6 }).then((r) => setFeatured(r.data.products || [])).catch(() => {});
    categoriesAPI.getAll().then((r) => setCategories(r.data || [])).catch(() => {});

    const timer = setInterval(() => setSlide((p) => (p + 1) % HERO_SLIDES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const hero = HERO_SLIDES[slide];

  return (
    <div>
      {/* Hero Banner */}
      <div style={{ ...s.hero, backgroundColor: hero.bg }}>
        <div style={s.heroInner}>
          <div style={s.heroLeft}>
            <span style={s.heroBadge}>📍 Chichawatni Delivery</span>
            <h1 style={s.heroTitle}>{hero.title}</h1>
            <p style={s.heroSub}>{hero.sub}</p>
            <Link to={hero.link} style={s.heroBtn}>{hero.btn} →</Link>
          </div>
          <div style={s.heroEmoji}>{hero.emoji}</div>
        </div>
        {/* Dots */}
        <div style={s.heroDots}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} style={{ ...s.heroDot, ...(i === slide ? s.heroDotActive : {}) }} onClick={() => setSlide(i)} />
          ))}
        </div>
      </div>

      {/* Features Strip */}
      <div style={s.featuresStrip}>
        {[
          { icon: '🚚', title: 'Fast Delivery', sub: 'Within Chichawatni' },
          { icon: '✅', title: 'Quality Guaranteed', sub: 'Fresh products only' },
          { icon: '💵', title: 'Cash on Delivery', sub: 'Pay when you receive' },
          { icon: '💬', title: 'WhatsApp Support', sub: 'Order confirmation' },
        ].map((f, i) => (
          <div key={i} style={s.featureItem}>
            <span style={s.featureIcon}>{f.icon}</span>
            <div>
              <p style={s.featureTitle}>{f.title}</p>
              <p style={s.featureSub}>{f.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={s.container}>
        {/* Categories */}
        {categories.length > 0 && (
          <section style={s.section}>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>Shop by Category</h2>
              <Link to="/products" style={s.seeAll}>See All →</Link>
            </div>
            <div style={s.catGrid}>
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?search=${cat.name}`}
                  style={s.catCard}
                >
                  <span style={s.catIcon}>{cat.icon || '🛒'}</span>
                  <span style={s.catName}>{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Daily Deals */}
        {products.length > 0 && (
          <section style={s.section}>
            <div style={s.sectionHeader}>
              <div style={s.dealHeader}>
                <h2 style={s.sectionTitle}>Daily Deals</h2>
                <span style={s.flashBadge}>⚡ FLASH SALE</span>
              </div>
              <Link to="/products" style={s.seeAll}>View All →</Link>
            </div>
            <div style={s.productGrid}>
              {products.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featured.length > 0 && (
          <section style={s.section}>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>⭐ Featured Products</h2>
              <Link to="/products?featured=true" style={s.seeAll}>See All →</Link>
            </div>
            <div style={s.productGrid}>
              {featured.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}

        {/* WhatsApp CTA Banner */}
        <div style={s.whatsappBanner}>
          <div>
            <h3 style={s.waTitle}>Order via WhatsApp</h3>
            <p style={s.waSub}>Prefer to order directly? Chat with us on WhatsApp and place your order instantly.</p>
          </div>
          <a href="https://wa.me/923001234567?text=Hi, I want to place an order" target="_blank" rel="noreferrer" style={s.waBtn}>
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

const s = {
  hero: { padding: '60px 20px', minHeight: 300, position: 'relative', transition: 'background-color 0.5s' },
  heroInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  heroLeft: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 540 },
  heroBadge: { display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', color: COLORS.white, padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, width: 'fit-content' },
  heroTitle: { fontSize: 42, fontWeight: 900, color: COLORS.white, lineHeight: 1.2 },
  heroSub: { fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 },
  heroBtn: { display: 'inline-block', backgroundColor: COLORS.white, color: COLORS.primary, padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', width: 'fit-content' },
  heroEmoji: { fontSize: 120, opacity: 0.85 },
  heroDots: { position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 },
  heroDot: { width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.4)' },
  heroDotActive: { width: 24, borderRadius: 4, backgroundColor: COLORS.white },
  featuresStrip: { backgroundColor: COLORS.white, padding: '20px', display: 'flex', justifyContent: 'center', gap: 40, borderBottom: `1px solid ${COLORS.border}`, flexWrap: 'wrap' },
  featureItem: { display: 'flex', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 28 },
  featureTitle: { fontSize: 14, fontWeight: 700, color: COLORS.text },
  featureSub: { fontSize: 12, color: COLORS.textLight },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 20px' },
  section: { marginBottom: 48 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 800, color: COLORS.text },
  seeAll: { fontSize: 14, color: COLORS.primary, fontWeight: 600, textDecoration: 'none' },
  dealHeader: { display: 'flex', alignItems: 'center', gap: 10 },
  flashBadge: { backgroundColor: COLORS.error, color: COLORS.white, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20 },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 },
  catCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, backgroundColor: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '20px 12px', textDecoration: 'none', transition: 'transform 0.2s' },
  catIcon: { fontSize: 32 },
  catName: { fontSize: 13, fontWeight: 600, color: COLORS.text, textAlign: 'center' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  whatsappBanner: { backgroundColor: '#25D366', borderRadius: 16, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' },
  waTitle: { fontSize: 20, fontWeight: 800, color: COLORS.white, marginBottom: 6 },
  waSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', maxWidth: 500 },
  waBtn: { backgroundColor: COLORS.white, color: '#25D366', padding: '14px 24px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', whiteSpace: 'nowrap' },
};
