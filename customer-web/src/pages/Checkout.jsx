import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const ADMIN_WHATSAPP = '923001234567';
const PAYMENT_METHODS = [
  { key: 'COD', label: 'Cash on Delivery (COD)', sub: 'Pay when your groceries arrive at your door.', icon: '💵' },
  { key: 'JazzCash', label: 'Bank Transfer / JazzCash', sub: 'Securely pay via Bank App or Mobile Wallet.', icon: '📱' },
  { key: 'EasyPaisa', label: 'EasyPaisa', sub: 'Pay via EasyPaisa mobile account.', icon: '📲' },
];

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { subtotal = 0, discount = 0, deliveryFee = 150, total = 0, promoCode = '' } = state || {};

  const [form, setForm] = useState({ customerName: user?.name || '', whatsapp: user?.mobile || '', address: user?.address || '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const placeOrder = async () => {
    if (!form.customerName || !form.whatsapp || !form.address) return setError('Please fill all delivery details');
    setError('');
    setLoading(true);
    try {
      const res = await ordersAPI.place({
        user: user?._id,
        customerName: form.customerName,
        whatsapp: form.whatsapp,
        address: form.address,
        items: items.map((i) => ({ product: i._id, name: i.name, price: i.discountPrice || i.price, quantity: i.quantity, weight: i.selectedWeight, image: i.images?.[0] || '' })),
        subtotal, deliveryFee, discount, total, paymentMethod, promoCode,
      });
      clearCart();
      const orderId = res.data.orderId;

      // Open WhatsApp with order details
      const summary = items.map((i) => `• ${i.name} x${i.quantity} = Rs.${((i.discountPrice || i.price) * i.quantity).toLocaleString()}`).join('\n');
      const msg = `🛒 *New SellMix Order — #${orderId}*\n━━━━━━━━━━━━━━\n👤 ${form.customerName}\n📱 ${form.whatsapp}\n📍 ${form.address}\n━━━━━━━━━━━━━━\n${summary}\n━━━━━━━━━━━━━━\n💰 Total: *Rs. ${total.toLocaleString()}*\n💳 ${paymentMethod}`;
      window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');

      navigate(`/track?orderId=${orderId}`, { state: { success: true, orderId } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.container}>
        <h1 style={s.title}>Secure Checkout</h1>

        {/* Progress */}
        <div style={s.progress}>
          {['Cart', 'Checkout', 'Confirmation'].map((step, i) => (
            <React.Fragment key={step}>
              <div style={s.progressItem}>
                <div style={{ ...s.progressDot, ...(i <= 1 ? s.progressDotActive : {}) }}>{i + 1}</div>
                <span style={{ ...s.progressLabel, ...(i <= 1 ? { color: COLORS.primary, fontWeight: 700 } : {}) }}>{step}</span>
              </div>
              {i < 2 && <div style={{ ...s.progressLine, ...(i === 0 ? s.progressLineDone : {}) }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={s.layout}>
          {/* Left: Forms */}
          <div style={s.formCol}>
            {/* Cart Summary */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h2 style={s.cardTitle}>Cart Items ({items.length})</h2>
                <button style={s.editBtn} onClick={() => navigate('/cart')}>Edit</button>
              </div>
              {items.map((item) => (
                <div key={`${item._id}-${item.selectedWeight}`} style={s.orderItem}>
                  <div style={s.orderImgBox}>
                    {item.images?.[0] ? <img src={item.images[0]} alt={item.name} style={s.orderImg} /> : <span>🛒</span>}
                  </div>
                  <div style={s.orderInfo}>
                    <p style={s.orderName}>{item.name}</p>
                    {item.selectedWeight && <p style={s.orderSub}>{item.selectedWeight}</p>}
                    <p style={s.orderSub}>Qty: {item.quantity}</p>
                  </div>
                  <p style={s.orderPrice}>Rs. {((item.discountPrice || item.price) * item.quantity).toLocaleString()}</p>
                </div>
              ))}
              <div style={s.subtotalRow}>
                <span style={s.subtotalLabel}>Cart Subtotal</span>
                <span style={s.subtotalVal}>Rs. {subtotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Delivery */}
            <div style={s.card}>
              <h2 style={s.cardTitle}>📍 Delivery in Chichawatni</h2>
              <div style={s.field}>
                <label style={s.fieldLabel}>FULL NAME</label>
                <input style={s.input} placeholder="e.g. Muhammad Ahmed" value={form.customerName} onChange={(e) => set('customerName', e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.fieldLabel}>WHATSAPP / PHONE NUMBER</label>
                <input style={s.input} placeholder="+92 300 1234567" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.fieldLabel}>DETAILED ADDRESS & LANDMARK</label>
                <textarea style={{ ...s.input, height: 90, resize: 'vertical' }} placeholder="House #, Street, Block, or Nearby Landmark (e.g. Near Rai Ali Nawaz Hospital)" value={form.address} onChange={(e) => set('address', e.target.value)} />
              </div>
            </div>

            {/* Payment */}
            <div style={s.card}>
              <h2 style={s.cardTitle}>💳 Payment Method</h2>
              {PAYMENT_METHODS.map((m) => (
                <div
                  key={m.key}
                  style={{ ...s.payOption, ...(paymentMethod === m.key ? s.payOptionActive : {}) }}
                  onClick={() => setPaymentMethod(m.key)}
                >
                  <div style={{ flex: 1 }}>
                    <p style={s.payLabel}>{m.icon}  {m.label}</p>
                    <p style={s.paySub}>{m.sub}</p>
                  </div>
                  <div style={{ ...s.radio, ...(paymentMethod === m.key ? s.radioActive : {}) }}>
                    {paymentMethod === m.key && <div style={s.radioInner} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Total & Place Order */}
          <div style={s.summaryCol}>
            <div style={s.summaryCard}>
              <h2 style={s.cardTitle}>Order Total</h2>
              <div style={s.sumRow}><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div style={s.sumRow}><span>Discount</span><span style={{ color: COLORS.success }}>− Rs. {discount.toLocaleString()}</span></div>}
              <div style={s.sumRow}><span>Delivery Fee</span><span style={{ color: COLORS.success }}>Rs. {deliveryFee}</span></div>
              <div style={{ ...s.sumRow, ...s.totalRow }}>
                <span style={s.totalLabel}>Total Amount</span>
                <span style={s.totalAmt}>Rs. {total.toLocaleString()}</span>
              </div>

              {error && <p style={s.errorMsg}>⚠️ {error}</p>}

              <button style={s.placeBtn} onClick={placeOrder} disabled={loading}>
                {loading ? 'Placing Order...' : 'Place Order →'}
              </button>
              <p style={s.disclaimer}>By placing order, you agree to SellMix Terms of Service. Your order will be confirmed on WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { backgroundColor: COLORS.secondary, minHeight: '70vh' },
  container: { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
  title: { fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 24 },
  progress: { display: 'flex', alignItems: 'center', marginBottom: 32 },
  progressItem: { display: 'flex', alignItems: 'center', gap: 8 },
  progressDot: { width: 28, height: 28, borderRadius: '50%', backgroundColor: COLORS.lightGrey, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: COLORS.textMuted },
  progressDotActive: { backgroundColor: COLORS.primary, color: COLORS.white },
  progressLabel: { fontSize: 13, color: COLORS.textMuted },
  progressLine: { flex: 1, height: 2, backgroundColor: COLORS.border, margin: '0 8px' },
  progressLineDone: { backgroundColor: COLORS.primary },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'flex-start' },
  formCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 },
  editBtn: { color: COLORS.primary, background: 'none', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  orderItem: { display: 'flex', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottom: `1px solid ${COLORS.lightGrey}`, paddingBottom: 12, marginBottom: 12 },
  orderImgBox: { width: 50, height: 50, borderRadius: 8, backgroundColor: COLORS.lightGrey, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  orderImg: { width: '100%', height: '100%', objectFit: 'cover' },
  orderInfo: { flex: 1 },
  orderName: { fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 3 },
  orderSub: { fontSize: 12, color: COLORS.textLight },
  orderPrice: { fontSize: 14, fontWeight: 700, color: COLORS.primary },
  subtotalRow: { display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${COLORS.border}` },
  subtotalLabel: { fontSize: 15, fontWeight: 700, color: COLORS.text },
  subtotalVal: { fontSize: 15, fontWeight: 800, color: COLORS.text },
  field: { marginBottom: 16 },
  fieldLabel: { display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 8 },
  input: { width: '100%', border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', backgroundColor: COLORS.secondary, boxSizing: 'border-box' },
  payOption: { display: 'flex', alignItems: 'center', border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10, cursor: 'pointer' },
  payOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  payLabel: { fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 4 },
  paySub: { fontSize: 12, color: COLORS.textLight },
  radio: { width: 22, height: 22, borderRadius: '50%', border: `2px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.primary },
  summaryCol: { position: 'sticky', top: 80 },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  sumRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: COLORS.textLight, marginBottom: 10 },
  totalRow: { borderTop: `1px solid ${COLORS.border}`, paddingTop: 14, marginTop: 4, marginBottom: 20 },
  totalLabel: { fontSize: 17, fontWeight: 700, color: COLORS.text },
  totalAmt: { fontSize: 26, fontWeight: 900, color: COLORS.primary },
  errorMsg: { backgroundColor: '#FFF3F3', color: COLORS.error, padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 },
  placeBtn: { width: '100%', padding: '15px', backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 12 },
  disclaimer: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 1.6 },
};
