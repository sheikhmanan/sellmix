import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const inCart = items.find((i) => i._id === product._id);

  return (
    <div style={s.card}>
      {hasDiscount && <span style={s.discBadge}>{discountPct}% OFF</span>}
      {product.isFeatured && !hasDiscount && <span style={s.featBadge}>⭐ Featured</span>}

      <Link to={`/products/${product._id}`}>
        <div style={s.imgBox}>
          {product.images?.[0]
            ? <img src={product.images[0]} alt={product.name} style={s.img} />
            : <div style={s.imgPlaceholder}>🛒</div>}
        </div>
      </Link>

      <div style={s.body}>
        <p style={s.catLabel}>{product.category?.name || 'Grocery'}</p>
        <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
          <h3 style={s.name}>{product.name}</h3>
        </Link>

        <div style={s.priceRow}>
          <span style={s.price}>Rs. {price.toLocaleString()}</span>
          {hasDiscount && <span style={s.oldPrice}>Rs. {product.price.toLocaleString()}</span>}
        </div>

        <button
          style={{ ...s.addBtn, ...(inCart ? s.addBtnActive : {}) }}
          onClick={() => addItem(product, 1, null)}
        >
          {inCart ? `✓ In Cart (${inCart.quantity})` : '+ Add to Cart'}
        </button>
      </div>
    </div>
  );
}

const s = {
  card: { backgroundColor: COLORS.white, borderRadius: 14, overflow: 'hidden', border: `1px solid ${COLORS.border}`, transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', display: 'flex', flexDirection: 'column' },
  discBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: COLORS.error, color: COLORS.white, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, zIndex: 1 },
  featBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: COLORS.warning, color: COLORS.white, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, zIndex: 1 },
  imgBox: { width: '100%', height: 180, overflow: 'hidden', backgroundColor: COLORS.lightGrey },
  img: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  imgPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 },
  body: { padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  catLabel: { fontSize: 11, color: COLORS.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 },
  name: { fontSize: 14, fontWeight: 700, color: COLORS.text, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  priceRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 },
  price: { fontSize: 16, fontWeight: 800, color: COLORS.primary },
  oldPrice: { fontSize: 12, color: COLORS.textMuted, textDecoration: 'line-through' },
  addBtn: { marginTop: 'auto', width: '100%', padding: '9px', backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  addBtnActive: { backgroundColor: COLORS.success },
};
