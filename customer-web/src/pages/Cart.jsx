import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';

const DELIVERY_FEE = 150;
const PROMO_CODES = { SELLMIX20: 0.2, FIRST10: 0.1 };

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, clearCart } = useCart();
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMsg, setPromoMsg] = useState('');
  const navigate = useNavigate();

  const applyPromo = () => {
    const rate = PROMO_CODES[promo.toUpperCase()];
    if (rate) {
      const saved = Math.round(subtotal * rate);
      setDiscount(saved);
      setPromoApplied(true);
      setPromoMsg(`✅ Saved Rs. ${saved}!`);
    } else {
      setPromoMsg('❌ Invalid promo code');
    }
  };

  const total = subtotal - discount + DELIVERY_FEE;

  if (items.length === 0) return (
    <div style={s.emptyWrap}>
      <p style={s.emptyIcon}>🛒</p>
      <h2 style={s.emptyTitle}>Your cart is empty</h2>
      <p style={s.emptySub}>Explore our products and add items to your cart.</p>
      <Link to="/products" style={s.shopBtn}>Browse Products</Link>
    </div>
  );

  return (
    <div style={s.root}>
      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.title}>My Cart</h1>
          <p style={s.location}>📍 Delivering to <strong>Chichawatni City</strong></p>
        </div>

        <div style={s.layout}>
          {/* Cart Items */}
          <div style={s.itemsCol}>
            {items.map((item) => {
              const unitPrice = item.discountPrice || item.price;
              return (
                <div key={`${item._id}-${item.selectedWeight}`} style={s.cartCard}>
                  <div style={s.itemImgBox}>
                    {item.images?.[0]
                      ? <img src={item.images[0]} alt={item.name} style={s.itemImg} />
                      : <span style={{ fontSize: 32 }}>🛒</span>}
                  </div>
                  <div style={s.itemInfo}>
                    <h3 style={s.itemName}>{item.name}</h3>
                    <p style={s.itemSub}>{item.selectedWeight ? `${item.selectedWeight} • ` : ''}Rs. {unitPrice.toLocaleString()} / unit</p>
                    <div style={s.qtyRow}>
                      <button style={s.qtyBtn} onClick={() => updateQty(item._id, item.selectedWeight, item.quantity - 1)}>−</button>
                      <span style={s.qty}>{item.quantity}</span>
                      <button style={s.qtyBtn} onClick={() => updateQty(item._id, item.selectedWeight, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div style={s.itemRight}>
                    <button style={s.deleteBtn} onClick={() => removeItem(item._id, item.selectedWeight)}>🗑️</button>
                    <span style={s.itemTotal}>Rs. {(unitPrice * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}

            <button style={s.clearBtn} onClick={() => { if (window.confirm('Clear entire cart?')) clearCart(); }}>
              🗑️ Clear Cart
            </button>
          </div>

          {/* Summary */}
          <div style={s.summaryCol}>
            {/* Promo Code */}
            <div style={s.summaryCard}>
              <h3 style={s.summaryTitle}>Promo Code</h3>
              <div style={s.promoRow}>
                <input
                  style={s.promoInput}
                  placeholder="e.g. SELLMIX20"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())}
                  disabled={promoApplied}
                />
                <button style={s.promoBtn} onClick={applyPromo} disabled={promoApplied}>
                  {promoApplied ? '✓' : 'Apply'}
                </button>
              </div>
              {promoMsg && <p style={{ fontSize: 13, marginTop: 8, color: promoApplied ? COLORS.success : COLORS.error }}>{promoMsg}</p>}
              <p style={s.promoHint}>Try: SELLMIX20 or FIRST10</p>
            </div>

            {/* Order Summary */}
            <div style={s.summaryCard}>
              <h3 style={s.summaryTitle}>Order Summary</h3>
              <div style={s.sumRow}><span>Subtotal ({items.length} items)</span><span>Rs. {subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div style={s.sumRow}><span>Promo Discount</span><span style={{ color: COLORS.success }}>− Rs. {discount.toLocaleString()}</span></div>}
              <div style={s.sumRow}><span>Delivery Fee (Chichawatni)</span><span style={{ color: COLORS.success }}>Rs. {DELIVERY_FEE}</span></div>
              <div style={s.sumRow}><span>Tax</span><span>Rs. 0</span></div>
              <div style={{ ...s.sumRow, ...s.totalRow }}>
                <span style={s.totalLabel}>Order Total</span>
                <span style={s.totalAmt}>Rs. {total.toLocaleString()}</span>
              </div>
              <button
                style={s.checkoutBtn}
                onClick={() => navigate('/checkout', { state: { subtotal, discount, deliveryFee: DELIVERY_FEE, total, promoCode: promoApplied ? promo : '' } })}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '70vh', backgroundColor: COLORS.secondary },
  emptyWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12 },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 24, fontWeight: 700, color: COLORS.text },
  emptySub: { fontSize: 15, color: COLORS.textLight },
  shopBtn: { backgroundColor: COLORS.primary, color: COLORS.white, padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15 },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 20px' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 6 },
  location: { fontSize: 14, color: COLORS.textLight },
  layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'flex-start' },
  itemsCol: { display: 'flex', flexDirection: 'column', gap: 12 },
  cartCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, display: 'flex', gap: 16, alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  itemImgBox: { width: 88, height: 88, borderRadius: 12, backgroundColor: COLORS.lightGrey, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemImg: { width: '100%', height: '100%', objectFit: 'cover' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 4 },
  itemSub: { fontSize: 13, color: COLORS.textLight, marginBottom: 10 },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 0, border: `1px solid ${COLORS.border}`, borderRadius: 8, width: 'fit-content', overflow: 'hidden' },
  qtyBtn: { width: 34, height: 34, border: 'none', backgroundColor: COLORS.lightGrey, fontSize: 18, cursor: 'pointer', fontWeight: 700 },
  qty: { width: 40, textAlign: 'center', fontSize: 15, fontWeight: 700 },
  itemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 },
  itemTotal: { fontSize: 16, fontWeight: 800, color: COLORS.primary },
  clearBtn: { background: 'none', border: `1px solid ${COLORS.error}`, color: COLORS.error, padding: '9px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start' },
  summaryCol: { display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 80 },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  summaryTitle: { fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 },
  promoRow: { display: 'flex', gap: 8 },
  promoInput: { flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none' },
  promoBtn: { backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 8, padding: '0 18px', cursor: 'pointer', fontWeight: 700, fontSize: 14 },
  promoHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  sumRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: COLORS.textLight, marginBottom: 10 },
  totalRow: { borderTop: `1px solid ${COLORS.border}`, paddingTop: 14, marginTop: 4, marginBottom: 16 },
  totalLabel: { fontSize: 16, fontWeight: 700, color: COLORS.text },
  totalAmt: { fontSize: 22, fontWeight: 900, color: COLORS.primary },
  checkoutBtn: { width: '100%', padding: '14px', backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
};
