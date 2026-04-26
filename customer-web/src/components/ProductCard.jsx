import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';

export default function ProductCard({ product }) {
  const { addItem, updateQty, items } = useCart();
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const weight = product._variantWeight || null;
  const inCart = items.find((i) => i._id === product._id && i.selectedWeight === weight);
  const qty = inCart?.quantity || 0;
  const MAX = Math.min(5, product.stock > 0 ? product.stock : 5);
  const outOfStock = product.stock === 0;
  const detailLink = `/products/${product._id}${weight ? `?weight=${encodeURIComponent(weight)}` : ''}`;

  return (
    <div style={s.card}>
      <Link to={detailLink} style={{ textDecoration: 'none' }}>
        <div style={s.imgBox}>
          {(product._variantImage || product.images?.[0])
            ? <img src={product._variantImage || product.images[0]} alt={product.name} style={s.img} />
            : <div style={s.imgPlaceholder}>🛒</div>}
          {hasDiscount && <span style={s.priceCutBadge}>Price Cut</span>}
        </div>
      </Link>

      <div style={s.body}>
        <Link to={detailLink} style={{ textDecoration: 'none' }}>
          <p style={s.name}>
            {product._variantImage && weight ? `${product.name} ${weight}` : product.name}
          </p>
        </Link>
        {!(product._variantImage && weight) && (() => {
          const isBiscuit = product.category?.name?.toLowerCase().includes('biscuit');
          const unitVal = weight || (isBiscuit ? 'Per Box' : product.unit);
          const meaningful = unitVal && /\d/.test(unitVal) || ['per box', 'per piece', 'per kg', 'per litre'].includes(unitVal?.toLowerCase());
          return meaningful ? <p style={s.unit}>{unitVal}</p> : null;
        })()}

        <div style={s.priceArea}>
          {hasDiscount && (
            <span style={s.oldPrice}>RS {product.price.toLocaleString()}</span>
          )}
          <span style={s.price}>RS {price.toLocaleString()}</span>
        </div>

        {outOfStock ? (
          <button style={{ ...s.addBtn, backgroundColor: '#ccc', cursor: 'default' }} disabled>
            Out of Stock
          </button>
        ) : qty === 0 ? (
          <button style={s.addBtn} onClick={() => addItem({ ...product, price, discountPrice: 0 }, 1, weight)}>
            Add
          </button>
        ) : (
          <div style={s.qtyRow}>
            <button style={s.qtyBtn} onClick={() => updateQty(product._id, weight, qty - 1)}>−</button>
            <span style={s.qtyNum}>{qty}</span>
            <button
              style={{ ...s.qtyBtn, ...(qty >= MAX ? s.qtyBtnDisabled : {}) }}
              onClick={() => qty < MAX && updateQty(product._id, weight, qty + 1)}
            >+</button>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e8e8e8',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s',
  },
  imgBox: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: '#f9f9f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  img: { width: '100%', height: '100%', objectFit: 'contain', padding: 8 },
  imgPlaceholder: { fontSize: 48, color: '#ccc' },
  priceCutBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#e74c3c',
    color: '#fff',
    fontSize: 10,
    fontWeight: 800,
    padding: '3px 7px',
    borderRadius: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  body: { padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  name: {
    fontSize: 13,
    fontWeight: 500,
    color: '#222',
    lineHeight: 1.4,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    minHeight: 36,
  },
  unit: { fontSize: 12, fontWeight: 700, color: COLORS.primary, margin: '2px 0 4px' },
  priceArea: { display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 },
  oldPrice: { fontSize: 11, color: '#aaa', textDecoration: 'line-through', fontWeight: 500 },
  price: { fontSize: 16, fontWeight: 800, color: '#1a1a1a' },
  addBtn: {
    marginTop: 'auto',
    width: '100%',
    padding: '9px',
    backgroundColor: COLORS.primary,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  qtyRow: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1565c0',
  },
  qtyBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: 20,
    fontWeight: 700,
    padding: '7px 14px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  qtyBtnDisabled: { opacity: 0.4, cursor: 'default' },
  qtyNum: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: 15,
  },
};
