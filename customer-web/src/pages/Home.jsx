import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';

function expandVariants(products) {
  return products.flatMap((p) => {
    if (p.weightOptions?.length > 0) {
      return p.weightOptions.map((w) => ({
        ...p,
        _cardId: `${p._id}-${w.weight}`,
        _variantWeight: w.weight,
        _variantImage: w.image || p.images?.[0] || null,
        price: w.price,
        discountPrice: 0,
      }));
    }
    return [{ ...p, _cardId: p._id }];
  });
}

const CLOUD = 'dnhuilgay';
const BIMG = (id) => `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_1600/${id}`;

const BANNERS = [
  { img: BIMG('SellMix_Banner_image-1_2048_1365_qcbwxv'), link: '/products' },
  { img: BIMG('SellMix_Banner_image-2_2048_1365_am722s'), link: '/products' },
  { img: BIMG('SellMix_Banner_image-3_2048_1365_qrvphw'), link: '/products' },
  { img: BIMG('SellMix_Banner_image-4_2048_1365_sazh6z'), link: '/products' },
  { img: BIMG('SellMix_Banner_image-5_2048x1365_oicgvw'), link: '/products' },
];

const WHY_US = [
  { title: 'Value for money', sub: 'Discount on 100+ Products' },
  { title: 'Fast Delivery', sub: 'Rs. 150 flat • Chichawatni' },
  { title: 'Quality assurance', sub: 'You Can Trust us' },
];

const MAX = 5;

function DealCard({ product }) {
  const { addItem, updateQty, items } = useCart();
  const weight = product._variantWeight || null;
  const inCart = items?.find((i) => i._id === product._id && i.selectedWeight === weight);
  const qty = inCart?.quantity || 0;
  const pct = product.discountPrice > 0 ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const imgUrl = product._variantImage || product.images?.[0] || '';

  return (
    <Link to={`/products/${product._id}${weight ? `?weight=${encodeURIComponent(weight)}` : ''}`} style={dc.card}>
      <div style={dc.imgBox}>
        {imgUrl
          ? <img src={imgUrl} alt={product.name} style={dc.img} />
          : <span style={{ fontSize: 36 }}>🛒</span>}
        {pct > 0 && <span style={dc.pct}>-{pct}%</span>}
      </div>
      <div style={dc.info}>
        {pct > 0 && <span style={dc.badge}>Price Cut</span>}
        <p style={dc.name}>
          {product._variantImage && product._variantWeight
            ? `${product.name} ${product._variantWeight}`
            : product.name}
        </p>
        {!(product._variantImage && product._variantWeight) && (product._variantWeight || product.weightOptions?.[0]?.weight || product.unit) && (
          <p style={dc.unit}>{product._variantWeight || product.weightOptions?.[0]?.weight || product.unit}</p>
        )}
        {pct > 0 && <p style={dc.oldPrice}>RS {product.price.toLocaleString()}</p>}
        <p style={dc.price}>RS {(product.discountPrice || product.price).toLocaleString()}</p>
      </div>
      {qty === 0 ? (
        <button style={dc.addBtn} onClick={(e) => { e.preventDefault(); addItem(product, 1, weight); }}>
          Add
        </button>
      ) : (
        <div style={dc.qtyRow} onClick={(e) => e.preventDefault()}>
          <button style={dc.qtyBtn} onClick={() => updateQty(product._id, weight, qty - 1)}>−</button>
          <span style={dc.qtyNum}>{qty}</span>
          <button
            style={{ ...dc.qtyBtn, ...(qty >= MAX ? dc.qtyBtnDisabled : {}) }}
            onClick={() => qty < MAX && updateQty(product._id, weight, qty + 1)}
          >+</button>
        </div>
      )}
    </Link>
  );
}

