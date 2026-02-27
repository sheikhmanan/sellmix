import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { COLORS } from '../constants/colors';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(0);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showCooking, setShowCooking] = useState(false);
  const { addItem, items } = useCart();

  useEffect(() => {
    setLoading(true);
    productsAPI.getById(id).then((r) => {
      setProduct(r.data);
      if (r.data.weightOptions?.length) setSelectedWeight(r.data.weightOptions[0].weight);
      if (r.data.category?._id) {
        productsAPI.getAll({ category: r.data.category._id, limit: 5 })
          .then((res) => setRelated((res.data.products || []).filter((p) => p._id !== id).slice(0, 4)))
          .catch(() => {});
      }
      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/products'); });
  }, [id]);

  if (loading) return <div style={s.loading}><p>Loading...</p></div>;
  if (!product) return null;

  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const inCart = items.find((i) => i._id === product._id);

  const handleAdd = () => {
    addItem(product, qty, selectedWeight);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={s.breadcrumb}>
        <div style={s.breadcrumbInner}>
          <Link to="/" style={s.breadLink}>Home</Link> /
          <Link to="/products" style={s.breadLink}>Products</Link> /
          <span style={{ color: COLORS.textLight }}>{product.name}</span>
        </div>
      </div>

      <div style={s.container}>
        {/* Product Main */}
        <div style={s.productMain}>
          {/* Images */}
          <div style={s.imgSection}>
            <div style={s.mainImgBox}>
              {product.images?.[mainImg]
                ? <img src={product.images[mainImg]} alt={product.name} style={s.mainImg} />
                : <div style={s.imgPlaceholder}>🛒</div>}
              {hasDiscount && <span style={s.discBadge}>{discountPct}% OFF</span>}
            </div>
            {product.images?.length > 1 && (
              <div style={s.thumbRow}>
                {product.images.map((img, i) => (
                  <img key={i} src={img} alt="" style={{ ...s.thumb, ...(mainImg === i ? s.thumbActive : {}) }} onClick={() => setMainImg(i)} />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={s.infoSection}>
            <p style={s.catLabel}>{product.category?.name?.toUpperCase()}</p>
            <h1 style={s.productName}>{product.name}</h1>
            {product.unit && <p style={s.unitTxt}>{product.unit} • {product.tags?.[0] || 'Premium Quality'}</p>}

            {/* Price */}
            <div style={s.priceRow}>
              <span style={s.price}>Rs. {price.toLocaleString()}</span>
              {hasDiscount && <span style={s.oldPrice}>Rs. {product.price.toLocaleString()}</span>}
            </div>

            {/* Description */}
            {product.description && <p style={s.desc}>{product.description}</p>}

            {/* Weight options */}
            {product.weightOptions?.length > 0 && (
              <div style={s.weightSection}>
                <p style={s.weightLabel}>Select Weight:</p>
                <div style={s.weightRow}>
                  {product.weightOptions.map((w) => (
                    <button
                      key={w.weight}
                      style={{ ...s.weightChip, ...(selectedWeight === w.weight ? s.weightChipActive : {}) }}
                      onClick={() => setSelectedWeight(w.weight)}
                    >
                      {w.weight}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add */}
            <div style={s.addSection}>
              <div style={s.qtyControl}>
                <button style={s.qtyBtn} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span style={s.qty}>{qty}</span>
                <button style={s.qtyBtn} onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <button
                style={{ ...s.addBtn, ...(inCart ? { backgroundColor: COLORS.success } : {}) }}
                onClick={handleAdd}
              >
                {inCart ? `✓ Added (${inCart.quantity} in cart)` : '🛒 Add to Cart'}
              </button>
            </div>

            {inCart && (
              <button style={s.viewCartBtn} onClick={() => navigate('/cart')}>
                View Cart →
              </button>
            )}

            {/* Badges */}
            <div style={s.badgesRow}>
              <span style={s.badge}>✅ Quality Guaranteed</span>
              <span style={s.badge}>🚚 Chichawatni Delivery</span>
              <span style={s.badge}>💵 COD Available</span>
            </div>
          </div>
        </div>

        {/* Accordions */}
        <div style={s.accordionSection}>
          {product.nutritionalInfo && (
            <div style={s.accordCard}>
              <button style={s.accordBtn} onClick={() => setShowNutrition(!showNutrition)}>
                <span style={s.accordTitle}>Nutritional Information</span>
                <span>{showNutrition ? '▲' : '▼'}</span>
              </button>
              {showNutrition && <p style={s.accordContent}>{product.nutritionalInfo}</p>}
            </div>
          )}
          {product.cookingInstructions && (
            <div style={s.accordCard}>
              <button style={s.accordBtn} onClick={() => setShowCooking(!showCooking)}>
                <span style={s.accordTitle}>Cooking Instructions</span>
                <span>{showCooking ? '▲' : '▼'}</span>
              </button>
              {showCooking && <p style={s.accordContent}>{product.cookingInstructions}</p>}
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section style={s.relatedSection}>
            <h2 style={s.relatedTitle}>You May Also Like</h2>
            <div style={s.relatedGrid}>
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

const s = {
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 },
  breadcrumb: { backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, padding: '12px 20px' },
  breadcrumbInner: { maxWidth: 1200, margin: '0 auto', fontSize: 13, color: COLORS.textLight, display: 'flex', gap: 8, alignItems: 'center' },
  breadLink: { color: COLORS.primary, textDecoration: 'none' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 20px' },
  productMain: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 40 },
  imgSection: { display: 'flex', flexDirection: 'column', gap: 12 },
  mainImgBox: { position: 'relative', borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.lightGrey, aspectRatio: '1/1' },
  mainImg: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: { width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 },
  discBadge: { position: 'absolute', top: 16, left: 16, backgroundColor: COLORS.error, color: COLORS.white, padding: '6px 12px', borderRadius: 8, fontWeight: 700, fontSize: 13 },
  thumbRow: { display: 'flex', gap: 8 },
  thumb: { width: 72, height: 72, borderRadius: 8, objectFit: 'cover', cursor: 'pointer', border: `2px solid transparent` },
  thumbActive: { border: `2px solid ${COLORS.primary}` },
  infoSection: { display: 'flex', flexDirection: 'column', gap: 14 },
  catLabel: { fontSize: 12, color: COLORS.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 30, fontWeight: 900, color: COLORS.text, lineHeight: 1.3 },
  unitTxt: { fontSize: 14, color: COLORS.textLight },
  priceRow: { display: 'flex', alignItems: 'center', gap: 12 },
  price: { fontSize: 32, fontWeight: 900, color: COLORS.primary },
  oldPrice: { fontSize: 18, color: COLORS.textMuted, textDecoration: 'line-through' },
  desc: { fontSize: 14, color: COLORS.textLight, lineHeight: 1.7, padding: '14px', backgroundColor: COLORS.secondary, borderRadius: 10 },
  weightSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  weightLabel: { fontSize: 13, fontWeight: 700, color: COLORS.text },
  weightRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  weightChip: { padding: '8px 16px', border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', backgroundColor: COLORS.white, fontWeight: 600 },
  weightChipActive: { border: `1.5px solid ${COLORS.primary}`, backgroundColor: COLORS.primary + '12', color: COLORS.primary },
  addSection: { display: 'flex', gap: 14, alignItems: 'center' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: 0, border: `1.5px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden' },
  qtyBtn: { width: 40, height: 44, border: 'none', backgroundColor: COLORS.lightGrey, fontSize: 20, cursor: 'pointer', fontWeight: 700 },
  qty: { width: 44, textAlign: 'center', fontSize: 16, fontWeight: 700 },
  addBtn: { flex: 1, padding: '13px 24px', backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  viewCartBtn: { width: '100%', padding: '12px', backgroundColor: 'transparent', border: `1.5px solid ${COLORS.primary}`, borderRadius: 10, color: COLORS.primary, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  badgesRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  badge: { backgroundColor: COLORS.lightGrey, padding: '7px 14px', borderRadius: 20, fontSize: 13, color: COLORS.text },
  accordionSection: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40 },
  accordCard: { backgroundColor: COLORS.white, borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: 'hidden' },
  accordBtn: { width: '100%', display: 'flex', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 },
  accordTitle: { fontWeight: 700, color: COLORS.text },
  accordContent: { padding: '0 20px 16px', fontSize: 14, color: COLORS.textLight, lineHeight: 1.7 },
  relatedSection: { marginTop: 16 },
  relatedTitle: { fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 20 },
  relatedGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
};
