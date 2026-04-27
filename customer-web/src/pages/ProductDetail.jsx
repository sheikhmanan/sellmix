import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { COLORS } from '../constants/colors';

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function ProductDetail() {
  const isMobile = useIsMobile();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(0);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showCooking, setShowCooking] = useState(false);
  const { addItem, items, updateQty } = useCart();

  useEffect(() => {
    setQty(1);
    setLoading(true);
    setRelated([]);
    productsAPI.getById(id).then((r) => {
      setProduct(r.data);
      const preselect = searchParams.get('weight');
      const defaultWeight = preselect && r.data.weightOptions?.find((w) => w.weight === preselect)
        ? preselect
        : r.data.weightOptions?.[0]?.weight ?? null;
      setSelectedWeight(defaultWeight);
      if (r.data.category?._id) {
        productsAPI.getAll({ category: r.data.category._id, limit: 10 })
          .then((res) => {
            const items = (res.data.products || [])
              .filter((p) => p._id !== id)
              .map((p) => ({ ...p, _variantWeight: undefined, _variantImage: undefined }))
              .slice(0, 4);
            setRelated(items);
          })
          .catch(() => {});
      }
      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/products'); });
  }, [id]);

  if (loading) return <div style={s.loading}><p>Loading...</p></div>;
  if (!product) return null;

  const selectedOption = product.weightOptions?.find((w) => w.weight === selectedWeight);
  const variantImg = selectedOption?.image || null;

  // Discount ratio from base product (D/S). Apply to variant price so D is always the sale price shown.
  const discountRatio = product.price > 0 && product.discountPrice > 0
    ? product.discountPrice / product.price
    : 1;
  const mrpPrice = selectedOption ? selectedOption.price : product.price;
  const price = selectedOption
    ? (selectedOption.salePrice > 0 ? selectedOption.salePrice : Math.round(selectedOption.price * discountRatio))
    : (product.discountPrice > 0 ? product.discountPrice : product.price);
  const hasDiscount = price < mrpPrice;
  const discountPct = hasDiscount ? Math.round((1 - price / mrpPrice) * 100) : 0;
  const inCart = items.find((i) => i._id === product._id && i.selectedWeight === selectedWeight);
  const MAX_QTY = Math.min(5, product.stock > 0 ? product.stock : 5);
  const outOfStock = product.stock === 0;

  const handleAdd = () => {
    const productWithPrice = { ...product, price, discountPrice: 0 };
    addItem(productWithPrice, qty, selectedWeight);
  };

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  if (isMobile) {
    return (
      <div style={ms.root}>
        {/* Header bar */}
        <div style={ms.header}>
          <button style={ms.backBtn} onClick={() => navigate(-1)}>←</button>
          <span style={ms.headerTitle}>SellMix</span>
          <button style={ms.cartBtn} onClick={() => navigate('/cart')}>
            🛒
            {cartCount > 0 && <span style={ms.cartBadge}>{cartCount}</span>}
          </button>
        </div>

        {/* Image */}
        <div style={ms.imgBox}>
          {(variantImg || product.images?.[mainImg])
            ? <img src={variantImg || product.images[mainImg]} alt={product.name} style={ms.img} />
            : <div style={ms.imgPlaceholder}>🛒</div>}
          {hasDiscount && <span style={ms.discBadge}>{discountPct}% OFF</span>}
        </div>

        {/* Thumbnail row */}
        {!variantImg && product.images?.length > 1 && (
          <div style={ms.thumbRow}>
            {product.images.map((img, i) => (
              <img key={i} src={img} alt="" style={{ ...ms.thumb, ...(mainImg === i ? ms.thumbActive : {}) }} onClick={() => setMainImg(i)} />
            ))}
          </div>
        )}

        {/* Info */}
        <div style={ms.info}>
          <p style={ms.catLabel}>{product.category?.name?.toUpperCase()}</p>
          <h1 style={ms.name}>{product.name}</h1>
          {(selectedWeight || product.unit) && (
            <p style={ms.unitTxt}>{selectedWeight || product.unit}</p>
          )}

          {/* Price */}
          <div style={ms.priceRow}>
            <span style={ms.price}>Rs. {price.toLocaleString()}</span>
            {hasDiscount && <span style={ms.oldPrice}>Rs. {mrpPrice.toLocaleString()}</span>}
          </div>

          {/* Description */}
          {product.description && (
            <div style={ms.descBox}>
              <p style={ms.descLabel}>Description</p>
              <p style={ms.desc}>{product.description}</p>
            </div>
          )}

          {/* Badges */}
          <div style={ms.badges}>
            <span style={ms.badge}>✅ Quality Guaranteed</span>
            <span style={ms.badge}>🚚 Express Delivery</span>
            <span style={ms.badge}>💵 COD Available</span>
          </div>

          {/* Accordions */}
          {product.nutritionalInfo && (
            <div style={ms.accordCard}>
              <button style={ms.accordBtn} onClick={() => setShowNutrition(!showNutrition)}>
                <span style={ms.accordTitle}>Nutritional Information</span>
                <span>{showNutrition ? '▲' : '▼'}</span>
              </button>
              {showNutrition && <p style={ms.accordContent}>{product.nutritionalInfo}</p>}
            </div>
          )}
          {product.cookingInstructions && (
            <div style={ms.accordCard}>
              <button style={ms.accordBtn} onClick={() => setShowCooking(!showCooking)}>
                <span style={ms.accordTitle}>Cooking Instructions</span>
                <span>{showCooking ? '▲' : '▼'}</span>
              </button>
              {showCooking && <p style={ms.accordContent}>{product.cookingInstructions}</p>}
            </div>
          )}

          {/* Related */}
          {related.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <p style={ms.relatedTitle}>Frequently Bought Together</p>
              <div style={ms.relatedGrid}>
                {related.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          )}

          {/* Spacer for fixed bottom bar */}
          <div style={{ height: 90 }} />
        </div>

        {/* Fixed bottom bar */}
        <div style={ms.bottomBar}>
          {outOfStock ? (
            <button style={{ ...ms.addBtn, flex: 1, backgroundColor: '#ccc', cursor: 'default' }} disabled>
              Out of Stock
            </button>
          ) : !inCart ? (
            <button
              style={{ ...ms.addBtn, flex: 1 }}
              onClick={() => addItem({ ...product, price, discountPrice: 0 }, 1, selectedWeight)}
            >
              + Add to Cart
            </button>
          ) : (
            <div style={{ ...ms.qtyControl, flex: 1, justifyContent: 'space-between' }}>
              <button style={ms.qtyBtn} onClick={() => updateQty(product._id, selectedWeight, inCart.quantity - 1)}>−</button>
              <span style={ms.qtyNum}>{inCart.quantity}</span>
              <button
                style={{ ...ms.qtyBtn, ...(inCart.quantity >= MAX_QTY ? { opacity: 0.4 } : {}) }}
                onClick={() => inCart.quantity < MAX_QTY && updateQty(product._id, selectedWeight, inCart.quantity + 1)}
              >+</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div>
      <div style={s.backBarWrap}>
        <button style={s.backBarBtn} onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div style={s.container}>
        <div style={s.productMain}>
          {/* Images */}
          <div style={s.imgSection}>
            <div style={s.mainImgBox}>
              {(variantImg || product.images?.[mainImg])
                ? <img src={variantImg || product.images[mainImg]} alt={product.name} style={s.mainImg} />
                : <div style={s.imgPlaceholder}>🛒</div>}
              {hasDiscount && <span style={s.discBadge}>{discountPct}% OFF</span>}
            </div>
            {!variantImg && product.images?.length > 1 && (
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
            <p style={s.unitTxt}>
              {selectedWeight ? selectedWeight : product.unit ? product.unit : ''}
              {product.unit && !selectedWeight ? ` • ${product.tags?.[0] || 'Premium Quality'}` : ''}
            </p>


            <div style={s.priceRow}>
              <span style={s.price}>Rs. {price.toLocaleString()}</span>
              {hasDiscount && <span style={s.oldPrice}>Rs. {mrpPrice.toLocaleString()}</span>}
            </div>

            {product.description && <p style={s.desc}>{product.description}</p>}

            {outOfStock ? (
              <button style={{ ...s.addBtn, backgroundColor: '#ccc', cursor: 'default' }} disabled>
                Out of Stock
              </button>
            ) : !inCart ? (
              <button
                style={s.addBtn}
                onClick={() => addItem({ ...product, price, discountPrice: 0 }, 1, selectedWeight)}
              >
                + Add to Cart
              </button>
            ) : (
              <div style={s.qtyRow}>
                <button style={s.qtyMinus} onClick={() => updateQty(product._id, selectedWeight, inCart.quantity - 1)}>−</button>
                <span style={s.qtyNum}>{inCart.quantity}</span>
                <button
                  style={{ ...s.qtyPlus, ...(inCart.quantity >= MAX_QTY ? { opacity: 0.4, cursor: 'default' } : {}) }}
                  onClick={() => inCart.quantity < MAX_QTY && updateQty(product._id, selectedWeight, inCart.quantity + 1)}
                >+</button>
              </div>
            )}

            <div style={s.badgesRow}>
              <span style={s.badge}>✅ Quality Guaranteed</span>
              <span style={s.badge}>🚚 Chichawatni Delivery</span>
              <span style={s.badge}>💵 COD Available</span>
            </div>
          </div>
        </div>

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

// Mobile styles
const ms = {
  root: { minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: 0 },
  header: {
    position: 'sticky', top: 0, zIndex: 50,
    backgroundColor: '#fff', borderBottom: '1px solid #eee',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: '50%',
    backgroundColor: COLORS.primary, color: '#fff',
    border: 'none', fontSize: 18, fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 26, fontWeight: 800, color: COLORS.primary },
  cartBtn: { position: 'relative', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 4 },
  cartBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#e74c3c', color: '#fff', fontSize: 10, fontWeight: 800, width: 17, height: 17, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  imgBox: {
    position: 'relative', width: '100%', backgroundColor: '#f9f9f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: 280,
  },
  img: { width: '100%', height: '100%', objectFit: 'contain' },
  imgPlaceholder: { fontSize: 80 },
  discBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: COLORS.success, color: '#fff',
    padding: '4px 10px', borderRadius: 6, fontWeight: 700, fontSize: 12,
  },
  thumbRow: { display: 'flex', gap: 8, padding: '8px 16px', backgroundColor: '#fff', overflowX: 'auto' },
  thumb: { width: 60, height: 60, borderRadius: 8, objectFit: 'cover', cursor: 'pointer', border: '2px solid transparent', flexShrink: 0 },
  thumbActive: { border: `2px solid ${COLORS.primary}` },
  info: { padding: '16px 16px 0', backgroundColor: '#f5f5f5' },
  catLabel: { fontSize: 11, color: COLORS.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  name: { fontSize: 20, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.3, marginBottom: 14 },
  weightSection: { marginBottom: 14 },
  weightLabel: { fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 },
  weightRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  wChip: {
    border: `1.5px solid #ddd`, borderRadius: 8,
    padding: '8px 14px', backgroundColor: '#fff', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  wChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  wChipWeight: { fontSize: 13, fontWeight: 700, color: '#1a1a1a' },
  wChipPrice: { fontSize: 11, color: '#888', marginTop: 2 },
  wChipPriceActive: { color: COLORS.primary },
  unitTxt: { fontSize: 14, color: COLORS.primary, fontWeight: 700, marginBottom: 8 },
  priceRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  price: { fontSize: 26, fontWeight: 900, color: COLORS.primary },
  oldPrice: { fontSize: 15, color: '#aaa', textDecoration: 'line-through' },
  descBox: { backgroundColor: '#fff', borderRadius: 10, padding: '12px 14px', marginBottom: 14 },
  descLabel: { fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 },
  desc: { fontSize: 13, color: '#555', lineHeight: 1.7 },
  badges: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  badge: { backgroundColor: '#fff', border: '1px solid #e8e8e8', padding: '6px 10px', borderRadius: 20, fontSize: 11, color: '#333', whiteSpace: 'nowrap', flexShrink: 0 },
  accordCard: { backgroundColor: '#fff', borderRadius: 10, border: '1px solid #e8e8e8', overflow: 'hidden', marginBottom: 8 },
  accordBtn: { width: '100%', display: 'flex', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 },
  accordTitle: { fontWeight: 700, color: '#1a1a1a' },
  accordContent: { padding: '0 16px 14px', fontSize: 13, color: '#555', lineHeight: 1.7 },
  relatedTitle: { fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 },
  relatedGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  bottomBar: {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: '#fff', borderTop: '1px solid #e8e8e8',
    padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
  },
  qtyControl: {
    display: 'flex', alignItems: 'center',
    backgroundColor: '#1565c0', borderRadius: 10, overflow: 'hidden', flexShrink: 0,
  },
  qtyBtn: {
    width: 48, height: 50, border: 'none', backgroundColor: 'transparent',
    fontSize: 24, cursor: 'pointer', fontWeight: 700, color: '#fff',
  },
  qtyNum: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 800, color: '#fff' },
  addBtn: {
    flex: 1, padding: '13px', backgroundColor: COLORS.primary,
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
  },
};

// Desktop styles
const s = {
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 },
  backBarWrap: { backgroundColor: COLORS.white, padding: '10px 20px', borderBottom: `1px solid ${COLORS.border}` },
  backBarBtn: { backgroundColor: COLORS.primary, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 20px' },
  productMain: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 40 },
  imgSection: { display: 'flex', flexDirection: 'column', gap: 12 },
  mainImgBox: { position: 'relative', borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.lightGrey, aspectRatio: '1/1' },
  mainImg: { width: '100%', height: '100%', objectFit: 'contain' },
  imgPlaceholder: { width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 },
  discBadge: { position: 'absolute', top: 16, left: 16, backgroundColor: COLORS.error, color: COLORS.white, padding: '6px 12px', borderRadius: 8, fontWeight: 700, fontSize: 13 },
  thumbRow: { display: 'flex', gap: 8 },
  thumb: { width: 72, height: 72, borderRadius: 8, objectFit: 'cover', cursor: 'pointer', border: `2px solid transparent` },
  thumbActive: { border: `2px solid ${COLORS.primary}` },
  infoSection: { display: 'flex', flexDirection: 'column', gap: 14 },
  catLabel: { fontSize: 12, color: COLORS.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 30, fontWeight: 900, color: COLORS.text, lineHeight: 1.3 },
  unitTxt: { fontSize: 15, color: COLORS.primary, fontWeight: 700 },
  priceRow: { display: 'flex', alignItems: 'center', gap: 12 },
  price: { fontSize: 32, fontWeight: 900, color: COLORS.primary },
  oldPrice: { fontSize: 18, color: COLORS.textMuted, textDecoration: 'line-through' },
  desc: { fontSize: 14, color: COLORS.textLight, lineHeight: 1.7, padding: '14px', backgroundColor: COLORS.secondary, borderRadius: 10 },
  weightSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  weightLabel: { fontSize: 13, fontWeight: 700, color: COLORS.text },
  weightRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  weightChip: { padding: '8px 14px', border: `1.5px solid ${COLORS.border}`, borderRadius: 8, cursor: 'pointer', backgroundColor: COLORS.white, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  weightChipActive: { border: `1.5px solid ${COLORS.primary}`, backgroundColor: COLORS.primary + '12' },
  weightChipLabel: { fontSize: 13, fontWeight: 700, color: '#1a1a1a' },
  weightChipLabelActive: { color: COLORS.primary },
  weightChipPrice: { fontSize: 11, color: '#888' },
  weightChipPriceActive: { color: COLORS.primary },
  addSection: { display: 'flex', gap: 14, alignItems: 'center' },
  addBtn: { width: '100%', padding: '14px 24px', backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  qtyRow: { display: 'flex', alignItems: 'center', borderRadius: 10, overflow: 'hidden', backgroundColor: '#1565c0', width: '100%' },
  qtyMinus: { width: 56, height: 52, border: 'none', backgroundColor: 'transparent', fontSize: 24, fontWeight: 700, color: '#fff', cursor: 'pointer' },
  qtyPlus: { width: 56, height: 52, border: 'none', backgroundColor: 'transparent', fontSize: 24, fontWeight: 700, color: '#fff', cursor: 'pointer' },
  qtyNum: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 800, color: '#fff' },
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