const dc = {
  card: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textDecoration: 'none', gap: 12 },
  imgBox: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' },
  img: { width: 80, height: 80, objectFit: 'contain' },
  pct: { position: 'absolute', bottom: 0, left: 0, backgroundColor: '#e74c3c', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 5px', borderTopRightRadius: 6 },
  info: { flex: 1, minWidth: 0 },
  badge: { backgroundColor: '#e74c3c', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, marginBottom: 4, display: 'inline-block' },
  name: { fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 2, lineHeight: 1.4 },
  unit: { fontSize: 12, fontWeight: 700, color: COLORS.primary, marginBottom: 2 },
  oldPrice: { fontSize: 12, color: '#999', textDecoration: 'line-through', marginBottom: 1 },
  price: { fontSize: 15, fontWeight: 800, color: '#1a1a1a' },
  addBtn: { backgroundColor: COLORS.primary, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0 },
  qtyRow: { display: 'flex', alignItems: 'center', backgroundColor: '#1565c0', borderRadius: 10, overflow: 'hidden', flexShrink: 0 },
  qtyBtn: { backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: 20, fontWeight: 700, padding: '10px 14px', cursor: 'pointer', lineHeight: 1 },
  qtyBtnDisabled: { opacity: 0.4, cursor: 'default' },
  qtyNum: { color: '#fff', fontWeight: 800, fontSize: 15, minWidth: 24, textAlign: 'center' },
};

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth <= 600);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 600);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function Home() {
  const isMobile = useIsMobile();
  const [featured, setFeatured] = useState([]);
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    productsAPI.getAll({ featured: true, limit: 12 }).then((r) => setFeatured(r.data.products || [])).catch(() => {});
    productsAPI.getAll({ limit: 12 }).then((r) => setProducts(r.data.products || [])).catch(() => {});
    productsAPI.getAll({ limit: 50 }).then((r) => {
      const withDiscount = (r.data.products || []).filter((p) => p.discountPrice > 0 && p.discountPrice < p.price);
      setDeals(withDiscount.slice(0, 8));
    }).catch(() => {});

    const t = setInterval(() => setSlide((p) => (p + 1) % BANNERS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={s.page}>
      <style>{`
        * { box-sizing: border-box; }
        body { overflow-x: hidden; }
        @media (max-width: 600px) {
          .home-product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .home-why-bar { padding: 14px 0 !important; }
          .home-why-inner { display: grid !important; grid-template-columns: auto 1fr 1fr 1fr !important; align-items: center !important; gap: 8px !important; padding: 0 12px !important; }
          .home-why-label { font-size: 12px !important; font-weight: 800 !important; white-space: nowrap !important; }
          .home-why-item { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 6px !important; }
          .home-why-icon { width: 36px !important; height: 36px !important; flex-shrink: 0 !important; }
          .home-why-icon svg { width: 16px !important; height: 16px !important; }
          .home-why-title { font-size: 10px !important; font-weight: 700 !important; white-space: normal !important; line-height: 1.3 !important; }
          .home-why-sub { display: none !important; }
          .home-container { padding: 16px 10px !important; }
        }
      `}</style>

      {/* Hero Banner Carousel */}
      <div style={s.heroWrap}>
      <div style={s.hero}>
        <a href={BANNERS[slide].link} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}>
          <img src={BANNERS[slide].img} alt="SellMix Banner" style={s.heroImg} />
        </a>
        <div style={s.dots}>
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{ ...s.dot, ...(i === slide ? s.dotActive : {}) }} />
          ))}
        </div>
        <button style={{ ...s.arrow, left: 16 }} onClick={() => setSlide((p) => (p - 1 + BANNERS.length) % BANNERS.length)}>‹</button>
        <button style={{ ...s.arrow, right: 16 }} onClick={() => setSlide((p) => (p + 1) % BANNERS.length)}>›</button>
      </div>
      </div>

      {/* Why Choose Us */}
      <div className="home-why-bar" style={s.whyBar}>
        <div className="home-why-inner" style={s.whyInner}>
          <span className="home-why-label" style={s.whyLabel}>Why choose us?</span>
          {WHY_US.map((w, i) => (
            <div key={i} className="home-why-item" style={s.whyItem}>
              <div className="home-why-icon" style={s.whyIcon}>
                {i === 0 ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ) : i === 1 ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                )}
              </div>
              <div>
                <p className="home-why-title" style={s.whyTitle}>{w.title}</p>
                <p className="home-why-sub" style={s.whySub}>{w.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="home-container" style={s.container}>
        {/* Daily Deals */}
        {deals.length > 0 && (
          <section style={s.section}>
            <div style={s.sectionHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={s.sectionTitle}>Daily Deals</h2>
                <span style={s.flashBadge}>FLASH SALE</span>
              </div>
              <Link to="/products" style={s.seeAll}>View All →</Link>
            </div>
            {isMobile
              ? <div style={s.dealList}>{expandVariants(deals).map((p) => <DealCard key={p._cardId} product={p} />)}</div>
              : <div style={s.productGrid}>{expandVariants(deals).map((p) => <ProductCard key={p._cardId} product={p} />)}</div>}
          </section>
        )}

        {/* Featured Products */}
        {featured.length > 0 && (
          <section style={s.section}>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>Featured Products</h2>
              <Link to="/products?featured=true" style={s.seeAll}>View All →</Link>
            </div>
            {isMobile
              ? <div style={s.dealList}>{expandVariants(featured).map((p) => <DealCard key={p._cardId} product={p} />)}</div>
              : <div style={s.productGrid}>{expandVariants(featured).map((p) => <ProductCard key={p._cardId} product={p} />)}</div>}
          </section>
        )}

        {/* All Products */}
        {products.length > 0 && (
          <section style={s.section}>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>Latest Products</h2>
              <Link to="/products" style={s.seeAll}>View All →</Link>
            </div>
            {isMobile
              ? <div style={s.dealList}>{expandVariants(products).map((p) => <DealCard key={p._cardId} product={p} />)}</div>
              : <div style={s.productGrid}>{expandVariants(products).map((p) => <ProductCard key={p._cardId} product={p} />)}</div>}
          </section>
        )}

        {/* WhatsApp Banner */}
        <div style={s.waBanner}>
          <div>
            <h3 style={s.waTitle}>Order via WhatsApp</h3>
            <p style={s.waSub}>Prefer to chat? Place your order directly on WhatsApp and we'll deliver fast.</p>
          </div>
          <a href="https://wa.me/923178384342?text=Hi, I want to place an order" target="_blank" rel="noreferrer" style={s.waBtn}>
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { backgroundColor: '#f5f5f5', minHeight: '100vh', overflowX: 'hidden' },

  heroWrap: { backgroundColor: '#f5f5f5', padding: '0 20px' },
  hero: { position: 'relative', overflow: 'hidden', backgroundColor: '#000', lineHeight: 0, width: '100%', maxWidth: 1256, margin: '0 auto', paddingTop: 'min(28.58%, 359px)', borderRadius: 8 },
  heroImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'center center' },
  dots: { position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.4)', padding: 0 },
  dotActive: { width: 24, borderRadius: 4, backgroundColor: '#fff' },
  arrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.25)', border: 'none', color: '#fff', fontSize: 28, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },

  whyBar: { backgroundColor: '#f0f0f0', borderBottom: '1px solid #e0e0e0', padding: '18px 0' },
  whyInner: { maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' },
  whyLabel: { fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginRight: 10 },
  whyItem: { display: 'flex', alignItems: 'center', gap: 12 },
  whyIcon: { width: 42, height: 42, borderRadius: '50%', backgroundColor: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  whyTitle: { fontSize: 14, fontWeight: 700, color: '#1a1a1a' },
  whySub: { fontSize: 12, color: '#666' },

  container: { maxWidth: 1280, margin: '0 auto', padding: '32px 20px' },
  section: { marginBottom: 48 },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 800, color: '#1a1a1a' },
  seeAll: { fontSize: 13, color: '#3498db', fontWeight: 600, textDecoration: 'none' },
  flashBadge: { backgroundColor: '#e74c3c', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6 },

  dealList: { display: 'flex', flexDirection: 'column' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 },

  waBanner: { backgroundColor: '#25D366', borderRadius: 12, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginTop: 16 },
  waTitle: { fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 },
  waSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', maxWidth: 500 },
  waBtn: { backgroundColor: '#fff', color: '#25D366', padding: '13px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' },
};
