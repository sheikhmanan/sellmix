import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { COLORS } from '../constants/colors';

function BuyAgain({ user, addItem }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!user) return;
    ordersAPI.getMyOrders().then((r) => {
      const seen = new Set();
      const list = [];
      (r.data || []).forEach((order) => {
        (order.items || []).forEach((item) => {
          const p = item.product;
          if (p && p._id && !seen.has(p._id)) {
            seen.add(p._id);
            list.push({ ...p, _orderPrice: item.price });
          }
        });
      });
      setProducts(list.slice(0, 12));
    }).catch(() => {});
  }, [user]);

  if (!user || products.length === 0) return null;

  return (
    <div style={ba.wrap}>
      <p style={ba.heading}>🔄 Buy Again</p>
      <div style={ba.row}>
        {products.map((p) => (
          <div key={p._id} style={ba.card}>
            <div style={ba.imgBox}>
              {p.images?.[0]
                ? <img src={p.images[0]} alt={p.name} style={ba.img} />
                : <span style={{ fontSize: 24 }}>🛒</span>}
            </div>
            <p style={ba.name} title={p.name}>{p.name}</p>
            <p style={ba.price}>Rs. {(p.discountPrice || p.price || p._orderPrice || 0).toLocaleString()}</p>
            <button style={ba.btn} onClick={() => addItem(p, 1, null)}>+ Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const ba = {
  wrap: { marginTop: 28 },
  heading: { fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 14 },
  row: { display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 },
  card: { minWidth: 130, backgroundColor: '#fff', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flexShrink: 0 },
  imgBox: { width: '100%', height: 90, borderRadius: 10, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'contain' },
  name: { fontSize: 12, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  price: { fontSize: 13, fontWeight: 800, color: COLORS.primary },
  btn: { backgroundColor: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 'auto' },
};

const DELIVERY_FEE = 0;

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth <= 600);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 600);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function Cart() {
  const isMobile = useIsMobile();
  const { items, addItem, updateQty, removeItem, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMsg, setPromoMsg] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const applyPromo = async () => {
    try {
      const res = await ordersAPI.validatePromo(promo, subtotal);
      setDiscount(res.data.discount);
      setPromoApplied(true);
      setPromoMsg(`✅ Saved Rs. ${res.data.discount}!`);
    } catch {
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

  if (isMobile) {
    return (
      <div style={m.root}>
        {/* Header */}
        <div style={m.header}>
          <button style={m.backBtn} onClick={() => navigate(-1)}>←</button>
          <span style={m.title}>My Cart</span>
          <button style={m.clearTextBtn} onClick={() => { if (window.confirm('Clear entire cart?')) clearCart(); }}>Clear</button>
        </div>

        <div style={m.scrollArea}>
          {/* Location */}
          <p style={m.location}>📍 Delivering to <strong style={{ color: COLORS.primary }}>Chichawatni City</strong></p>

          {/* Cart Items */}
          {items.map((item) => {
            const unitPrice = item.discountPrice || item.price;
            return (
              <div key={`${item._id}-${item.selectedWeight}`} style={m.card}>
                <div style={m.imgBox}>
                  {(item._variantImage || item.images?.[0])
                    ? <img src={item._variantImage || item.images[0]} alt={item.name} style={m.img} />
                    : <span style={{ fontSize: 28 }}>🛒</span>}
                </div>
                <div style={m.info}>
                  <p style={m.name}>{item.name}</p>
                  <p style={m.sub}>{item.selectedWeight ? `${item.selectedWeight} • ` : ''}Rs. {unitPrice.toLocaleString()} / unit</p>
                  <div style={m.qtyRow}>
                    <button style={m.qtyBtn} onClick={() => updateQty(item._id, item.selectedWeight, item.quantity - 1)}>−</button>
                    <span style={m.qty}>{item.quantity}</span>
                    <button style={m.qtyBtn} onClick={() => updateQty(item._id, item.selectedWeight, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div style={m.right}>
                  <button style={m.deleteBtn} onClick={() => removeItem(item._id, item.selectedWeight)}>🗑</button>
                  <span style={m.itemTotal}>Rs. {(unitPrice * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            );
          })}

          {/* Promo Code */}
          <div style={m.section}>
            <p style={m.sectionLabel}>PROMO CODE</p>
            <div style={m.promoRow}>
              <input
                style={m.promoInput}
                placeholder="Enter promo code"
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
                disabled={promoApplied}
              />
              <button style={m.promoBtn} onClick={applyPromo} disabled={promoApplied}>Apply</button>
            </div>
            {promoMsg && <p style={{ fontSize: 12, marginTop: 6, color: promoApplied ? COLORS.success : COLORS.error }}>{promoMsg}</p>}
          </div>

          {/* Order Summary */}
          <div style={m.summaryBox}>
            <div style={m.sumRow}><span>Subtotal ({items.length} items)</span><span>Rs. {subtotal.toLocaleString()}</span></div>
            {discount > 0 && <div style={m.sumRow}><span>Promo Discount</span><span style={{ color: COLORS.success }}>− Rs. {discount.toLocaleString()}</span></div>}
            <div style={m.sumRow}><span>Delivery Fee (Chichawatni)</span><span><span style={{ textDecoration: 'line-through', color: '#aaa', marginRight: 6 }}>Rs. 150</span><span style={{ color: COLORS.success, fontWeight: 700 }}>FREE</span></span></div>
            <div style={m.sumRow}><span>Tax</span><span>Rs. 0</span></div>
            <div style={m.totalRow}>
              <span style={m.totalLabel}>Order Total</span>
              <span style={m.totalAmt}>Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Spacer for fixed button */}
          <div style={{ height: 90 }} />
        </div>

        {/* Fixed Checkout Button */}
        <div style={m.bottomBar}>
          <button
            style={m.checkoutBtn}
            onClick={() => { if (!user) { setShowAuthModal(true); } else { navigate('/checkout', { state: { subtotal, discount, deliveryFee: DELIVERY_FEE, total, promoCode: promoApplied ? promo : '' } }); } }}
          >
            Checkout
          </button>
        </div>

        {/* Auth Required Modal */}
        {showAuthModal && (
          <div style={s.modalOverlay} onClick={() => setShowAuthModal(false)}>
            <div style={s.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalIcon}>🔐</div>
              <h2 style={s.modalTitle}>Login Required</h2>
              <p style={s.modalSub}>Please login or create an account to proceed with your order.</p>
              <button style={s.modalLoginBtn} onClick={() => { setShowAuthModal(false); navigate('/login'); }}>Login</button>
              <button style={s.modalSignupBtn} onClick={() => { setShowAuthModal(false); navigate('/register'); }}>Register</button>
              <button style={s.modalCancelBtn} onClick={() => setShowAuthModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <>
    <div style={s.root}>
      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.title}>My Cart</h1>
          <p style={s.location}>📍 Delivering to <strong>Chichawatni City</strong></p>
        </div>

        <div style={s.layout}>
          <div style={s.itemsCol}>
            {items.map((item) => {
              const unitPrice = item.discountPrice || item.price;
              return (
                <div key={`${item._id}-${item.selectedWeight}`} style={s.cartCard}>
                  <div style={s.itemImgBox}>
                    {(item._variantImage || item.images?.[0])
                      ? <img src={item._variantImage || item.images[0]} alt={item.name} style={s.itemImg} />
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

          <div style={s.summaryCol}>
            <div style={s.summaryCard}>
              <h3 style={s.summaryTitle}>Promo Code</h3>
              <div style={s.promoRow}>
                <input
                  style={s.promoInput}
                  placeholder="Enter promo code"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())}
                  disabled={promoApplied}
                />
                <button style={s.promoBtn} onClick={applyPromo} disabled={promoApplied}>
                  {promoApplied ? '✓' : 'Apply'}
                </button>
              </div>
              {promoMsg && <p style={{ fontSize: 13, marginTop: 8, color: promoApplied ? COLORS.success : COLORS.error }}>{promoMsg}</p>}
              <p style={s.promoHint}>Have a promo code? Apply it above.</p>
            </div>

            <div style={s.summaryCard}>
              <h3 style={s.summaryTitle}>Order Summary</h3>
              <div style={s.sumRow}><span>Subtotal ({items.length} items)</span><span>Rs. {subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div style={s.sumRow}><span>Promo Discount</span><span style={{ color: COLORS.success }}>− Rs. {discount.toLocaleString()}</span></div>}
              <div style={s.sumRow}><span>Delivery Fee (Chichawatni)</span><span><span style={{ textDecoration: 'line-through', color: '#aaa', marginRight: 6 }}>Rs. 150</span><span style={{ color: COLORS.success, fontWeight: 700 }}>FREE</span></span></div>
              <div style={s.sumRow}><span>Tax</span><span>Rs. 0</span></div>
              <div style={{ ...s.sumRow, ...s.totalRow }}>
                <span style={s.totalLabel}>Order Total</span>
                <span style={s.totalAmt}>Rs. {total.toLocaleString()}</span>
              </div>
              <button
                style={s.checkoutBtn}
                onClick={() => { if (!user) { setShowAuthModal(true); } else { navigate('/checkout', { state: { subtotal, discount, deliveryFee: DELIVERY_FEE, total, promoCode: promoApplied ? promo : '' } }); } }}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Auth Required Modal */}
    {showAuthModal && (
      <div style={s.modalOverlay} onClick={() => setShowAuthModal(false)}>
        <div style={s.modalCard} onClick={(e) => e.stopPropagation()}>
          <div style={s.modalIcon}>🔐</div>
          <h2 style={s.modalTitle}>Login Required</h2>
          <p style={s.modalSub}>Please login or create an account to proceed with your order.</p>
          <button style={s.modalLoginBtn} onClick={() => { setShowAuthModal(false); navigate('/login'); }}>Login</button>
          <button style={s.modalSignupBtn} onClick={() => { setShowAuthModal(false); navigate('/register'); }}>Register</button>
          <button style={s.modalCancelBtn} onClick={() => setShowAuthModal(false)}>Cancel</button>
        </div>
      </div>
    )}
    </>
  );
}

// Mobile styles
const m = {
  root: { minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' },
  header: {
    position: 'sticky', top: 0, zIndex: 50,
    backgroundColor: '#fff', borderBottom: '1px solid #eee',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px',
  },
  backBtn: { width: 36, height: 36, borderRadius: '50%', backgroundColor: COLORS.primary, color: '#fff', border: 'none', fontSize: 18, fontWeight: 700, cursor: 'pointer' },
  title: { fontSize: 17, fontWeight: 800, color: '#1a1a1a' },
  clearTextBtn: { background: 'none', border: 'none', color: COLORS.error, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  scrollArea: { flex: 1, padding: '12px 14px 0' },
  location: { fontSize: 13, color: '#555', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  imgBox: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#f5f5f5', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 },
  sub: { fontSize: 12, color: '#888', marginBottom: 8 },
  qtyRow: { display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 8, width: 'fit-content', overflow: 'hidden' },
  qtyBtn: { width: 32, height: 32, border: 'none', backgroundColor: '#f5f5f5', fontSize: 16, cursor: 'pointer', fontWeight: 700 },
  qty: { width: 36, textAlign: 'center', fontSize: 14, fontWeight: 700 },
  right: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#aaa' },
  itemTotal: { fontSize: 15, fontWeight: 800, color: COLORS.primary },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 10 },
  sectionLabel: { fontSize: 11, fontWeight: 800, color: '#aaa', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  promoRow: { display: 'flex', gap: 8 },
  promoInput: { flex: 1, border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', backgroundColor: '#fafafa' },
  promoBtn: { backgroundColor: COLORS.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '0 18px', cursor: 'pointer', fontWeight: 700, fontSize: 14 },
  summaryBox: { backgroundColor: '#fff', borderRadius: 12, padding: '16px', marginBottom: 10 },
  sumRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555', marginBottom: 10 },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: 14, marginTop: 4 },
  totalLabel: { fontSize: 15, fontWeight: 700, color: '#1a1a1a' },
  totalAmt: { fontSize: 20, fontWeight: 900, color: COLORS.primary },
  bottomBar: {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: '#fff', borderTop: '1px solid #eee', padding: '10px 16px',
  },
  checkoutBtn: { width: '100%', padding: '15px', backgroundColor: COLORS.primary, color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
};

// Desktop styles
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
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: '36px 28px', maxWidth: 360, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalIcon: { fontSize: 48, marginBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: 900, color: '#1a1a1a', marginBottom: 8 },
  modalSub: { fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 1.6 },
  modalLoginBtn: { display: 'block', width: '100%', padding: '13px', backgroundColor: COLORS.primary, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 },
  modalSignupBtn: { display: 'block', width: '100%', padding: '13px', backgroundColor: 'transparent', color: COLORS.primary, border: `1.5px solid ${COLORS.primary}`, borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 },
  modalCancelBtn: { display: 'block', width: '100%', padding: '11px', backgroundColor: '#f0f0f0', color: '#666', border: 'none', borderRadius: 12, fontSize: 14, cursor: 'pointer' },
};
